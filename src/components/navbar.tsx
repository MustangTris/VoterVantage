import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { auth } from "@/auth"
import { UserMenu } from "@/components/user-menu"
import { MobileMenu } from "@/components/mobile-menu"
import { SearchMenu } from "@/components/search-menu"

export async function Navbar() {
    const session = await auth()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl transition-all">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link className="flex items-center gap-3 font-bold text-xl tracking-tight group" href="/">
                    <div className="relative h-10 w-10 transition-transform group-hover:scale-110 duration-300">
                        <div className="absolute inset-0 bg-purple-600 rounded-full blur-[20px] opacity-40 animate-pulse"></div>
                        <Image
                            src="/logo.png"
                            alt="VoterVantage Logo"
                            width={40}
                            height={40}
                            className="relative h-full w-full object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        />
                    </div>
                    <div className="flex flex-row items-center gap-1 leading-none justify-center ml-1">
                        <span className="text-xl font-extrabold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
                            Voter
                        </span>
                        <span className="text-xl font-bold uppercase tracking-tight text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
                            Vantage
                        </span>
                    </div>
                </Link>
                <nav className="hidden gap-8 md:flex">
                    <Link
                        className="text-sm font-medium text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                        href="/"
                    >
                        Home
                    </Link>
                    <SearchMenu />
                    <Link
                        className="text-sm font-medium text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                        href="/about"
                    >
                        About Us
                    </Link>

                </nav>
                <div className="flex items-center gap-4">
                    <form action="/search" className="relative hidden sm:block">
                        <input
                            type="search"
                            name="q"
                            placeholder="Search politicians..."
                            className="h-9 w-64 rounded-full bg-white/5 border border-white/10 pl-4 pr-10 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                    <Link href="/donate" className="hidden sm:block">
                        <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full px-4">Donate</Button>
                    </Link>
                    <UserMenu user={session?.user} />
                    <MobileMenu />
                </div>
            </div>
        </header>
    )
}
