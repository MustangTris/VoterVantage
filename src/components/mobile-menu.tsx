"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, FileText, Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-slate-300 hover:text-white z-50 relative"
            >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
            </Button>

            {/* Backdrop */}
            <div
                onClick={toggleMenu}
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            />

            {/* Menu Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 w-full sm:w-80 bg-[#0a051e] border-l border-white/10 z-50 p-6 shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex justify-end mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMenu}
                        className="text-slate-400 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Mobile Search */}
                    <form action="/search" className="relative">
                        <input
                            type="search"
                            name="q"
                            placeholder="Search politicians, donors..."
                            className="h-10 w-full rounded-2xl bg-white/5 border border-white/10 pl-4 pr-10 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                            <Search className="h-4 w-4" />
                        </button>
                    </form>

                    <nav className="flex flex-col gap-4">
                        {[
                            { href: "/", label: "Home", icon: null },
                            { href: "/search", label: "Search Data", icon: FileText },
                            { href: "/categories", label: "Browse Categories", icon: Building2 },
                            { href: "/counties", label: "Counties", icon: Building2 },
                            { href: "/about", label: "About Us", icon: User },
                        ].map((link) => (
                            <div key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={toggleMenu}
                                    className="flex items-center gap-4 text-lg font-medium text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-all"
                                >
                                    {link.icon && <link.icon className="h-5 w-5 text-purple-400" />}
                                    {link.label}
                                </Link>
                            </div>
                        ))}
                    </nav>

                    <div className="mt-4 pt-6 border-t border-white/10">
                        <Link href="/donate" onClick={toggleMenu} className="w-full">
                            <Button className="w-full glass-button rounded-full">
                                Donate
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
