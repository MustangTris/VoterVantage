
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Users, Search, Database } from "lucide-react"

export default function JoinPage() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">

            {/* Background Ambience - Liquid Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4">
                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-flex items-center rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-purple-200 mb-8 border-purple-500/30">
                        <span className="flex h-2 w-2 rounded-full bg-purple-400 mr-2 shadow-[0_0_10px_rgba(192,132,252,0.8)]"></span>
                        Join the Movement
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-white">
                        Be the Light in <br />
                        <span className="text-gradient">Local Democracy</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-12 leading-relaxed">
                        We are building the most comprehensive database of local political influence.
                        Paper filings hide the truth—help us digitize them and give power back to the voters.
                    </p>

                    <Link href="/signup">
                        <Button size="lg" className="glass-button h-14 px-10 text-lg rounded-full font-medium tracking-wide">
                            Apply to Volunteer
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Roles Section */}
            <section className="py-20 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Open Roles</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            We need diverse skills to make this happen. Find where you fit in.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Role 1 */}
                        <div className="glass-panel p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 border border-white/5">
                            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                                <Database className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Data Specialist</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Take raw PDF filings from city clerks and digitize them using our specialized intake tools. Accuracy is key.
                            </p>
                            <ul className="space-y-2 mb-8 text-slate-300 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> Data Entry & Verification</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> 5-10 hours / week</li>
                            </ul>
                        </div>

                        {/* Role 2 */}
                        <div className="glass-panel p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 border border-white/5">
                            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Researcher</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Connect the dots. Who is that LLC? Who owns that property? Help us identify the true sources of funds.
                            </p>
                            <ul className="space-y-2 mb-8 text-slate-300 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Investigation & OSINT</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> 5-10 hours / week</li>
                            </ul>
                        </div>

                        {/* Role 3 */}
                        <div className="glass-panel p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 border border-white/5">
                            <div className="h-12 w-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Community Lead</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Spread the word in your city. Organize local watch parties for city council meetings and recruitment.
                            </p>
                            <ul className="space-y-2 mb-8 text-slate-300 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-pink-400" /> Outreach & Events</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-pink-400" /> Variable hours</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4 text-center">
                    <div className="glass-panel max-w-3xl mx-auto rounded-3xl p-12 border-purple-500/20 bg-gradient-to-b from-white/5 to-transparent">
                        <h2 className="text-3xl font-bold mb-6 text-white">Ready to make an impact?</h2>
                        <p className="text-slate-300 mb-8">
                            Join hundreds of other volunteers bringing transparency to their local government.
                        </p>
                        <Link href="/signup">
                            <Button className="w-full sm:w-auto bg-white text-purple-900 hover:bg-slate-200 h-12 px-8 rounded-full font-bold">
                                Create Volunteer Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    )
}
