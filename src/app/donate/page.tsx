import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DonatePage() {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative z-10">

            {/* Background Decor */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

            <div className="text-center mb-12 space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    Empower Voters with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Truth</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                    Your contribution keeps our data transparent, independent, and free for everyone. Help us shine a light on local campaign finance.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">

                {/* Value Prop / Info */}
                <div className="space-y-6">
                    <Card className="glass-panel border-white/10 bg-white/5 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl">Why Donate?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-300">
                            <p>
                                Building and maintaining a real-time, comprehensive database of campaign finance records takes significant resources.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong className="text-white">Server Costs:</strong> Hosting detailed datasets requires robust infrastructure.</li>
                                <li><strong className="text-white">Data Processing:</strong> We automated the ingestion of thousands of messy PDFs.</li>
                                <li><strong className="text-white">Development:</strong> Continuous feature improvements to help you vote smarter.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-white/10 bg-white/5 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl">Our Promise</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-slate-300">
                            <p>
                                We are 100% non-partisan. Every dollar goes directly into maintaining the platform and expanding our coverage to more cities.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Embed Placeholder */}
                <div className="w-full">
                    <Card className="glass-panel border-white/10 bg-white/5 text-white h-full min-h-[500px] flex flex-col">
                        <CardHeader>
                            <CardTitle>Secure Donation</CardTitle>
                            <CardDescription className="text-slate-400">Choose your preferred payment method below.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 rounded-lg bg-black/40 m-6 border border-white/5 flex items-center justify-center relative overflow-hidden group">

                            {/* Placeholder UI for 'Outsourced API' */}
                            <div className="text-center space-y-4 z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                                    <span className="text-3xl">🔒</span>
                                </div>
                                <h3 className="text-xl font-semibold text-white">Payment Processor Loading...</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    This area will load the secure payment form from our trusted partner (e.g., Stripe, PayPal, Donorbox).
                                </p>
                                <div className="pt-6 flex justify-center gap-2 opacity-50">
                                    <div className="h-8 w-12 bg-white/20 rounded"></div>
                                    <div className="h-8 w-12 bg-white/20 rounded"></div>
                                    <div className="h-8 w-12 bg-white/20 rounded"></div>
                                    <div className="h-8 w-12 bg-white/20 rounded"></div>
                                </div>
                            </div>

                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-0"></div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
