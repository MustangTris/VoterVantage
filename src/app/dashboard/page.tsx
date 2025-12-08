import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Volunteer Dashboard</h1>
                <Link href="/dashboard/upload">
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Filing
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Filings Uploaded</CardTitle>
                        <FileText className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.filingsCount}</div>
                        <p className="text-xs text-slate-500">Lifetime total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Records Verified</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recordsVerified.toLocaleString()}</div>
                        <p className="text-xs text-slate-500">Processed transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.impactScore}</div>
                        <p className="text-xs text-slate-500">Among all volunteers</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-slate-500">No recent activity found.</p>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {/* Initials or generic icon */}
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                        {activity.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
