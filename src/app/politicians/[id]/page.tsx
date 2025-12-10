import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Vote, Users, TrendingUp, PieChart } from "lucide-react"
import { TrendChart } from "@/components/charts/TrendChart"
import { SourceBreakdownChart } from "@/components/charts/SourceBreakdownChart"
import { getPoliticianStats } from "@/app/actions/stats"
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
    try {
        const client = await pool.connect()
        try {
            const res = await client.query("SELECT name, description FROM profiles WHERE id = $1 AND type = 'POLITICIAN'", [id])
            if (res.rows.length === 0) {
                notFound()
            }
            profileName = res.rows[0].name
            profileDesc = res.rows[0].description || "Candidate Profile"
        } finally {
            client.release()
        }
    } catch (error) {
        console.error("DB Error:", error)
        notFound()
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
                            <CardTitle className="text-sm font-medium text-slate-300">Cash on Hand</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">${stats.cashOnHand.toLocaleString()}</div>
                            <p className="text-xs text-slate-400">Latest report</p>
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
                                <PieChart className="h-5 w-5 text-purple-400" />
                                Donation Sources
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SourceBreakdownChart data={stats.donorComposition} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
