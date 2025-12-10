import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Target, TrendingUp } from "lucide-react"
import { getLobbyistStats } from "@/app/actions/stats"
import pool from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function LobbyistDashboard({ params }: PageProps) {
    const { id } = await params

    // 1. Fetch Profile
    let profileName = ""
    let profileDesc = ""
    try {
        const client = await pool.connect()
        try {
            const res = await client.query("SELECT name, description FROM profiles WHERE id = $1 AND type = 'LOBBYIST'", [id])
            if (res.rows.length === 0) {
                notFound() // Or handle gracefully
            }
            profileName = res.rows[0].name
            profileDesc = res.rows[0].description || "Lobbyist / Major Donor"
        } finally {
            client.release()
        }
    } catch (error) {
        console.error("DB Error:", error)
        notFound()
    }

    // 2. Fetch Stats
    const stats = await getLobbyistStats(profileName)

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                            {profileName}
                        </h1>
                        <p className="text-slate-400 mt-1">{profileDesc}</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Spent</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">${stats.totalSpent.toLocaleString()}</div>
                            <p className="text-xs text-slate-400">Total contributions made</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Win Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">N/A</div>
                            <p className="text-xs text-slate-400">Data insufficient</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Top Beneficiaries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.beneficiaries.length === 0 ? (
                                    <p className="text-slate-500">No contributions found.</p>
                                ) : (
                                    stats.beneficiaries.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                            <div>
                                                <p className="font-medium text-white">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-400">{item.amount}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
