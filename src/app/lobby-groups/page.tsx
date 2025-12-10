import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Briefcase, TrendingUp, ArrowRight } from "lucide-react"
import { getLobbyistOverviewStats } from "@/app/actions/category-stats"

export const dynamic = 'force-dynamic'

export default async function LobbyGroupsOverview() {
    const stats = await getLobbyistOverviewStats()

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                        Lobbyists Dashboard
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Analyze spending and influence of lobby groups and registered lobbyists.
                    </p>
                </div>

                {/* Aggregate Stats */}
                <div className="grid gap-6 md:grid-cols-3 mb-12">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Lobbyists</CardTitle>
                            <Users className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.totalLobbyists}</div>
                            <p className="text-xs text-slate-400">Registered entities</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Total Influence Spending</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                ${(stats.totalSpent).toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-400">Recorded expenditures/contributions</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Avg. Spend per Group</CardTitle>
                            <Briefcase className="h-4 w-4 text-teal-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                ${stats.totalLobbyists > 0 ? Math.round(stats.totalSpent / stats.totalLobbyists).toLocaleString() : 0}
                            </div>
                            <p className="text-xs text-slate-400">Per registered entity</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Spenders */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-green-400" />
                            Top Spenders
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {stats.topSpenders.length > 0 ? (
                            stats.topSpenders.map((lobbyist) => (
                                <Link href={`/lobby-groups/${lobbyist.id}`} key={lobbyist.id} className="block group">
                                    <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-green-500/30 hover:bg-white/10 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                                                <Briefcase className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-green-400 transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                                            {lobbyist.name}
                                        </h3>
                                        <div className="text-sm text-slate-400 mb-2">Total Spent</div>
                                        <div className="text-xl font-bold text-emerald-400">
                                            ${lobbyist.total_spent.toLocaleString()}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-slate-500 py-8 glass-panel rounded-xl">
                                No spending data available yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Understanding Lobbying Data</h3>
                        <p className="text-slate-400 max-w-xl">
                            Our data tracks both direct contributions to candidates and independent expenditures on ballot measures.
                            Comparison data includes all processed Form 460 filings.
                        </p>
                    </div>
                    <Link href="/search">
                        <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                            Search Specific Groups
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
