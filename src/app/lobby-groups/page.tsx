import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, Target, TrendingUp } from "lucide-react"

export default function LobbyGroupDashboard() {
    return (
        <div className="min-h-screen bg-[#030014] text-white overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                            Clean Energy Coalition
                        </h1>
                        <p className="text-slate-400 mt-1">Status: Active • Type: 501(c)(4) • Est. 2012</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Spent</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">$4,500,000</div>
                            <p className="text-xs text-slate-400">Since 2020</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Lobbyists</CardTitle>
                            <UsersIcon className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">12</div>
                            <p className="text-xs text-slate-400">Full-time registered</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Targeted Measures</CardTitle>
                            <Target className="h-4 w-4 text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">5</div>
                            <p className="text-xs text-slate-400">In current cycle</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Win Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">65%</div>
                            <p className="text-xs text-slate-400">Supported outcomes achieved</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Content */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Top Beneficiaries */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Top Beneficiaries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: "Support for Mayor Johnson", amount: "$50,000", type: "Contribution" },
                                    { name: "Committee for Prop 12", amount: "$150,000", type: "Independent Expenditure" },
                                    { name: "Sarah Smith for Council", amount: "$12,000", type: "Contribution" },
                                    { name: "Voters for Green Parks", amount: "$8,500", type: "Contribution" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium text-white">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400">{item.amount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stance on Issues */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Issue Advocacy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { issue: "Solar Subsidies", stance: "Support", intensity: "High" },
                                    { issue: "Downtown Parking Tax", stance: "Oppose", intensity: "Medium" },
                                    { issue: "Wind Farm Expansion", stance: "Support", intensity: "High" },
                                    { issue: "Water Conservation Mandate", stance: "Neutral", intensity: "Low" },
                                ].map((issue, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium text-white">{issue.issue}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${issue.stance === 'Support' ? 'bg-green-500/20 text-green-400' :
                                                issue.stance === 'Oppose' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {issue.stance}
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

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
