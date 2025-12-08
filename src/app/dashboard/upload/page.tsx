/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
// import { useDropzone } from "react-dropzone" removed 
// actually I'll standard HTML drag/drop to avoid installing more deps if possible, but react-dropzone is standard. 
// I'll stick to a simple hidden file input with a styled label for simplicity and 0 deps.

import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileSpreadsheet, File, AlertCircle, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function UploadPage() {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [parsedData, setParsedData] = useState<any[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFiles = e.dataTransfer.files
        if (droppedFiles?.length) {
            handleFile(droppedFiles[0])
        }
    }

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (selectedFile: File) => {
        setFile(selectedFile)
        setError(null)
        setParsedData(null)

        // Basic client-side Excel/CSV parsing
        if (selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
            processSpreadsheet(selectedFile)
        } else if (selectedFile.name.endsWith(".pdf")) {
            // PDF handling would go here (or upload to server)
            // For now, just show a message.
        } else {
            setError("Unsupported file format. Please upload .csv, .xls, .xlsx, or .pdf")
        }
    }

    const processSpreadsheet = async (file: File) => {
        setIsProcessing(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const workbook = XLSX.read(arrayBuffer)

            // Assume first sheet for now or look for specific sheets
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            setParsedData(jsonData)
        } catch (err) {
            console.error(err)
            setError(`Failed to parse file. Is it a valid spreadsheet?`)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Upload Filing Data</h1>
                <p className="text-slate-500">
                    Upload Form 460 filings (Excel, CSV, or PDF) to contribute to the database.
                </p>
            </div>

            <Card
                className={cn(
                    "border-2 border-dashed transition-all duration-200 cursor-pointer",
                    isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-400/50 hover:bg-slate-50/50",
                    file ? "bg-slate-50 border-slate-200" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
            >
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".csv,.xls,.xlsx,.pdf"
                        onChange={onFileInputChange}
                    />

                    {file ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                                {file.name.endsWith('.pdf') ? <File className="h-8 w-8" /> : <FileSpreadsheet className="h-8 w-8" />}
                            </div>
                            <p className="font-medium text-lg text-slate-900">{file.name}</p>
                            <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                            <Button variant="ghost" size="sm" className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => {
                                e.stopPropagation()
                                setFile(null)
                                setParsedData(null)
                                setError(null)
                            }}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                                <Upload className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Click to upload or drag and drop</h3>
                            <p className="text-sm text-slate-500 mt-2 max-w-sm">
                                Supports <span className="font-medium text-slate-700">.csv, .xls, .xlsx</span> (Spreadsheets) and <span className="font-medium text-slate-700">.pdf</span> (Form 460 Scans)
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {isProcessing && (
                <div className="flex items-center justify-center py-8 text-blue-600">
                    <Loader2 className="h-8 w-8 animate-spin mr-3" />
                    <p className="font-medium">Parsing file data...</p>
                </div>
            )}

            {parsedData && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            Extracted {parsedData.length} records
                        </h2>
                        <Button>Review & Submit</Button>
                    </div>
                    <Card>
                        <div className="max-h-[400px] overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        {Object.keys(parsedData[0] || {}).map((header) => (
                                            <th key={header} className="px-4 py-3 font-medium text-slate-500 border-b border-slate-200">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parsedData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                                                    {String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {parsedData.length > 10 && (
                            <div className="p-4 text-center text-sm text-slate-500 border-t border-slate-200 bg-slate-50/50">
                                Showing first 10 of {parsedData.length} records
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {file && file.name.endsWith('.pdf') && !isProcessing && (
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Loader2 className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900">PDF Parsing Required</h3>
                                <p className="text-blue-700 text-sm mt-1">
                                    PDFs require server-side OCR processing. Clicking &quot;Review &amp; Submit&quot; will upload this file to the queue for automated extraction.
                                </p>
                                <Button className="mt-4" size="sm">Upload to Queue</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
