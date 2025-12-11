/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from "@/components/ui/glass-card"
import { Upload, File, AlertCircle, Check, Loader2, ArrowRight, ArrowLeft, Database, AlertTriangle, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DebugConsole } from "@/components/debug-console"
import { createClient } from "@/lib/supabase/client"
import { TransactionSchema, cleanRow } from "@/lib/validators/transaction"
import { authAction } from "./actions"
import { createFilingHeader, importTransactionBatch, finalizeFiling } from "./server-actions"

// --- Configuration ---
type FieldDefinition = {
    key: string
    label: string
    description: string
    required: boolean
    aliases: string[] // strings to auto-match against
}

const REQUIRED_FIELDS: FieldDefinition[] = [
    { key: "Filer_NamL", label: "Filer Name", description: "Campaign/Committee Name", required: false, aliases: ["filer_naml", "filer", "committee", "candidate"] },
    { key: "Filer_ID", label: "Filer ID", description: "State/City ID", required: false, aliases: ["filer_id", "id"] },
    { key: "Entity_Name", label: "Contributor/Payee (Last/Full)", description: "Who gave/received money", required: true, aliases: ["tran_naml", "tran_nam", "payee_naml", "payee_nams", "bal_name", "enty_naml", "payee", "contributor", "name", "entity", "recipient", "vendor", "beneficiary", "organization", "payee_name"] },
    { key: "Entity_NamF", label: "Contributor First Name", description: "First Name (if split)", required: false, aliases: ["tran_namf", "payee_namf", "enty_namf", "fname", "first_name", "contributor_first", "recipient_first", "vendor_first", "payee_first"] },
    { key: "Entity_Cd", label: "Entity Code", description: "Entity type (IND/COM/OTH/SCC)", required: false, aliases: ["entity_cd", "entitycd", "entity_code"] },
    { key: "Amount", label: "Amount", description: "Transaction value", required: true, aliases: ["tran_amt1", "tran_amt2", "amount", "amt", "payment", "received"] },
    { key: "Tran_Date", label: "Date", description: "Transaction Date", required: false, aliases: ["tran_date", "expn_date", "ctrib_date", "date", "time", "day", "rpt_date"] },
    // Expanded Fields
    { key: "Tran_Adr1", label: "Address", description: "Street Address", required: false, aliases: ["tran_adr1", "payee_adr1", "enty_adr1", "addr", "street", "address"] },
    { key: "Tran_City", label: "City", description: "City", required: false, aliases: ["tran_city", "payee_city", "enty_city", "city"] },
    { key: "Tran_State", label: "State", description: "State", required: false, aliases: ["tran_state", "payee_state", "enty_st", "state"] },
    { key: "Tran_Zip4", label: "Zip Code", description: "Zip Code", required: false, aliases: ["tran_zip4", "payee_zip4", "payee_zip", "enty_zip4", "zip", "postal"] },
    { key: "Tran_Adr1", label: "Address Line 1", description: "Street Address", required: false, aliases: ["tran_adr1", "addr1", "address1", "street", "address"] },
    { key: "Tran_Adr2", label: "Address Line 2", description: "Apt/Suite/Unit", required: false, aliases: ["tran_adr2", "payee_adr2", "enty_adr2", "addr2", "address2", "apt", "suite", "unit"] },
    { key: "Tran_Emp", label: "Employer", description: "Contributor Employer", required: false, aliases: ["tran_emp", "ctrib_emp", "employer", "emp"] },
    { key: "Tran_Occ", label: "Occupation", description: "Contributor Occupation", required: false, aliases: ["tran_occ", "ctrib_occ", "occupation", "occ", "job"] },

    // --- Treasurer (Committees) ---
    { key: "Tres_NamL", label: "Treasurer Last Name", description: "Treasurer Last Name", required: false, aliases: ["tres_naml"] },
    { key: "Tres_NamF", label: "Treasurer First Name", description: "Treasurer First Name", required: false, aliases: ["tres_namf"] },
    { key: "Tres_Adr1", label: "Treasurer Address 1", description: "Treasurer Address", required: false, aliases: ["tres_adr1"] },
    { key: "Tres_City", label: "Treasurer City", description: "Treasurer City", required: false, aliases: ["tres_city"] },
    { key: "Tres_ST", label: "Treasurer State", description: "Treasurer State", required: false, aliases: ["tres_st"] },
    { key: "Tres_ZIP4", label: "Treasurer Zip", description: "Treasurer Zip", required: false, aliases: ["tres_zip4"] },

    // --- Intermediary ---
    { key: "Intr_NamL", label: "Intermediary Last Name", description: "Intermediary Last Name", required: false, aliases: ["intr_naml"] },
    { key: "Intr_NamF", label: "Intermediary First Name", description: "Intermediary First Name", required: false, aliases: ["intr_namf"] },
    { key: "Intr_Adr1", label: "Intermediary Address 1", description: "Intermediary Address", required: false, aliases: ["intr_adr1"] },
    { key: "Intr_City", label: "Intermediary City", description: "Intermediary City", required: false, aliases: ["intr_city"] },
    { key: "Intr_Emp", label: "Intermediary Employer", description: "Intermediary Employer", required: false, aliases: ["intr_emp"] },

    // --- Memo / Admin ---
    { key: "Memo_Code", label: "Memo Code", description: "Memo / Description Code", required: false, aliases: ["memo_code"] },
    { key: "Memo_RefNo", label: "Memo Ref No", description: "Reference Number", required: false, aliases: ["memo_refno"] },
    { key: "Tran_ID", label: "Transaction ID", description: "External ID", required: false, aliases: ["tran_id"] },
]

