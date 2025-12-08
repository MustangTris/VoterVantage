import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, DollarSign, Vote, Users, FileText } from "lucide-react"

export default function PoliticianDashboard() {
    return (
        <div className="min-h-screen bg-[#030014] text-white overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Mayor Johnson
                        </h1>
                        <p className="text-slate-400 mt-1">Mayor of Palm Springs • Incumbent • Term 2024-2028</p>
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

                {/* Dashboard Content */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Top Donors */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Top Donors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: "Clean Energy Coalition", amount: "$50,000", type: "PAC" },
                                    { name: "Local Firefighters Union", amount: "$25,000", type: "Labor" },
                                    { name: "Tech Ventures LLC", amount: "$15,000", type: "Corporate" },
                                    { name: "Desert Developers Assoc.", amount: "$12,500", type: "Trade Group" },
                                    { name: "Jane Doe", amount: "$5,500", type: "Individual" },
                                ].map((donor, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium text-white">{donor.name}</p>
                                            <p className="text-xs text-slate-500">{donor.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400">{donor.amount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Voting Record */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
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
