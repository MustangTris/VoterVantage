import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFilings } from "./actions"
import { FileText, Download, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
    const { success, filings, error } = await getFilings()

    if (!success) {
        return (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>Error loading filings: {error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Review Data</h1>
            <p className="text-slate-500">
                Review recently uploaded filings and their processing status.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Filings</CardTitle>
                </CardHeader>
                <CardContent>
                    {!filings || filings.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p>No filings found.</p>
                            <Link href="/dashboard/upload" className="mt-4 inline-block">
                                <Button variant="outline">Upload a Filing</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Filer Name</th>
                                        <th className="px-6 py-3">Date Uploaded</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Transactions</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filings.map((filing: any) => (
                                        <tr key={filing.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {filing.filer_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(filing.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${filing.status === 'PROCESSED' ? 'bg-green-100 text-green-800' :
                                                        filing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-slate-100 text-slate-800'}`}>
                                                    {filing.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {filing.transaction_count}
                                            </td>
                                            <td className="px-6 py-4">
                                                {filing.source_file_url && (
                                                    <a href={filing.source_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
