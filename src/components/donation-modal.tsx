"use client"

import { useState, useEffect } from "react"
import { X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export function DonationModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)

    useEffect(() => {
        // Check if user has already seen/closed the modal in this session
        const viewed = sessionStorage.getItem("vantage_donation_viewed")
        if (!viewed) {
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 5000) // Show after 5 seconds

            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        setHasInteracted(true)
        sessionStorage.setItem("vantage_donation_viewed", "true")
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/90 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-white/20"
                    >
                        {/* Glow effects */}
                        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-purple-500/20 blur-[50px] pointer-events-none" />
                        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-blue-500/20 blur-[50px] pointer-events-none" />

                        <div className="relative rounded-xl bg-white/5 p-6">
                            <button
                                onClick={handleClose}
                                className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4 pt-2">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Heart className="h-6 w-6 text-white fill-white/20" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-white">Support Transparency</h2>
                                    <p className="text-sm text-slate-300">
                                        VoterVantage is an independent project dedicated to shedding light on local money in politics. Help us keep this data free and accessible for everyone.
                                    </p>
                                </div>

                                <div className="grid w-full gap-3 pt-2">
                                    <Link href="/donate" className="w-full">
                                        <Button
                                            onClick={handleClose}
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02]"
                                        >
                                            Make a Donation
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        onClick={handleClose}
                                        className="w-full text-slate-400 hover:text-white hover:bg-white/5"
                                    >
                                        No thanks, maybe later
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