// --- Utils ---
const detectSheetType = (name: string): 'CONTRIBUTION' | 'EXPENDITURE' | 'UNKNOWN' => {
    const n = name.toLowerCase()
    if (n.match(/(expend|payment|bill|expense|sched e|schedule e|disbursement|expn)/)) return 'EXPENDITURE'
    if (n.match(/(receipt|contrib|donation|sched a|schedule a|rcpt|income)/)) return 'CONTRIBUTION'
    return 'UNKNOWN'
}

// Detect entity code from sheet name (IND, COM, OTH, SCC)
const detectEntityCode = (name: string): string | null => {
    const n = name.toUpperCase()
    // Check for explicit entity code patterns
    if (n.match(/\bIND\b/)) return 'IND' // Individual
    if (n.match(/\bCOM\b/)) return 'COM' // Committee
    if (n.match(/\bSCC\b/)) return 'SCC' // Small Contributor Committee
    if (n.match(/\bOTH\b/)) return 'OTH' // Other
    return null
}

const generateAutoMapping = (headers: string[]): Record<string, string> => {
    const newMapping: Record<string, string> = {}
    // Pre-normalization for smarter matching
    const normalizedHeaders = headers.map(h => ({
        raw: h,
        norm: h.toLowerCase().replace(/[^a-z0-9]/g, ""),
        lower: h.toLowerCase()
    }))

    REQUIRED_FIELDS.forEach(field => {
        // 1. Try exact match (case insensitive) on the key itself
        const exact = normalizedHeaders.find(h => h.raw === field.key || h.lower === field.key.toLowerCase())
        if (exact) {
            newMapping[field.key] = exact.raw
            return
        }

        // 2. Try alias matches with priority
        for (const alias of field.aliases) {
            // Priority A: Exact match of alias
            let match = normalizedHeaders.find(h => h.lower === alias || h.norm === alias)

            // Priority B: "Starts with" alias (e.g. "Amount Used" for "Amount")
            if (!match) {
                match = normalizedHeaders.find(h => h.lower.startsWith(alias))
            }

            // Priority C: "Ends with" alias (e.g. "Total Amount" for "Amount")
            if (!match) {
                match = normalizedHeaders.find(h => h.lower.endsWith(alias))
            }

            // Priority D: Contains alias (Risky, but sometimes needed)
            // Only use if alias length > 3 to avoid matching "id" in "Valid"
            if (!match && alias.length > 3) {
                match = normalizedHeaders.find(h => h.norm.includes(alias))
            }

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
    entityCode?: string | null // Entity code detected from sheet name
}

type WizardStep = "UPLOAD" | "MAP" | "PREVIEW"

const CopyButton = ({ text, label = "Copy", className }: { text: string, label?: string, className?: string }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            size="sm"
            variant="outline"
            className={cn(
                "transition-all duration-300",
                copied ? "border-green-500/50 bg-green-500/10 text-green-400" : "hover:bg-white/10",
                className
            )}
            onClick={handleCopy}
        >
            <div className="relative flex items-center justify-center min-w-[4rem]">
                <div className={cn("flex items-center transition-all duration-300 absolute", copied ? "opacity-0 scale-75" : "opacity-100 scale-100")}>
                    <Copy className="h-3 w-3 mr-1" /> {label}
                </div>
                <div className={cn("flex items-center transition-all duration-300", copied ? "opacity-100 scale-100" : "opacity-0 scale-75")}>
                    <Check className="h-3 w-3 mr-1" /> Copied!
                </div>
            </div>
        </Button>
    )
}

export default function UploadPage() {
    // -- State --
    const [step, setStep] = useState<WizardStep>("UPLOAD")

    // Upload State
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [chunkProgress, setChunkProgress] = useState<string | null>(null)
    const [jurisdiction, setJurisdiction] = useState("")
    const [jurisdictionType, setJurisdictionType] = useState<"CITY" | "COUNTY">("CITY")

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
        // Reset jurisdiction if needed, or keep it per user preference? Let's keep it.

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
                            const entityCode = detectEntityCode(selectedFile.name)
                            setProcessedSheets([{
                                id: "csv-main",
                                name: selectedFile.name,
                                type: detectSheetType(selectedFile.name),
                                headers,
                                rows,
                                mapping,
                                entityCode // Also detect entity code from CSV filename
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
                    const entityCode = detectEntityCode(sheetName)
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
                            mapping,
                            entityCode // Store entity code for later use
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
        let debugError: string | null = null

        const debugInfo = {
            sheetCount: processedSheets.length,
            totalRows: 0,
            rowsProcessed: 0,
            sampleRowKeys: processedSheets[0]?.rows[0] ? Object.keys(processedSheets[0].rows[0]) : [],
            activeMapping: processedSheets[0]?.mapping
        }

        try {
            console.log("Starting validation...", processedSheets)
            processedSheets.forEach(sheet => {
                const { mapping, rows, type, entityCode } = sheet
                console.log(`Processing sheet ${sheet.name} with ${rows?.length} rows, entityCode: ${entityCode}`)

                // Skip validation for unknown sheet types (like Summary, 497, etc.)
                if (type === 'UNKNOWN') {
                    console.log(`Skipping validation for unknown sheet type: ${sheet.name}`)
                    return
                }

                debugInfo.totalRows += rows?.length || 0

                rows.forEach((row, idx) => {
                    debugInfo.rowsProcessed++
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
                    if (!mappedRow['Rec_Type']) {
                        mappedRow['Rec_Type'] = type
                    }

                    // Inject Entity_Cd: prioritize mapped column, then sheet name detection, then null
                    if (!mappedRow['Entity_Cd'] && entityCode) {
                        mappedRow['Entity_Cd'] = entityCode
                    }

                    // 2. Pre-clean
                    // Wrap in try-catch for individual row safety
                    let cleanedForZod
                    try {
                        cleanedForZod = cleanRow(mappedRow)
                    } catch (rowErr) {
                        invalid.push({ sheet: sheet.name, row: idx + 2, reason: "Row processing error", data: row })
                        return
                    }

                    // 3. Zod Validation
                    const zodResult = TransactionSchema.safeParse(cleanedForZod)

                    if (!zodResult.success) {
                        let issues = "Validation Failed"
                        // Safer error extraction
                        if (zodResult.error && 'errors' in zodResult.error && Array.isArray(zodResult.error.errors)) {
                            issues = zodResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
                        } else if (zodResult.error instanceof Error) {
                            issues = zodResult.error.message
                        } else {
                            try {
                                issues = JSON.stringify(zodResult.error)
                            } catch (e) { issues = "Unknown validation error object" }
                        }

                        invalid.push({ sheet: sheet.name, row: idx + 2, reason: issues, data: row })
                    } else if (missingFields.length > 0) {
                        invalid.push({ sheet: sheet.name, row: idx + 2, reason: `Missing: ${missingFields.join(", ")}`, data: row })
                    } else {
                        valid.push(zodResult.data)
                    }
                })
            })
        } catch (err: any) {
            console.error("Critical Validation Error:", err)
            debugError = err.message || "Unknown validation error"
            // If the whole loop crashes, we can't do much but return what we have or an empty set, 
            // but at least we don't crash the React tree.
        }

        return { valid, invalid, debugError, debugInfo }
    }, [processedSheets])


    const handleSubmit = async () => {
        if (!file) return
        if (!jurisdiction) {
            alert("Please enter the Jurisdiction City/County so we can correctly link the politician.")
            return
        }

        setIsProcessing(true)
        setChunkProgress("Starting upload...")
        setError(null)
        const supabase = createClient()

        let storagePath: string | null = null

        try {
            // 0. Get User (via NextAuth)
            const authResult = await authAction()
            if (!authResult.success || !authResult.userId) {
                throw new Error("You must be logged in to upload files.")
            }
            const userId = authResult.userId

            // 1. Archival: Upload Raw File via API (handles RLS with service role)
            setChunkProgress("Uploading file to storage...")

            const formData = new FormData()
            formData.append('file', file)

            const uploadResponse = await fetch('/api/upload-file', {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json()
                throw new Error(errorData.error || 'File upload failed')
            }

            const uploadResult = await uploadResponse.json()
            storagePath = uploadResult.filePath
            setChunkProgress("File archived. Starting import...")

            // 2. Database Insert (Chunked)
            let payload = file.name.endsWith(".pdf") ? [] : validatedData.valid

            // 2a. Validate Payload
            if (!file.name.endsWith(".pdf")) {
                // Check for empty data
                if (payload.length === 0) {
                    if (processedSheets.length === 0) {
                        throw new Error("No data found! We could not detect any valid sheets. Please ensure your sheet names contain 'Contribution' or 'Expenditure'.")
                    } else {
                        throw new Error("No valid records found! Check your column headers. We need at least 'Amount' and 'Entity_Name' (Payee/Contributor).")
                    }
                }

                // Deduplicate by Tran_ID (External ID)
                const uniquePayload: any[] = [];
                const seenIds = new Set();
                for (const row of payload) {
                    if (row.Tran_ID) {
                        if (seenIds.has(row.Tran_ID)) continue;
                        seenIds.add(row.Tran_ID);
                    }
                    uniquePayload.push(row);
                }
                console.log(`Deduplicated: ${payload.length} -> ${uniquePayload.length} records`)
                payload = uniquePayload;

                // Check Types
                const unknownTypes = payload.filter(p => !['CONTRIBUTION', 'EXPENDITURE'].includes(p.Rec_Type || ''))
                if (unknownTypes.length > 0) {
                    throw new Error(`Found ${unknownTypes.length} records with Unknown/Invalid Transaction Type. Please select a valid Sheet Type (Contribution or Expenditure) in the Map step.`)
                }
            }

            if (payload.length > 0 || file.name.endsWith(".pdf")) {
                const BATCH_SIZE = 1000
                const totalBatches = Math.ceil(payload.length / BATCH_SIZE)

                // 2b. Create Filing Header via Server Action


                const filingResult = await createFilingHeader({
                    filer_name: payload.length > 0 ? (payload[0].Filer_NamL || 'Unknown Filer') : file.name,
                    source_file_url: storagePath,
                    uploaded_by: userId,
                    fileName: file.name
                })

                if (!filingResult.success || !filingResult.filingId) {
                    throw new Error(`Failed to create filing: ${filingResult.error}`)
                }
                const filingId = filingResult.filingId

                // 2c. Import Batches via Server Action
                for (let i = 0; i < payload.length; i += BATCH_SIZE) {
                    setChunkProgress(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${totalBatches}...`)
                    const batch = payload.slice(i, i + BATCH_SIZE).map(row => ({
                        filing_id: filingId,
                        transaction_type: row.Rec_Type,

                        entity_name: row.Entity_NamF ? `${row.Entity_NamF} ${row.Entity_Name}` : row.Entity_Name,
                        entity_cd: row.Entity_Cd || null, // Entity code from sheet name
                        amount: row.Amount,
                        transaction_date: row.Tran_Date,

                        entity_city: row.Tran_City,
                        entity_state: row.Tran_State,
                        entity_zip: row.Tran_Zip4,
                        entity_adr1: row.Tran_Adr1,
                        entity_adr2: row.Tran_Adr2,
                        contributor_employer: row.Tran_Emp,
                        contributor_occupation: row.Tran_Occ,

                        // Treasurer
                        treasurer_last_name: row.Tres_NamL,
                        treasurer_first_name: row.Tres_NamF,
                        treasurer_adr1: row.Tres_Adr1,
                        treasurer_city: row.Tres_City,
                        treasurer_state: row.Tres_ST,
                        treasurer_zip: row.Tres_ZIP4,

                        // Intermediary
                        intermediary_last_name: row.Intr_NamL,
                        intermediary_first_name: row.Intr_NamF,
                        intermediary_adr1: row.Intr_Adr1,
                        intermediary_city: row.Intr_City,
                        intermediary_employer: row.Intr_Emp,

                        // Memo
                        memo_code: row.Memo_Code,
                        memo_refno: row.Memo_RefNo,
                        external_id: row.Tran_ID,

                        description: "Imported via Client Upload"
                    }))

                    const batchResult = await importTransactionBatch(filingId, batch, jurisdiction, jurisdictionType)

                    if (!batchResult.success) {
                        throw new Error(`Batch insert failed: ${batchResult.error}`)
                    }
                }

                // 2d. Finalize Filing (Calculate Totals & Status)
                if (filingId) {
                    setChunkProgress("Finalizing filing...")
                    await finalizeFiling(filingId)
                }
            }

            alert(`Success! File uploaded & ${payload.length} records imported.`)
            setStep("UPLOAD")
            setFile(null)
            setProcessedSheets([])
            setChunkProgress(null)
            setJurisdiction("")

        } catch (err: any) {
            console.error("Upload Error:", err)
            setError(err.message)

            // Compensation: Clean up storage if DB failed?
            if (storagePath) {
                console.log("Compensating: Deleting orphaned file...")
                await supabase.storage.from('filings').remove([storagePath])
            }
        } finally {
            setIsProcessing(false)
        }
    }


    // --- Renders ---

    const renderUpload = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Upload Data</h1>
                <p className="text-slate-400">Upload Excel/CSV files or PDF filings.</p>
            </div>

            <GlassCard className="p-6 border-white/10 bg-white/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="text-sm font-medium text-slate-300 block mb-2">Type</label>
                        <Select
                            value={jurisdictionType}
                            onValueChange={(val: "CITY" | "COUNTY") => setJurisdictionType(val)}
                        >
                            <SelectTrigger className="w-full bg-black/40 border border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="CITY">City</SelectItem>
                                <SelectItem value="COUNTY">County</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium text-slate-300 block mb-2">Jurisdiction Name</label>
                        <input
                            type="text"
                            placeholder={jurisdictionType === 'CITY' ? "e.g. Indio, Palm Springs" : "e.g. Riverside County"}
                            value={jurisdiction}
                            onChange={(e) => setJurisdiction(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <p className="text-xs text-slate-500 mt-1">Required. Links politician to this {jurisdictionType.toLowerCase()}.</p>
                    </div>
                </div>
            </GlassCard>

            <GlassCard
                className={cn(
                    "border-2 border-dashed transition-all py-12 cursor-pointer bg-white/5",
                    isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-blue-400 hover:bg-white/10"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
            >
                <div className="flex flex-col items-center text-center">
                    <input id="file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv,.pdf" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4 text-blue-400">
                        <Upload className="h-8 w-8" />
                    </div>
                    <div className="text-white font-semibold mb-1">Click to upload or drag & drop</div>
                    <div className="text-slate-400 text-sm">Supported: .xlsx, .csv, .pdf</div>
                </div>
            </GlassCard>

            {/* If PDF, show ready state directly since no mapping needed */}
            {file && file.name.endsWith(".pdf") && (
                <div className="bg-blue-500/10 p-4 rounded-lg flex items-center justify-between border border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <File className="h-8 w-8 text-blue-400" />
                        <div>
                            <div className="font-semibold text-blue-100">{file.name}</div>
                            <div className="text-sm text-blue-300">Ready to upload (PDF)</div>
                        </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-500 text-white">
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload PDF"}
                    </Button>
                </div>
            )}
        </div>
    )

    const renderMap = () => {
        if (!activeSheet) return <div className="text-slate-400">No data loaded.</div>

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setStep("UPLOAD")} className="text-slate-400 hover:text-white hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Map Columns</h1>
                        <p className="text-slate-400">Configure mapping for each sheet</p>
                    </div>
                </div>

                {/* Custom Tabs */}
                {processedSheets.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
                        {processedSheets.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSheetIdx(idx)}
                                className={cn(
                                    "px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2",
                                    activeSheetIdx === idx
                                        ? "border-blue-500 text-blue-400 bg-blue-500/10"
                                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {s.name}
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full uppercase",
                                        s.type === 'CONTRIBUTION' ? "bg-green-500/20 text-green-300" :
                                            s.type === 'EXPENDITURE' ? "bg-orange-500/20 text-orange-300" :
                                                "bg-slate-700 text-slate-300"
                                    )}>
                                        {s.type === 'UNKNOWN' ? '?' : s.type.slice(0, 3)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Sheet Config Bar */}
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-300">Sheet Type:</span>
                        <Select
                            value={activeSheet.type}
                            onValueChange={(val: any) => updateSheetType(val)}
                        >
                            <SelectTrigger className="w-[180px] bg-white/5 h-8 text-xs text-white border-white/10 focus:ring-blue-500/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                <SelectItem value="CONTRIBUTION">Contribution (Receipts)</SelectItem>
                                <SelectItem value="EXPENDITURE">Expenditure (Payments)</SelectItem>
                                <SelectItem value="UNKNOWN">Other / Unknown</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-xs text-slate-400">
                        {activeSheet.rows.length} rows detected
                    </div>
                </div>


                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {REQUIRED_FIELDS.map(field => (
                        <GlassCard key={field.key} className={cn("border-l-4", activeSheet.mapping[field.key] ? "border-l-green-500" : "border-l-slate-700")}>
                            <GlassCardHeader className="p-4 pb-2">
                                <GlassCardTitle className=" text-sm font-medium flex justify-between text-slate-200">
                                    {field.label}
                                    {field.required && <span className="text-xs text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full">Required</span>}
                                </GlassCardTitle>
                                <div className="text-xs text-slate-400">{field.description}</div>
                            </GlassCardHeader>
                            <GlassCardContent className="p-4 pt-2">
                                <Select
                                    value={activeSheet.mapping[field.key] || "ignore"}
                                    onValueChange={(val) => updateMapping(field.key, val === "ignore" ? "" : val)}
                                >
                                    <SelectTrigger className="text-white border-white/10 bg-white/5 focus:ring-blue-500/50">
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 text-white border-white/10">
                                        <SelectItem value="ignore" className="text-slate-400 font-medium">-- Unmapped --</SelectItem>
                                        {activeSheet.headers.map(h => (
                                            <SelectItem key={h} value={h} className="text-white focus:bg-white/10">{h}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </GlassCardContent>
                        </GlassCard>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                    <Button variant="outline" onClick={() => { setFile(null); setStep("UPLOAD"); }} className="border-white/10 hover:bg-white/5 text-slate-300 hover:text-white">Cancel</Button>
                    <Button onClick={() => setStep("PREVIEW")} disabled={
                        processedSheets.some(s =>
                            s.type !== 'UNKNOWN' &&
                            REQUIRED_FIELDS.some(f => f.required && !s.mapping[f.key])
                        )
                    } className="bg-blue-600 hover:bg-blue-500 text-white">
                        Next: Validate All <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    const renderPreview = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setStep("MAP")} className="text-slate-400 hover:text-white hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Validate Data</h1>
                    <p className="text-slate-400">Aggregated results from {processedSheets.length} sheets</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <GlassCard className="bg-green-500/5 border-green-500/20">
                    <GlassCardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <Check className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-400">{validatedData.valid.length}</div>
                            <div className="text-sm text-green-300 font-medium">Valid Records</div>
                            <div className="text-xs text-green-500/70 mt-1">Ready to import</div>
                        </div>
                    </GlassCardContent>
                </GlassCard>

                <GlassCard className={cn("border-2", validatedData.invalid.length > 0 ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10")}>
                    <GlassCardContent className="p-6 flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", validatedData.invalid.length > 0 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-slate-400")}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <div className={cn("text-2xl font-bold", validatedData.invalid.length > 0 ? "text-red-400" : "text-slate-300")}>{validatedData.invalid.length}</div>
                            <div className={cn("text-sm font-medium", validatedData.invalid.length > 0 ? "text-red-300" : "text-slate-500")}>Invalid Records</div>
                            <div className={cn("text-xs mt-1", validatedData.invalid.length > 0 ? "text-red-400/70" : "text-slate-600")}>
                                {validatedData.invalid.length > 0 ? "Strict validation failed" : "Will be skipped"}
                            </div>
                        </div>
                    </GlassCardContent>
                </GlassCard>
            </div>

            {/* Invalid Reasons List */}
            {validatedData.invalid.length > 0 && (
                <div className="border border-red-500/20 bg-red-500/10 rounded-lg p-4 max-h-96 overflow-auto relative">
                    <div className="flex justify-between items-center mb-2 sticky top-0 bg-red-900/10 pb-2 backdrop-blur-sm">
                        <h4 className="font-semibold text-red-300 text-sm">Errors Found ({validatedData.invalid.length}):</h4>
                        <CopyButton
                            text={validatedData.invalid.map(inv => `Row ${inv.row} (${inv.sheet}): ${inv.reason}`).join('\n')}
                            label="Copy All"
                            className="h-6 text-xs border-red-400/30 text-red-300 hover:bg-red-500/20"
                        />
                    </div>
                    <ul className="text-xs text-red-200/80 space-y-1">
                        {validatedData.invalid.map((inv, i) => (
                            <li key={i}>Row {inv.row} ({inv.sheet}): {inv.reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Valid Data Preview */}
            <div className="space-y-2">
                <h3 className="font-semibold text-white">Preview (First 5 Valid)</h3>
                <div className="border border-white/10 rounded-lg overflow-auto max-h-60 bg-white/5">
                    <table className="w-full text-sm text-center text-slate-300">
                        <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm text-white shadow-sm">
                            <tr>
                                {REQUIRED_FIELDS.map(f => <th key={f.key} className="px-3 py-2 border-b border-white/10 font-medium">{f.label}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {validatedData.valid.slice(0, 5).map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    {REQUIRED_FIELDS.map(f => <td key={f.key} className="px-3 py-2">{row[f.key]}</td>)}
                                </tr>
                            ))}
                            {validatedData.valid.length === 0 && <tr><td colSpan={REQUIRED_FIELDS.length} className="py-4 text-slate-500">No valid data found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Button variant="outline" onClick={() => { setFile(null); setStep("MAP") }} className="border-white/10 hover:bg-white/5 text-slate-300 hover:text-white">Back</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={validatedData.valid.length === 0 || isProcessing}
                    className="bg-green-600 hover:bg-green-500 text-white"
                >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                    {isProcessing ? (chunkProgress || "Processing...") : `Import ${validatedData.valid.length} Records`}
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 text-red-300 rounded-md border border-red-500/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" /> {error}
                    </div>
                    <CopyButton
                        text={error}
                        label=""
                        className="h-8 w-8 p-0 border-transparent text-red-300 hover:bg-red-500/20"
                    />
                </div>
            )}

            {(validatedData as any).debugError && (
                <div className="p-4 bg-red-500/10 text-red-300 rounded-md border border-red-500/20 flex items-center gap-2 mt-2">
                    <AlertCircle className="h-5 w-5" /> Validation Crash: {(validatedData as any).debugError}
                </div>
            )}

            {(validatedData as any).debugInfo && (
                <div className="mt-4 p-4 bg-blue-500/10 text-blue-300 rounded-md border border-blue-500/20 text-xs font-mono overflow-auto max-h-60">
                    <div className="font-bold mb-1">Debug Info:</div>
                    <div>Sheets: {(validatedData as any).debugInfo.sheetCount}</div>
                    <div>Total Rows: {(validatedData as any).debugInfo.totalRows}</div>
                    <div>Processed: {(validatedData as any).debugInfo.rowsProcessed}</div>
                    <div className="mt-2 text-[10px] text-blue-400">
                        <div>First Row Keys: {JSON.stringify((validatedData as any).debugInfo.sampleRowKeys)}</div>
                        <div className="mt-1">Active Mapping: {JSON.stringify((validatedData as any).debugInfo.activeMapping, null, 2)}</div>
                    </div>
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
