"use client"

import { useState, useRef, useEffect } from "react"
import { signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings, Loader2 } from "lucide-react"

interface UserMenuProps {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
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

    const handleLogin = async () => {
        setIsLoading(true)
        try {
            await signIn("google", { callbackUrl: "/dashboard" })
        } catch (error) {
            console.error("Login failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await signOut({ callbackUrl: "/" })
        } catch (error) {
            console.error("Logout failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) {
        return (
            <Button
                size="sm"
                onClick={handleLogin}
                disabled={isLoading}
                className="glass-button border-white/20 hover:bg-purple-600/20 text-white rounded-full px-6 transition-all"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Login
            </Button>
        )
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pl-3 pr-1 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
                <span className="text-sm font-medium text-slate-200 hidden sm:block">
                    {user.name?.split(' ')[0] || 'User'}
                </span>
                <div className="h-8 w-8 rounded-full overflow-hidden bg-purple-600/20 border border-white/10 flex items-center justify-center">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || "User"}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-4 w-4 text-purple-300" />
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-[#030014]/90 backdrop-blur-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                        <Link
                            href="/dashboard"
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="h-4 w-4" />
                            Dashboard
                        </Link>
                        {/* Add more links here if needed */}
                    </div>
                    <div className="p-1 border-t border-white/5">
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
