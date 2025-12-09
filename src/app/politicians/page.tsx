import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, DollarSign, Vote, Users, FileText, TrendingUp, PieChart } from "lucide-react"
import { TrendChart } from "@/components/charts/TrendChart"
import { SourceBreakdownChart } from "@/components/charts/SourceBreakdownChart"
import { politicianTrends, politicianSources } from "@/lib/mock-data"
import { auth } from "@/auth"
import pool from "@/lib/db"
import { EditableField } from "@/components/cms/editable-field"

export const dynamic = 'force-dynamic'

export default async function PoliticianDashboard() {
    const session = await auth()
    const isEditable = !!session?.user

    // Fetch politician data
    let profile = null
    try {
        const client = await pool.connect()
        try {
            const res = await client.query("SELECT * FROM profiles WHERE name = 'Mayor Johnson' LIMIT 1")
            if (res.rows.length > 0) {
                profile = res.rows[0]
            }
        } finally {
            client.release()
        }
    } catch (error) {
        console.error("Database connection error:", error)
        // Fallback or empty state will be handled below
    }

    if (!profile) {
        // Fallback for demo/error state
        if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
            return <div className="p-8 text-white">Database configuration missing. Please check deployment settings.</div>
        }
        // Use mock profile if DB fails (optional, but good for stability)
        profile = {
            id: 'mock-id',
            name: 'Mayor Johnson',
            description: 'Incumbent - 2nd Term (Data connection unavailable)',
        }
    }

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="w-full max-w-2xl">
                        <EditableField
                            id={profile.id}
                            table="profiles"
                            field="name"
                            initialValue={profile.name}
                            isEditable={isEditable}
                            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 block w-full"
                        />
                        <div className="mt-1">
                            <EditableField
                                id={profile.id}
                                table="profiles"
                                field="description"
                                initialValue={profile.description}
                                isEditable={isEditable}
                                className="text-slate-400 block w-full"
                            />
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">Follow Candidate</Button>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Raised</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">$1,245,000</div>
                            <p className="text-xs text-slate-400">+12% from last cycle</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Cash on Hand</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">$342,800</div>
                            <p className="text-xs text-slate-400">Updated today</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Votes</CardTitle>
                            <Vote className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">452</div>
                            <p className="text-xs text-slate-400">Cast in current term</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Donor Count</CardTitle>
                            <Users className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">1,890</div>
                            <p className="text-xs text-slate-400">Individual contributors</p>
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
                                Fundraising History (2024 Cycle)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendChart data={politicianTrends} title="Contributions" />
                        </CardContent>
                    </Card>

                    {/* Source Breakdown */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-purple-400" />
                                Donation Sources
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SourceBreakdownChart data={politicianSources} />
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Content */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Recent Voting Record */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-white">Recent Voting Record</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { bill: "Prop 12: Downtown Zoning", vote: "Yes", date: "Oct 12, 2024" },
                                    { bill: "Measure A: Park Funding", vote: "Yes", date: "Sep 28, 2024" },
                                    { bill: "Resolution 404: Budget Adjustment", vote: "No", date: "Sep 15, 2024" },
                                    { bill: "Contract 89: Waste Management", vote: "Abstain", date: "Aug 30, 2024" },
                                ].map((record, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium text-white">{record.bill}</p>
                                            <p className="text-xs text-slate-500">{record.date}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${record.vote === 'Yes' ? 'bg-green-500/20 text-green-400' :
                                            record.vote === 'No' ? 'bg-red-500/20 text-red-400' :
                                                'bg-slate-500/20 text-slate-400'
                                            }`}>
                                            {record.vote}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
