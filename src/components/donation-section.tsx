"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DonationSection() {
    return (
        <section className="py-24 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="glass-panel max-w-4xl mx-auto rounded-3xl p-12 md:p-16 border-purple-500/20 bg-gradient-to-b from-white/5 to-transparent">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                        We give you the tools to light the way
                    </h2>
                    <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto italic">
                        "Your support fuels us every day."
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/join">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12 px-8 rounded-full border-white/10 bg-transparent text-white hover:bg-white/10"
                            >
                                Join as a Volunteer
                            </Button>
                        </Link>
                        <Link href="/donate">
                            <Button
                                size="lg"
                                className="glass-button h-12 px-8 rounded-full border-purple-500/50 hover:bg-purple-500/20"
                            >
                                Donate
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
