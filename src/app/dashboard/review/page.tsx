import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { getFilings } from "./actions"
import { FileText, Download, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
    const { success, filings, error } = await getFilings()

    if (!success) {
        return (
            <div className="p-4 rounded-lg bg-red-900/20 text-red-200 border border-red-500/50 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>Error loading filings: {error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-white">Review Data</h1>
            <p className="text-slate-400">
                Review recently uploaded filings and their processing status.
            </p>

            <GlassCard>
                <GlassCardHeader>
                    <GlassCardTitle>Uploaded Filings</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                    {!filings || filings.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                            <p>No filings found.</p>
                            <Link href="/dashboard/upload" className="mt-4 inline-block">
                                <Button className="glass-button border-purple-500/30 hover:bg-purple-500/20 text-white">Upload a Filing</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/10">
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
                                        <tr key={filing.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {filing.filer_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(filing.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                    ${filing.status === 'PROCESSED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        filing.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                            'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                    {filing.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {filing.transaction_count}
                                            </td>
                                            <td className="px-6 py-4">
                                                {filing.source_file_url && (
                                                    <a href={filing.source_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
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
                </GlassCardContent>
            </GlassCard>
        </div>
    )
}
