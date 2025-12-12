import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, Vote, Users, TrendingUp, PieChart } from "lucide-react"
import { TrendChart } from "@/components/charts/TrendChart"
import { CategoryBarChart } from "@/components/charts/CategoryBarChart"
import { DistributionPieChart } from "@/components/charts/DistributionPieChart"

import { getCityStats } from "@/app/actions/stats"

// Ensure dynamic rendering since we are fetching live data
export const dynamic = 'force-dynamic'

export default async function PalmSpringsDashboard() {
    const stats = await getCityStats('Palm Springs')

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
                            Palm Springs
                        </h1>
                        <p className="text-slate-400 mt-1">Riverside County • Est. 1938 • Population: 44,575</p>
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
                                <PieChart className="h-5 w-5 text-orange-400" />
                                Donation Sources
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DistributionPieChart data={stats.donorComposition || []} title="Total" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 md:grid-cols-2 mb-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-red-400" />
                                City-Wide Spending (By Category)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CategoryBarChart data={stats.expenditureBreakdown || []} title="Spent" color="#f87171" />
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-emerald-400" />
                                Donor Locations (Local vs External)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CategoryBarChart data={stats.donorLocationBreakdown || []} title="Donated" color="#10b981" />
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Content */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Top Campaigns */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Active Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.topRecipients.length === 0 ? (
                                <div className="text-slate-400 italic text-center py-4">No active campaigns found.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {stats.topRecipients.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-200 text-sm truncate max-w-[150px]" title={item.name}>{item.name}</span>
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
                            <CardTitle className="text-white">Top Donors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.topDonors.length === 0 ? (
                                <div className="text-slate-400 italic text-center py-4">No donor data available.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {stats.topDonors.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-200 text-sm truncate max-w-[150px]" title={item.name}>{item.name}</span>
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
                            <CardTitle className="text-white">Top Expenditures</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.topExpenditures.length === 0 ? (
                                <div className="text-slate-400 italic text-center py-4">No expenditure data available.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {stats.topExpenditures.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-200 text-sm truncate max-w-[150px]" title={item.name}>{item.name}</span>
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
