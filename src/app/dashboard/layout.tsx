import Link from "next/link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50">
            <div className="container mx-auto px-4 py-8 flex-1">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar (Simple for now) */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="flex flex-col gap-2">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Volunteer Tools
                            </div>
                            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-slate-900 transition-all hover:text-blue-600">
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                            <Link href="/dashboard/upload" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600">
                                <span className="text-sm font-medium">Upload Filings</span>
                            </Link>

                            <div className="px-3 py-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Admin Tools
                            </div>
                            <Link href="/dashboard/review" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600">
                                <span className="text-sm font-medium">Review Data</span>
                            </Link>

                            <div className="px-3 py-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Settings
                            </div>
                            <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600">
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
