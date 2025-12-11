
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight, Building2, TrendingUp } from "lucide-react"
import { getCountyOverviewStats, getAllCounties } from "@/app/actions/category-stats"

export const dynamic = 'force-dynamic'

export default async function CountiesPage() {
    const stats = await getCountyOverviewStats()
    const allCounties = await getAllCounties()

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

            <section className="relative pt-32 pb-20 px-4">
                <div className="container mx-auto z-10 relative">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
                            County <span className="text-gradient">Dashboards</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            Explore local political contribution data by county jurisdiction.
                        </p>
                    </div>

                    {/* Aggregate Stats */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16 max-w-5xl mx-auto">
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Active Counties</div>
                                    <div className="text-2xl font-bold text-white">{stats.totalCities}</div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-slate-400 mb-1">Top County by Activity</div>
                                    {stats.topCitiesByRaised.length > 0 ? (
                                        <div className="flex justify-between items-end">
                                            <div className="text-xl font-bold text-white">{stats.topCitiesByRaised[0].name}</div>
                                            <div className="text-lg font-bold text-green-400">${stats.topCitiesByRaised[0].total_raised.toLocaleString()}</div>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500">No data available</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-16">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white/80 border-b border-white/10 pb-2 pl-2">
                                Active Counties
                            </h2>
                            {allCounties.length === 0 ? (
                                <div className="text-slate-400 text-center py-12 bg-white/5 rounded-xl border border-white/10">
                                    No counties found. Upload data to get started.
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {allCounties.map((county) => (
                                        <Link href={`/counties/${county.id}`} key={county.id}>
                                            <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all duration-300 group border border-white/5 hover:border-blue-500/30">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <span className="font-semibold text-white text-lg">{county.name}</span>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
