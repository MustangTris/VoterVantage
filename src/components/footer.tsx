import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-[#030014]/50 backdrop-blur-xl transition-all mt-auto relative z-50">
            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-4">
                        <Link className="flex items-center gap-3 font-bold text-xl tracking-tight group" href="/">
                            <div className="relative h-12 w-12 transition-transform group-hover:scale-110 duration-300">
                                <div className="absolute inset-0 bg-purple-600 rounded-full blur-[25px] opacity-30 animate-pulse"></div>
                                <Image
                                    src="/logo.png"
                                    alt="VoterVantage Logo"
                                    width={48}
                                    height={48}
                                    className="relative h-full w-full object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                                />
                            </div>
                            <div className="flex flex-col leading-none justify-center">
                                <span className="text-xl font-extrabold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-500 drop-shadow-[0_0_15px_rgba(192,132,252,0.6)]">
                                    Voter
                                </span>
                                <span className="text-[0.65rem] font-light uppercase tracking-[0.3em] text-purple-200/90 ml-[2px] drop-shadow-[0_0_5px_rgba(192,132,252,0.4)]">
                                    Vantage
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            Your right to know, our mission to show. VoterVantage provides open-source data regarding local political donations.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/search" className="hover:text-purple-400 transition-colors">Search Data</Link></li>
                            <li><Link href="/cities" className="hover:text-purple-400 transition-colors">Cities</Link></li>
                            <li><Link href="/dashboard" className="hover:text-purple-400 transition-colors">Volunteer Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact</Link></li>
                            <li><Link href="/careers" className="hover:text-purple-400 transition-colors">Join the Team</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/privacy-policy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/accessibility-statement" className="hover:text-purple-400 transition-colors">Accessibility Statement</Link></li>
                            <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs text-slate-500">
                                © {new Date().getFullYear()} VoterVantage. All rights reserved.
                            </p>
                            <p className="text-[10px] text-slate-600 max-w-xl">
                                VoterVantage is a 501(c)(3) non-profit organization. Information provided is for educational and non-partisan purposes.
                                We do not endorse or oppose any candidate for public office.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        {/* Social placeholders could go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
