"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Search, Grid, ChevronDown } from "lucide-react"

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

                        <Link
                            href="/categories"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
                                <Grid className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-medium">Browse Categories</div>
                                <div className="text-xs text-slate-500">Explore by topic</div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
