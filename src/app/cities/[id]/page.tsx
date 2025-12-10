import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, Vote, Users, TrendingUp, PieChart, AlertCircle } from "lucide-react"
import { TrendChart } from "@/components/charts/TrendChart"
import { SourceBreakdownChart } from "@/components/charts/SourceBreakdownChart"
import { getCityStats } from "@/app/actions/stats"
import pool from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CityDashboard({ params }: PageProps) {
    const { id } = await params

    // 1. Fetch Profile to get Name
    let profileName = ""
    let profileDesc = ""
    try {
        const client = await pool.connect()
        try {
            const res = await client.query("SELECT name, description FROM profiles WHERE id = $1 AND type = 'CITY'", [id])
            if (res.rows.length === 0) {
                notFound()
            }
            profileName = res.rows[0].name
            profileDesc = res.rows[0].description || "City Profile"
        } finally {
            client.release()
        }
    } catch (error) {
        console.error("DB Error:", error)
        notFound()
    }

    // 2. Fetch Stats using Name
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
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
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
                            <CardTitle className="text-sm font-medium text-slate-300">Active Measures</CardTitle>
                            <Vote className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.activeMeasures}</div>
                            <p className="text-xs text-slate-400">On the ballot</p>
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
                            <CardTitle className="text-sm font-medium text-slate-300">Registered Lobbyists</CardTitle>
                            <Building2 className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.lobbyistsCount}</div>
                            <p className="text-xs text-slate-400">Active in city</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-8 md:grid-cols-2 mb-8">
                    {/* City-Wide Fundraising Trend */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-400" />
                                Annual Fundraising (City-Wide)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendChart data={stats.fundraisingTrend} color="#c084fc" title="Total Raised" />
                        </CardContent>
                    </Card>

                    {/* Source Breakdown (Donor Composition) */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-blue-400" />
                                Donor Composition
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SourceBreakdownChart data={stats.donorComposition} />
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Content */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Top Campaigns (Text List) - Kept as additional info */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-white">Active Campaigns (Fundraising)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-slate-400 italic text-center py-8">
                                Campaign comparison data coming soon.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
