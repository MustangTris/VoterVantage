import Link from "next/link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] relative overflow-hidden bg-background">
            {/* Background Ambience - Liquid Orbs (Absolute position to sit behind everything) */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 py-8 flex-1 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="flex flex-col gap-2">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Volunteer Tools
                            </div>
                            <Link href="/dashboard" className="glass-button flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all border-white/5 hover:border-white/20">
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                            <Link href="/dashboard/upload" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-white/5">
                                <span className="text-sm font-medium">Upload Filings</span>
                            </Link>

                            <div className="px-3 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Admin Tools
                            </div>
                            <Link href="/dashboard/review" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-white/5">
                                <span className="text-sm font-medium">Review Data</span>
                            </Link>
                            <Link href="/dashboard/enter" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-white/5">
                                <span className="text-sm font-medium">Enter Data</span>
                            </Link>

                            <div className="px-3 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Settings
                            </div>
                            <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-white/5">
                                <span className="text-sm font-medium">My Profile</span>
                            </Link>
                        </nav>
                    </aside>
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
