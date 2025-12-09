/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, File, AlertCircle, Check, Loader2, ArrowRight, ArrowLeft, Database, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DebugConsole } from "@/components/debug-console"
import { createClient } from "@/lib/supabase/client"
import { TransactionSchema, cleanRow } from "@/lib/validators/transaction"

// --- Configuration ---
type FieldDefinition = {
    key: string
    label: string
    description: string
    required: boolean
    aliases: string[] // strings to auto-match against
}

const REQUIRED_FIELDS: FieldDefinition[] = [
    { key: "Filer_NamL", label: "Filer Name", description: "Campaign/Committee Name", required: false, aliases: ["filer", "committee", "candidate"] },
    { key: "Filer_ID", label: "Filer ID", description: "State/City ID", required: false, aliases: ["id", "filer_id"] },
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

// --- Utils ---
const detectSheetType = (name: string): 'CONTRIBUTION' | 'EXPENDITURE' | 'UNKNOWN' => {
    const n = name.toLowerCase()
    if (n.match(/(expend|payment|bill|expense|sched e|schedule e|disbursement|expn)/)) return 'EXPENDITURE'
    if (n.match(/(receipt|contrib|donation|sched a|schedule a|rcpt|income)/)) return 'CONTRIBUTION'
    return 'UNKNOWN'
}

const generateAutoMapping = (headers: string[]): Record<string, string> => {
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
    return newMapping
}

type ProcessedSheet = {
    id: string
    name: string
    type: 'CONTRIBUTION' | 'EXPENDITURE' | 'UNKNOWN'
    headers: string[]
    rows: any[]
    mapping: Record<string, string>
}

type WizardStep = "UPLOAD" | "MAP" | "PREVIEW"

export default function UploadPage() {
    // -- State --
    const [step, setStep] = useState<WizardStep>("UPLOAD")

    // Upload State
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [chunkProgress, setChunkProgress] = useState<string | null>(null)

    // Multi-Sheet State
    const [processedSheets, setProcessedSheets] = useState<ProcessedSheet[]>([])
    const [activeSheetIdx, setActiveSheetIdx] = useState<number>(0)
    const activeSheet = processedSheets[activeSheetIdx]

    // -- Step 1: File Handling --

    const handleFile = async (selectedFile: File) => {
        setFile(selectedFile)
        setError(null)
        setProcessedSheets([])
        setActiveSheetIdx(0)

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
            if (selectedFile.name.endsWith(".csv")) {
                // PAPAPARSE for CSV
                Papa.parse(selectedFile, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const headers = results.meta.fields || []
                        const rows = results.data
                        if (rows.length > 0) {
                            const mapping = generateAutoMapping(headers)
                            setProcessedSheets([{
                                id: "csv-main",
                                name: selectedFile.name,
                                type: detectSheetType(selectedFile.name),
                                headers,
                                rows,
                                mapping
                            }])
                            setStep("MAP")
                        } else {
                            setError("CSV file is empty.")
                            setFile(null)
                        }
                        setIsProcessing(false)
                    },
                    error: (err) => {
                        setError(`CSV Parse Error: ${err.message}`)
                        setIsProcessing(false)
                    }
                })
            } else {
                // XLSX for Excel
                const buf = await selectedFile.arrayBuffer()
                const wb = XLSX.read(buf)

                if (wb.SheetNames.length === 0) throw new Error("Empty file")

                const newSheets: ProcessedSheet[] = []

                wb.SheetNames.forEach(sheetName => {
                    const type = detectSheetType(sheetName)
                    const ws = wb.Sheets[sheetName]
                    const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[]

                    if (json.length > 0) {
                        const headers = Object.keys(json[0] as object)
                        const mapping = generateAutoMapping(headers)

                        newSheets.push({
                            id: sheetName,
                            name: sheetName,
                            type,
                            headers,
                            rows: json,
                            mapping
                        })
                    }
                })

                if (newSheets.length === 0) throw new Error("No data found in file")

                setProcessedSheets(newSheets)
                setStep("MAP")
                setIsProcessing(false)
            }

        } catch (err: any) {
            console.error(err)
            setError(err.message || "Failed to parse spreadsheet.")
            setFile(null)
            setIsProcessing(false)
        }
    }

    const updateMapping = (fieldKey: string, header: string) => {
        if (!activeSheet) return
        const updated = [...processedSheets]
        updated[activeSheetIdx] = {
            ...activeSheet,
            mapping: { ...activeSheet.mapping, [fieldKey]: header }
        }
        setProcessedSheets(updated)
    }

    // Helper to switch mapping type
    const updateSheetType = (type: 'CONTRIBUTION' | 'EXPENDITURE') => {
        if (!activeSheet) return
        const updated = [...processedSheets]
        updated[activeSheetIdx] = { ...activeSheet, type }
        setProcessedSheets(updated)
    }

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0])
    }

    // -- Step 3: Validation & preview --

    const validatedData = useMemo(() => {
        const valid: any[] = []
        const invalid: { sheet: string, row: number, reason: string, data: any }[] = []

        processedSheets.forEach(sheet => {
            const { mapping, rows, type } = sheet

            rows.forEach((row, idx) => {
                const mappedRow: any = {}
                const missingFields: string[] = []

                // 1. Map Data
                REQUIRED_FIELDS.forEach(field => {
                    const sourceHeader = mapping[field.key]
                    const value = sourceHeader ? row[sourceHeader] : undefined

                    if (field.required && (value === undefined || value === null || value === "")) {
                        missingFields.push(field.label)
                    }
                    mappedRow[field.key] = value
                })

                // Inject Rec_Type if known (and not overridden)
                if (type !== 'UNKNOWN' && !mappedRow['Rec_Type']) {
                    mappedRow['Rec_Type'] = type
                }

                // 2. Pre-clean
                const cleanedForZod = cleanRow(mappedRow)

                // 3. Zod Validation
                const zodResult = TransactionSchema.safeParse(cleanedForZod)

                if (!zodResult.success) {
                    const issues = (zodResult.error as any).errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
                    invalid.push({ sheet: sheet.name, row: idx + 2, reason: issues, data: row })
                } else if (missingFields.length > 0) {
                    invalid.push({ sheet: sheet.name, row: idx + 2, reason: `Missing: ${missingFields.join(", ")}`, data: row })
                } else {
                    valid.push(zodResult.data)
                }
            })
        })

        return { valid, invalid }
    }, [processedSheets])


    const handleSubmit = async () => {
        if (!file) return
        setIsProcessing(true)
        setChunkProgress("Starting upload...")
        setError(null)
        const supabase = createClient()

        let storagePath: string | null = null

        try {
            // 1. Archival: Upload Raw File
            const fileExt = file.name.split('.').pop()
            const fileName = `raw_uploads/${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`

            const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('filings') // Using 'filings' bucket as per existing setup
                .upload(fileName, file)

            if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`)

            storagePath = fileName
            setChunkProgress("File archived. Starting import...")

            // 2. Database Insert (Chunked)
            const payload = file.name.endsWith(".pdf") ? [] : validatedData.valid

            if (payload.length > 0) {
                const BATCH_SIZE = 1000
                const totalBatches = Math.ceil(payload.length / BATCH_SIZE)

                // Create a placeholder filing record first? 
                // The old 'actions' did this. We should probably recreate a minimal filing record to link transactions to.
                // For now, let's just insert transactions assuming they might be linked later or just raw. 
                // Actually, transactions usually need a 'filing_id'. 
                // Let's create a 'filings' record first via client if RLS allows.

                const { data: filingData, error: filingError } = await supabase
                    .from('filings')
                    .insert({
                        filer_name: payload[0].Filer_NamL || 'Unknown Filer',
                        status: 'PROCESSING',
                        source_file_url: storagePath
                    })
                    .select()
                    .single()

                if (filingError) throw new Error(`Failed to create filing: ${filingError.message}`)
                const filingId = filingData.id

                for (let i = 0; i < payload.length; i += BATCH_SIZE) {
                    setChunkProgress(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${totalBatches}...`)
                    const batch = payload.slice(i, i + BATCH_SIZE).map(row => ({
                        // Map Zod keys to DB keys if they differ. 
                        // Our Zod schema uses 'Tran_NamL' etc which might match DB or legacy.
                        // The DB schema in 'actions.ts' had lowercase snake_case columns.
                        // We need to map Zod (PascalCase-ish) to DB (snake_case).

                        filing_id: filingId,
                        transaction_type: row.Rec_Type || 'UNKNOWN',
                        entity_name: row.Entity_Name,
                        amount: row.Amount,
                        transaction_date: row.Tran_Date,

                        entity_city: row.Tran_City,
                        entity_state: row.Tran_State,
                        entity_zip: row.Tran_Zip4,
                        contributor_employer: row.Tran_Emp,
                        contributor_occupation: row.Tran_Occ,

                        // Add other fields as necessary from schema...
                        description: "Imported via Client Upload"
                    }))

                    const { error: insertError } = await supabase
                        .from('transactions')
                        .insert(batch)

                    if (insertError) {
                        // Compensation: Delete file? Or just stop?
                        throw new Error(`Batch insert failed: ${insertError.message}`)
                    }
                }
            }

            alert(`Success! processed file & imported ${payload.length} records.`)
            setStep("UPLOAD")
            setFile(null)
            setProcessedSheets([])

        } catch (err: any) {
            console.error(err)
            setError(err.message)

            // Compensation: Clean up storage if DB failed?
            if (storagePath) {
                console.log("Compensating: Deleting orphaned file...")
                await supabase.storage.from('filings').remove([storagePath])
            }
        } finally {
            setIsProcessing(false)
            setChunkProgress(null)
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

    const renderMap = () => {
        if (!activeSheet) return <div>No data loaded.</div>

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setStep("UPLOAD")}><ArrowLeft className="h-4 w-4" /></Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Map Columns</h1>
                        <p className="text-slate-500">Configure mapping for each sheet</p>
                    </div>
                </div>

                {/* Custom Tabs */}
                {processedSheets.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                        {processedSheets.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSheetIdx(idx)}
                                className={cn(
                                    "px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2",
                                    activeSheetIdx === idx
                                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {s.name}
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full uppercase",
                                        s.type === 'CONTRIBUTION' ? "bg-green-100 text-green-700" :
                                            s.type === 'EXPENDITURE' ? "bg-orange-100 text-orange-700" :
                                                "bg-slate-100 text-slate-500"
                                    )}>
                                        {s.type === 'UNKNOWN' ? '?' : s.type.slice(0, 3)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Sheet Config Bar */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Sheet Type:</span>
                        <Select
                            value={activeSheet.type}
                            onValueChange={(val: any) => updateSheetType(val)}
                        >
                            <SelectTrigger className="w-[180px] bg-white h-8 text-xs text-slate-900 border-slate-300">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-slate-900 border-slate-200">
                                <SelectItem value="CONTRIBUTION">Contribution (Receipts)</SelectItem>
                                <SelectItem value="EXPENDITURE">Expenditure (Payments)</SelectItem>
                                <SelectItem value="UNKNOWN">Other / Unknown</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-xs text-slate-500">
                        {activeSheet.rows.length} rows detected
                    </div>
                </div>


                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {REQUIRED_FIELDS.map(field => (
                        <Card key={field.key} className={cn("border-l-4", activeSheet.mapping[field.key] ? "border-l-green-500" : "border-l-slate-200")}>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className=" text-sm font-medium flex justify-between">
                                    {field.label}
                                    {field.required && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
                                </CardTitle>
                                <CardDescription className="text-xs">{field.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <Select
                                    value={activeSheet.mapping[field.key] || "ignore"}
                                    onValueChange={(val) => updateMapping(field.key, val === "ignore" ? "" : val)}
                                >
                                    <SelectTrigger className="text-slate-900 border-slate-300">
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-slate-900 border-slate-200">
                                        <SelectItem value="ignore" className="text-slate-400 font-medium">-- Unmapped --</SelectItem>
                                        {activeSheet.headers.map(h => (
                                            <SelectItem key={h} value={h} className="text-slate-900">{h}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button variant="outline" onClick={() => { setFile(null); setStep("UPLOAD"); }}>Cancel</Button>
                    <Button onClick={() => setStep("PREVIEW")} disabled={
                        processedSheets.some(s =>
                            s.type !== 'UNKNOWN' &&
                            REQUIRED_FIELDS.some(f => f.required && !s.mapping[f.key])
                        )
                    }>
                        Next: Validate All <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    const renderPreview = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setStep("MAP")}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Validate Data</h1>
                    <p className="text-slate-500">Aggregated results from {processedSheets.length} sheets</p>
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
                            <div className={cn("text-xs mt-1", validatedData.invalid.length > 0 ? "text-red-600" : "text-slate-400")}>
                                {validatedData.invalid.length > 0 ? "Strict validation failed" : "Will be skipped"}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invalid Reasons List */}
            {validatedData.invalid.length > 0 && (
                <div className="border border-red-100 bg-red-50 rounded-lg p-4 max-h-40 overflow-auto">
                    <h4 className="font-semibold text-red-800 text-sm mb-2">Errors Found:</h4>
                    <ul className="text-xs text-red-700 space-y-1">
                        {validatedData.invalid.slice(0, 10).map((inv, i) => (
                            <li key={i}>Row {inv.row} ({inv.sheet}): {inv.reason}</li>
                        ))}
                        {validatedData.invalid.length > 10 && <li>...and {validatedData.invalid.length - 10} more.</li>}
                    </ul>
                </div>
            )}

            {/* Valid Data Preview */}
            <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Preview (First 5 Valid)</h3>
                <div className="border rounded-lg overflow-auto max-h-60 bg-white">
                    <table className="w-full text-sm text-center text-slate-900">
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
                <Button variant="outline" onClick={() => { setFile(null); setStep("MAP") }}>Back</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={validatedData.valid.length === 0 || isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                    {isProcessing ? (chunkProgress || "Processing...") : `Import ${validatedData.valid.length} Records`}
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

            <DebugConsole />
        </div>
    )
}
