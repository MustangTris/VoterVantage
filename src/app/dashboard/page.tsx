import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight, FileText, Upload, CheckCircle } from "lucide-react"
import { getDashboardStats, getRecentActivity } from "./actions"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const recentActivity = await getRecentActivity()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Volunteer Dashboard</h1>
                <Link href="/dashboard/upload">
                    <Button className="glass-button border-purple-500/30 hover:bg-purple-500/20 text-white">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Filing
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <GlassCard>
                    <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <GlassCardTitle className="text-sm font-medium text-slate-300">Filings Uploaded</GlassCardTitle>
                        <FileText className="h-4 w-4 text-purple-400" />
                    </GlassCardHeader>
                    <GlassCardContent>
                        <div className="text-2xl font-bold text-white">{stats.filingsCount}</div>
                        <p className="text-xs text-slate-400">Lifetime total</p>
                    </GlassCardContent>
                </GlassCard>
                <GlassCard>
                    <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <GlassCardTitle className="text-sm font-medium text-slate-300">Records Verified</GlassCardTitle>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                    </GlassCardHeader>
                    <GlassCardContent>
                        <div className="text-2xl font-bold text-white">{stats.recordsVerified.toLocaleString()}</div>
                        <p className="text-xs text-slate-400">Processed transactions</p>
                    </GlassCardContent>
                </GlassCard>
                <GlassCard>
                    <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <GlassCardTitle className="text-sm font-medium text-slate-300">Impact Score</GlassCardTitle>
                        <ArrowUpRight className="h-4 w-4 text-blue-400" />
                    </GlassCardHeader>
                    <GlassCardContent>
                        <div className="text-2xl font-bold text-white">{stats.impactScore}</div>
                        <p className="text-xs text-slate-400">Among all volunteers</p>
                    </GlassCardContent>
                </GlassCard>
            </div>

            <GlassCard>
                <GlassCardHeader>
                    <GlassCardTitle>Recent Activity</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-slate-500">No recent activity found.</p>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs ring-1 ring-blue-500/40">
                                            {/* Initials or generic icon */}
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{activity.description}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                                        {activity.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCardContent>
            </GlassCard>
        </div>
    )
}
