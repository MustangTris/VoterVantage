/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, FileSpreadsheet, File, AlertCircle, Check, Loader2, ArrowRight, ArrowLeft, Database, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- Configuration ---
type FieldDefinition = {
    key: string
    label: string
    description: string
    required: boolean
    aliases: string[] // strings to auto-match against
}

const REQUIRED_FIELDS: FieldDefinition[] = [
    { key: "Filer_NamL", label: "Filer Name", description: "Campaign/Committee Name", required: true, aliases: ["filer", "committee", "candidate"] },
    { key: "Filer_ID", label: "Filer ID", description: "State/City ID", required: true, aliases: ["id", "filer_id"] },
    { key: "Entity_Name", label: "Contributor/Payee", description: "Who gave/received money", required: true, aliases: ["tran_nam", "payee", "contributor", "name", "entity"] },
    { key: "Amount", label: "Amount", description: "Transaction value", required: true, aliases: ["amount", "amt", "payment", "received"] },
    { key: "Tran_Date", label: "Date", description: "Transaction Date", required: false, aliases: ["date", "time", "day", "rpt_date"] },
    // Expanded Fields
    { key: "Tran_Adr1", label: "Address", description: "Street Address", required: false, aliases: ["addr", "street", "address"] },
    { key: "Tran_City", label: "City", description: "City", required: false, aliases: ["city"] },
    { key: "Tran_State", label: "State", description: "State", required: false, aliases: ["state"] },
    { key: "Tran_Zip4", label: "Zip Code", description: "Zip Code", required: false, aliases: ["zip", "postal"] },
    { key: "Tran_Emp", label: "Employer", description: "Contributor Employer", required: false, aliases: ["employer", "emp"] },
    { key: "Tran_Occ", label: "Occupation", description: "Contributor Occupation", required: false, aliases: ["occupation", "occ", "job"] },
]

type WizardStep = "UPLOAD" | "MAP" | "PREVIEW"

