import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Vote, Users, TrendingUp, PieChart, TrendingDown } from "lucide-react"
import Link from "next/link"
import { TrendChart } from "@/components/charts/TrendChart"
import { CategoryBarChart } from "@/components/charts/CategoryBarChart"
import { DistributionPieChart } from "@/components/charts/DistributionPieChart"

import { getPoliticianStats } from "@/app/actions/stats"
import { TransactionsTable } from "@/components/TransactionsTable"
import pool from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function PoliticianDashboard({ params }: PageProps) {
    const { id } = await params

    // 1. Fetch Profile
    let profileName = ""
    let profileDesc = ""

    const client = await pool.connect()
    try {
        const res = await client.query("SELECT name, description FROM profiles WHERE id = $1 AND type = 'POLITICIAN'", [id])
        if (res.rows.length === 0) {
            console.error(`[PoliticianDashboard] Politician not found for ID: ${id}`)
            notFound()
        }
        profileName = res.rows[0].name
        profileDesc = res.rows[0].description || "Candidate Profile"
    } finally {
        client.release()
    }

    // 2. Fetch Stats
    const stats = await getPoliticianStats(profileName)

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="w-full max-w-2xl">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 block w-full">
                            {profileName}
                        </h1>
                        <p className="text-slate-400 mt-1">{profileDesc}</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Raised</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">${stats.totalRaised.toLocaleString()}</div>
                            <p className="text-xs text-slate-400">Total reported</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Spent</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">${(stats.totalExpenditures || 0).toLocaleString()}</div>
                            <p className="text-xs text-slate-400">Total expenditures</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Donor Count</CardTitle>
                            <Users className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.donorCount}</div>
                            <p className="text-xs text-slate-400">Individual contributors</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className=" text-sm font-medium text-slate-300">Avg Contribution</CardTitle>
                            <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                <DollarSign className="h-3 w-3 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">${Math.round(stats.avgDonation || 0).toLocaleString()}</div>
                            <p className="text-xs text-slate-400">per transaction</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Monthly Burn</CardTitle>
                            <div className="h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">${Math.round(stats.monthlyBurnRate || 0).toLocaleString()}</div>
                            <p className="text-xs text-slate-400">avg spending / month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 md:grid-cols-2 mb-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                                Fundraising History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendChart data={stats.fundraisingTrend} title="Contributions" />
                        </CardContent>
                    </Card>



                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-red-400" />
                                Spending History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendChart data={stats.expenditureTrend || []} title="Expenditures" color="#f87171" />
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-red-400" />
                                Expenditure Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CategoryBarChart data={stats.expenditureBreakdown || []} title="Spent" color="#f87171" />
                        </CardContent>
                    </Card>

                    {/* NEW: Donor Demographics Row */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-400" />
                                Top Donor Occupations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CategoryBarChart data={stats.contributorOccupationBreakdown || []} title="Donated" color="#6366f1" />
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Vote className="h-5 w-5 text-emerald-400" />
                                Top Donor Locations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CategoryBarChart data={stats.contributorLocationBreakdown || []} title="Donated" color="#10b981" />
                        </CardContent>
                    </Card>

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

                {/* Transactions Table */}
                <div className="mb-8">
                    <TransactionsTable
                        viewType="POLITICIAN"
                        entityName={profileName}
                        title={`Contributions to ${profileName}`}
                    />
                </div>
            </div>
        </div >
    )
}
