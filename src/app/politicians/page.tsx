import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Award, TrendingUp, ArrowRight } from "lucide-react"
import { getPoliticianOverviewStats } from "@/app/actions/category-stats"

export const dynamic = 'force-dynamic'

export default async function PoliticiansOverview() {
    const stats = await getPoliticianOverviewStats()

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Politicians Dashboard
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Track campaign finance data for local candidates and elected officials.
                    </p>
                </div>

                {/* Aggregate Stats */}
                <div className="grid gap-6 md:grid-cols-3 mb-12">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Candidates</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.totalCandidates}</div>
                            <p className="text-xs text-slate-400">Tracked in database</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Funds Raised</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                ${(stats.totalRaised).toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-400">Combined contributions</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Most Active Party</CardTitle>
                            <Award className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {stats.partyBreakdown.sort((a, b) => b.count - a.count)[0]?.party || "N/A"}
                            </div>
                            <p className="text-xs text-slate-400">Based on filings</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Fundraisers */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-green-400" />
                            Top Fundraisers
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {stats.topFundraisers.length > 0 ? (
                            stats.topFundraisers.map((politician) => (
                                <Link href={`/politicians/${politician.id}`} key={politician.id} className="block group">
                                    <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-white/10 overflow-hidden">
                                                {/* Placeholder for image */}
                                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                                    {politician.name.charAt(0)}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                            {politician.name}
                                        </h3>
                                        <div className="text-sm text-slate-400 mb-2">Raised</div>
                                        <div className="text-xl font-bold text-green-400">
                                            ${politician.total_raised.toLocaleString()}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-slate-500 py-8 glass-panel rounded-xl">
                                No contribution data available yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Example Categorization / Recent */}
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="glass-panel p-8 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-4">By Party Affiliation</h3>
                        <div className="space-y-4">
                            {stats.partyBreakdown.map((item) => (
                                <div key={item.party} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                    <span className="text-slate-300">{item.party}</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">
                                        {item.count} Candidates
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Search All Politicians</h3>
                        <p className="text-slate-400 mb-6">Find specific candidates by name or region.</p>
                        <Link href="/search">
                            <span className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-purple-700 transition-colors">
                                Go to Search
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
