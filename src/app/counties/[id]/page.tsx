
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, Vote, Users, TrendingUp, PieChart, AlertCircle } from "lucide-react"
import { TrendChart } from "@/components/charts/TrendChart"

import { getCityStats } from "@/app/actions/stats"
import { TransactionsTable } from "@/components/TransactionsTable"
import pool from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CountyDashboard({ params }: PageProps) {
    const { id } = await params

    // 1. Fetch Profile to get Name
    let profileName = ""
    let profileDesc = ""
    try {
        const client = await pool.connect()
        try {
            const res = await client.query("SELECT name, description FROM profiles WHERE id = $1 AND type = 'COUNTY'", [id])
            if (res.rows.length === 0) {
                notFound()
            }
            profileName = res.rows[0].name
            profileDesc = res.rows[0].description || "County Profile"
        } finally {
            client.release()
        }
    } catch (error) {
        console.error("DB Error:", error)
        notFound()
    }

    // 2. Fetch Stats using Name (Reusing getCityStats as it works on jurisdiction/city string match)
    console.log(`[CountyDashboard] Fetching stats for county: "${profileName}"`)
    const stats = await getCityStats(profileName)

    // Format currency
    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`
        return `$${val.toLocaleString()}`
    }

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                            {profileName}
                        </h1>
                        <p className="text-slate-400 mt-1">{profileDesc}</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Contributions</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRaised)}</div>
                            <p className="text-xs text-slate-400">Total raised this cycle</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Candidates</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.candidatesCount}</div>
                            <p className="text-xs text-slate-400">Running for office</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Unique Donors</CardTitle>
                            <Building2 className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.donorsCount}</div>
                            <p className="text-xs text-slate-400">Donors to campaigns</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-8 md:grid-cols-2 mb-8">
                    {/* Fundraising Trend */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                                Annual Fundraising (County-Wide)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendChart data={stats.fundraisingTrend} color="#60a5fa" title="Total Raised" />
                        </CardContent>
                    </Card>

                    {/* Source Breakdown (Donor Composition) */}

                </div>

                {/* Transactions Table */}
                <div className="mb-8">
                    <TransactionsTable
                        viewType="CITY"
                        entityName={profileName}
                        title={`Recent Transactions in ${profileName}`}
                    />
                </div>

                {/* Analytical Breakdowns */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {/* Top Active Campaigns */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-400" />
                                Top Active Campaigns
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.topRecipients.length === 0 ? (
                                <div className="text-slate-400 italic text-center py-4">No active campaigns found.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {stats.topRecipients.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-200 text-sm truncate max-w-[180px]" title={item.name}>{item.name}</span>
                                            <span className="text-green-400 font-bold text-sm">{formatCurrency(item.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Donors */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-purple-400" />
                                Top Donors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.topDonors.length === 0 ? (
                                <div className="text-slate-400 italic text-center py-4">No donor data available.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {stats.topDonors.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-200 text-sm truncate max-w-[180px]" title={item.name}>{item.name}</span>
                                            <span className="text-green-400 font-bold text-sm">{formatCurrency(item.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Expenditures */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-red-400" />
                                Top Expenditures
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.topExpenditures.length === 0 ? (
                                <div className="text-slate-400 italic text-center py-4">No expenditure data available.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {stats.topExpenditures.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-200 text-sm truncate max-w-[180px]" title={item.name}>{item.name}</span>
                                            <span className="text-red-400 font-bold text-sm">{formatCurrency(item.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
