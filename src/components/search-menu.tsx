"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Search, Grid, ChevronDown, Map, Building2, Users, Briefcase } from "lucide-react"

export function SearchMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all group focus:outline-none"
            >
                Search Data
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-56 origin-top-left rounded-xl border border-white/10 bg-[#030014]/90 backdrop-blur-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="p-1">
                        <Link
                            href="/search"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                                <Search className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-medium">Search Database</div>
                                <div className="text-xs text-slate-500">Find specific records</div>
                            </div>
                        </Link>

                        {/* Cities */}
                        <Link
                            href="/cities"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-medium">Browse Cities</div>
                                <div className="text-xs text-slate-500">Municipal data</div>
                            </div>
                        </Link>

                        {/* Counties */}
                        <Link
                            href="/counties"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/20 text-orange-400">
                                <Map className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-medium">Browse Counties</div>
                                <div className="text-xs text-slate-500">County data</div>
                            </div>
                        </Link>

                        {/* Politicians */}
                        <Link
                            href="/politicians"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-medium">Browse Politicians</div>
                                <div className="text-xs text-slate-500">Candidates & officials</div>
                            </div>
                        </Link>

                        {/* Donors */}
                        <Link
                            href="/lobby-groups"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-pink-500/20 text-pink-400">
                                <Briefcase className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-medium">Browse Donors</div>
                                <div className="text-xs text-slate-500">Funding sources</div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
