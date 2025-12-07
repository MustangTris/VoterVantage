import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl transition-all">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link className="flex items-center gap-2 font-bold text-xl tracking-tight" href="/">
                    <span className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Voter</span>
                    <span className="text-white">Vantage</span>
                </Link>
                <nav className="hidden gap-8 md:flex">
                    <Link
                        className="text-sm font-medium text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                        href="/"
                    >
                        Home
                    </Link>
                    <Link
                        className="text-sm font-medium text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                        href="/search"
                    >
                        Search Data
                    </Link>
                    <Link
                        className="text-sm font-medium text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                        href="/cities"
                    >
                        Cities
                    </Link>
                    <Link
                        className="text-sm font-medium text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                        href="/about"
                    >
                        About Us
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="search"
                            placeholder="Search politicians..."
                            className="h-9 w-64 rounded-full bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                        />
                    </div>
                    <Link href="/dashboard">
                        <Button size="sm" className="glass-button border-white/20 hover:bg-white/10 text-white rounded-full px-6">Volunteer</Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
