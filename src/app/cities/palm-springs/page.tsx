import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, Vote, Users, TrendingUp, PieChart } from "lucide-react"
import { TrendChart } from "@/components/charts/TrendChart"
import { SourceBreakdownChart } from "@/components/charts/SourceBreakdownChart"
import { cityTrends, citySources } from "@/lib/mock-data"

export default function PalmSpringsDashboard() {
    return (
        <div className="min-h-screen bg-[#030014] text-white overflow-hidden relative">
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
                            <div className="text-2xl font-bold text-white">$12.5M</div>
                            <p className="text-xs text-slate-400">Total raised this cycle</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Active Measures</CardTitle>
                            <Vote className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">3</div>
                            <p className="text-xs text-slate-400">On the ballot</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Candidates</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">14</div>
                            <p className="text-xs text-slate-400">Running for office</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Registered Lobbyists</CardTitle>
                            <Building2 className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">28</div>
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
                            <TrendChart data={cityTrends} color="#c084fc" title="Total Raised" />
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
                            <SourceBreakdownChart data={citySources} />
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
                            <div className="space-y-4">
                                {[
                                    { name: "Re-elect Mayor Johnson", amount: "$1,245,000", trend: "+12%" },
                                    { name: "Committee for Prop 12 (Zoning)", amount: "$890,000", trend: "+5%" },
                                    { name: "Sarah Smith for City Council", amount: "$420,000", trend: "+20%" },
                                    { name: "Michael Brown City Council", amount: "$380,000", trend: "+2%" },
                                    { name: "Protect Our Parks (Prop 12 Opp)", amount: "$150,000", trend: "+45%" },
                                ].map((campaign, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium text-white">{campaign.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400">{campaign.amount}</p>
                                            <p className="text-xs text-slate-500">{campaign.trend}</p>
                                        </div>
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
