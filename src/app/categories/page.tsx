import Link from "next/link"
import { Building2, Users, Briefcase } from "lucide-react"

export default function CategoriesPage() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden pt-24 pb-12">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        Browse Data Categories
                    </h1>
                    <p className="text-lg text-slate-300">
                        Explore our comprehensive database through three main pillars of political finance transparency.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Cities Card */}
                    <Link href="/cities" className="group">
                        <div className="glass-panel p-8 rounded-2xl h-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-14 w-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                <Building2 className="h-7 w-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">Cities</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Analyze campaign finance data across different municipalities. Compare spending patterns and donor demographics between cities.
                            </p>
                            <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300 flex items-center gap-2">
                                Explore Cities
                                <span className="block w-4 h-[1px] bg-current group-hover:w-8 transition-all" />
                            </span>
                        </div>
                    </Link>

                    {/* Politicians Card */}
                    <Link href="/politicians" className="group">
                        <div className="glass-panel p-8 rounded-2xl h-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                                <Users className="h-7 w-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">Politicians</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                View individual profiles for candidates and officeholders. Track their funding sources, top donors, and historical data.
                            </p>
                            <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300 flex items-center gap-2">
                                View Profiles
                                <span className="block w-4 h-[1px] bg-current group-hover:w-8 transition-all" />
                            </span>
                        </div>
                    </Link>

                    {/* Lobby Groups Card */}
                    <Link href="/lobby-groups" className="group">
                        <div className="glass-panel p-8 rounded-2xl h-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-14 w-14 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                                <Briefcase className="h-7 w-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">Lobby Groups</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Investigate lobbying organizations and political action committees. See who they support and how much they spend.
                            </p>
                            <span className="text-sm font-medium text-pink-400 group-hover:text-pink-300 flex items-center gap-2">
                                Track Groups
                                <span className="block w-4 h-[1px] bg-current group-hover:w-8 transition-all" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