export default function UploadPage() {
    // -- State --
    const [step, setStep] = useState<WizardStep>("UPLOAD")

    // Upload State
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Excel State
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
    const [sheets, setSheets] = useState<string[]>([])
    const [selectedSheet, setSelectedSheet] = useState<string | null>(null)
    const [rawHeaders, setRawHeaders] = useState<string[]>([])
    const [rawData, setRawData] = useState<any[]>([])

    // Mapping State
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({}) // FieldKey -> FileHeader

    // -- Step 1: File Handling --

    const handleFile = async (selectedFile: File) => {
        setFile(selectedFile)
        setError(null)
        setWorkbook(null)
        setSheets([])

        if (selectedFile.name.endsWith(".pdf")) {
            // PDFs skip mapping/validation
            return
        }

        if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
            setError("Unsupported format. Please upload Excel or CSV.")
            return
        }

        setIsProcessing(true)
        try {
            const buf = await selectedFile.arrayBuffer()
            const wb = XLSX.read(buf)
            setWorkbook(wb)

            if (wb.SheetNames.length === 0) throw new Error("Empty file")

            setSheets(wb.SheetNames)
            selectSheet(wb, wb.SheetNames[0])
            setStep("MAP") // Auto-advance to mapping
        } catch (err) {
            console.error(err)
            setError("Failed to parse spreadsheet.")
            setFile(null)
        } finally {
            setIsProcessing(false)
        }
    }

    const selectSheet = (wb: XLSX.WorkBook, sheetName: string) => {
        setSelectedSheet(sheetName)
        const ws = wb.Sheets[sheetName]

        // Parse raw data. defval:"" ensures we get content for empty cells if needed, but Utils sheet_to_json is cleaner without it usually.
        // We use header:1 to get headers, but let's just use json which is easier for now.
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" })
        setRawData(json as any[])

        // Extract headers from first row
        if (json.length > 0) {
            const headers = Object.keys(json[0] as object)
            setRawHeaders(headers)
            autoMapColumns(headers)
        }
    }

    // -- Step 2: Mapping Logic --

    const autoMapColumns = (headers: string[]) => {
        const newMapping: Record<string, string> = {}
        const normalizedHeaders = headers.map(h => ({ raw: h, norm: h.toLowerCase().replace(/[^a-z0-9]/g, "") }))

        REQUIRED_FIELDS.forEach(field => {
            // 1. Try exact match
            const exact = normalizedHeaders.find(h => h.raw === field.key)
            if (exact) {
                newMapping[field.key] = exact.raw
                return
            }
            // 2. Try alias match
            for (const alias of field.aliases) {
                const match = normalizedHeaders.find(h => h.norm.includes(alias))
                if (match) {
                    newMapping[field.key] = match.raw
                    break
                }
            }
        })
        setColumnMapping(newMapping)
    }

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0])
    }

    // -- Step 3: Validation & preview --

    const validatedData = useMemo(() => {
        if (!rawData.length) return { valid: [], invalid: [] }

        const valid: any[] = []
        const invalid: { row: number, reason: string, data: any }[] = []

        rawData.forEach((row, idx) => {
            const mappedRow: any = {}
            const missingFields: string[] = []

            REQUIRED_FIELDS.forEach(field => {
                const sourceHeader = columnMapping[field.key]
                const value = sourceHeader ? row[sourceHeader] : undefined

                if (field.required && (value === undefined || value === null || value === "")) {
                    missingFields.push(field.label)
                }

                // Normalization for specific keys (mimicking actions.ts logic)
                if (field.key === "Amount" && value) {
                    const clean = String(value).replace(/[^0-9.-]+/g, "")
                    mappedRow[field.key] = parseFloat(clean)
                } else {
                    mappedRow[field.key] = value
                }
            })

            if (missingFields.length > 0) {
                invalid.push({ row: idx + 2, reason: `Missing: ${missingFields.join(", ")}`, data: row })
            } else {
                valid.push(mappedRow)
            }
        })

        return { valid, invalid }
    }, [rawData, columnMapping])


    const handleSubmit = async () => {
        if (!file) return
        setIsProcessing(true)

        try {
            // Upload File
            const { createClient } = await import("@/lib/supabase/client")
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(7)}.${fileExt}`

            const { error: uploadErr } = await supabase.storage.from('filings').upload(path, file)
            if (uploadErr) throw new Error("Storage upload failed")

            const { data: { publicUrl } } = supabase.storage.from('filings').getPublicUrl(path)

            // For Excel: Use validated data. For PDF: submit empty (actions handles file only)
            const payload = file.name.endsWith(".pdf") ? [] : validatedData.valid

            // Submit
            const { submitUpload } = await import("./actions")
            const res = await submitUpload(payload, publicUrl)

            if (res.success) {
                alert(`Success! Imported ${res.count} records.`)
                setStep("UPLOAD")
                setFile(null)
                setRawData([])
            } else {
                setError(res.message || "Submission failed")
            }

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsProcessing(false)
        }
    }


    // --- Renders ---

    const renderUpload = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">Upload Data</h1>
                <p className="text-slate-500">Upload Excel/CSV files or PDF filings.</p>
            </div>

            <Card
                className={cn(
                    "border-2 border-dashed transition-all py-12 cursor-pointer",
                    isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
            >
                <div className="flex flex-col items-center text-center">
                    <input id="file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv,.pdf" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                        <Upload className="h-8 w-8" />
                    </div>
                    <div className="text-slate-900 font-semibold mb-1">Click to upload or drag & drop</div>
                    <div className="text-slate-500 text-sm">Supported: .xlsx, .csv, .pdf</div>
                </div>
            </Card>

            {/* If PDF, show ready state directly since no mapping needed */}
            {file && file.name.endsWith(".pdf") && (
                <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
                    <div className="flex items-center gap-3">
                        <File className="h-8 w-8 text-blue-600" />
                        <div>
                            <div className="font-semibold text-blue-900">{file.name}</div>
                            <div className="text-sm text-blue-700">Ready to upload (PDF)</div>
                        </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload PDF"}
                    </Button>
                </div>
            )}
        </div>
    )

    const renderMap = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setStep("UPLOAD")}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Map Columns</h1>
                    <p className="text-slate-500">Match your Excel columns to our database fields</p>
                </div>
            </div>

            {/* Sheet Selector */}
            {sheets.length > 1 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                    <span className="text-sm font-medium text-yellow-800">Source Sheet:</span>
                    <Select
                        value={selectedSheet || ""}
                        onValueChange={(val) => {
                            if (workbook) selectSheet(workbook, val)
                        }}
                    >
                        <SelectTrigger className="w-[200px] bg-white text-slate-900 border-yellow-300">
                            <SelectValue placeholder="Select sheet" />
                        </SelectTrigger>
                        <SelectContent>
                            {sheets.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {REQUIRED_FIELDS.map(field => (
                    <Card key={field.key} className={cn("border-l-4", columnMapping[field.key] ? "border-l-green-500" : "border-l-slate-200")}>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium flex justify-between">
                                {field.label}
                                {field.required && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
                            </CardTitle>
                            <CardDescription className="text-xs">{field.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <Select
                                value={columnMapping[field.key] || "ignore"}
                                onValueChange={(val) => setColumnMapping(prev => ({ ...prev, [field.key]: val === "ignore" ? "" : val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select column..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ignore" className="text-slate-400 font-medium">-- Unmapped --</SelectItem>
                                    {rawHeaders.map(h => (
                                        <SelectItem key={h} value={h}>{h}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => { setFile(null); setStep("UPLOAD"); }}>Cancel</Button>
                <Button onClick={() => setStep("PREVIEW")} disabled={REQUIRED_FIELDS.some(f => f.required && !columnMapping[f.key])}>
                    Next: Validate & Preview <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )

    const renderPreview = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setStep("MAP")}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Validate Data</h1>
                    <p className="text-slate-500">Review validation results before submitting</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Check className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-900">{validatedData.valid.length}</div>
                            <div className="text-sm text-green-700 font-medium">Valid Records</div>
                            <div className="text-xs text-green-600 mt-1">Ready to import</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn("border-2", validatedData.invalid.length > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100")}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", validatedData.invalid.length > 0 ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-500")}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <div className={cn("text-2xl font-bold", validatedData.invalid.length > 0 ? "text-red-900" : "text-slate-700")}>{validatedData.invalid.length}</div>
                            <div className={cn("text-sm font-medium", validatedData.invalid.length > 0 ? "text-red-700" : "text-slate-500")}>Invalid Records</div>
                            <div className={cn("text-xs mt-1", validatedData.invalid.length > 0 ? "text-red-600" : "text-slate-400")}>Will be skipped</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Valid Data Preview */}
            <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Preview (First 5 Valid)</h3>
                <div className="border rounded-lg overflow-auto max-h-60 bg-white">
                    <table className="w-full text-sm text-center">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                {REQUIRED_FIELDS.map(f => <th key={f.key} className="px-3 py-2 border-b font-medium">{f.label}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {validatedData.valid.slice(0, 5).map((row, i) => (
                                <tr key={i}>
                                    {REQUIRED_FIELDS.map(f => <td key={f.key} className="px-3 py-2">{row[f.key]}</td>)}
                                </tr>
                            ))}
                            {validatedData.valid.length === 0 && <tr><td colSpan={REQUIRED_FIELDS.length} className="py-4 text-slate-400">No valid data found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setStep("MAP")}>Back</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={validatedData.valid.length === 0 || isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                    Import {validatedData.valid.length} Records
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> {error}
                </div>
            )}
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto py-8">
            {step === "UPLOAD" && renderUpload()}
            {step === "MAP" && renderMap()}
            {step === "PREVIEW" && renderPreview()}
        </div>
    )
}
