"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Globe, Server, Heart } from "lucide-react";

export function DonationSection() {
    return (
        <section className="py-32 relative overflow-hidden shrink-0">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-[#030014] to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="glass-panel max-w-5xl mx-auto rounded-[2.5rem] p-8 md:p-16 border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-xl shadow-2xl relative overflow-hidden group">

                    {/* Decorative background elements inside card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -ml-32 -mb-32 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center text-center">

                        {/* Icons Row */}
                        <div className="flex gap-6 mb-8 text-purple-300/80">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-medium text-slate-500">Independent</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-medium text-slate-500">Transparent</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                                    <Server className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-medium text-slate-500">Open Data</span>
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight leading-tight">
                            Preserving Democracy,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">One Dataset at a Time.</span>
                        </h2>

                        <div className="max-w-2xl mx-auto space-y-6 mb-12">
                            <p className="text-lg text-slate-300 leading-relaxed">
                                VoterVantage is entirely independent and non-profit. We refuse all corporate backing to ensure our data remains unbiased and accessible to every voter.
                            </p>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                Your contribution is the sole engine powering our servers, funding our FOIA requests, and keeping this platform free for the public. <span className="text-white font-medium">Help us shine a light on dark money in local politics.</span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
                            <Link href="/donate" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto h-14 px-10 text-lg rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all duration-300 border-0"
                                >
                                    <Heart className="mr-2 h-5 w-5 fill-white/20" />
                                    Make a Donation
                                </Button>
                            </Link>

                            <Link href="/join" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto h-14 px-10 text-lg rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all duration-300"
                                >
                                    Join as a Volunteer
                                </Button>
                            </Link>
                        </div>

                        <p className="mt-8 text-sm text-slate-500">
                            VoterVantage is a 501(c)(3) non-profit. Contributions are tax-deductible.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
