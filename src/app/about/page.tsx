import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Database, PieChart, Users } from "lucide-react"
import Link from "next/link"
import BackgroundAscii from "./BackgroundAscii"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            <BackgroundAscii />
            {/* Background Ambience */}
            <div className="absolute top-[10%] left-[50%] translate-x-[-50%] w-[70%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4">
                <div className="container mx-auto text-center z-10 relative">
                    <div className="inline-flex items-center rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-purple-200 mb-8 border-purple-500/30">
                        <span className="flex h-2 w-2 rounded-full bg-purple-400 mr-2 shadow-[0_0_10px_rgba(192,132,252,0.8)]"></span>
                        Our Mission
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
                        Informed and Free, <br />
                        <span className="text-gradient drop-shadow-sm">Together We Shape Democracy.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 font-light">
                        Your right to know, our mission to show.
                    </p>
                    <div className="max-w-3xl mx-auto glass-panel p-8 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                        <p className="text-lg text-slate-300 leading-relaxed text-left">
                            VoterVantage is your only non-profit database of local political campaign finance disclosures.
                            We provide open-source data regarding local political donations. Currently serving the Coachella Valley,
                            we look forward to bringing this transparency to a city near you!
                        </p>
                    </div>
                </div>
            </section>

            {/* The Workflow Section */}
            <section className="py-20 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">The Workflow</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            How we turn complex paperwork into accessible data for everyone.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Step 1 */}
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/5 transition-all duration-500">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-white/5 group-hover:text-purple-500/10 transition-colors">1</div>
                            <div className="relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 text-blue-400 border border-white/10">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Acquire Data</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    We reach out to city clerk's offices to complete FOIA requests and obtain Form 460s—bi-annual summaries containing all relative monetary contributions for candidates.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/5 transition-all duration-500">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-white/5 group-hover:text-blue-500/10 transition-colors">2</div>
                            <div className="relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 text-purple-400 border border-white/10">
                                    <Database className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Parse & Clean</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    We parse and clean these complex PDF filings into workable datasets. This transforms static pages into dynamic, queryable information ready for analysis.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/5 transition-all duration-500">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-white/5 group-hover:text-pink-500/10 transition-colors">3</div>
                            <div className="relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center mb-6 text-pink-400 border border-white/10">
                                    <PieChart className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Visualize</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    We create pivot tables, charts, and graphs from the processed data. This allows voters to easily see "Total Contributions Received" and "Top Donors" at a glance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact / Cities Section */}
            <section className="py-20 relative z-10 bg-black/20">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                            Empowering Voters Across the Valley
                        </h2>
                        <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                            Transparency is key to ensuring voter trust. By offering a comprehensive view of who is donating to local candidates, VoterVantage empowers voters to make informed decisions at the polls.
                        </p>
                        <p className="text-slate-400 mb-8">
                            We proudly serve cities including Desert Hot Springs, Palm Springs, Rancho Mirage, Palm Desert, La Quinta, Indio, and Coachella.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/cities">
                                <Button className="glass-button h-12 px-8 rounded-full">
                                    Find Your City <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-md">
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Community Powered</h4>
                                    <p className="text-sm text-slate-400">Volunteer run, donor supported</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-sm text-slate-400 mb-1">Active Regions</div>
                                    <div className="font-semibold text-white">Coachella Valley</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-sm text-slate-400 mb-1">Data Source</div>
                                    <div className="font-semibold text-white">Form 460 Filings</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



        </div>
    )
}
