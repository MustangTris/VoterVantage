"use client"

import * as React from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { ToastProps as HookToastProps } from "@/hooks/use-toast"

// Re-export hook props
export type ToastProps = HookToastProps

export function Toast({
    id,
    title,
    description,
    action,
    open,
    onOpenChange,
    variant = "default",
    className,
}: ToastProps & {
    onOpenChange?: (open: boolean) => void
}) {
    return (
        <div
            className={cn(
                "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all animate-in slide-in-from-right-full fade-in duration-300",
                // Glassmorphism base
                "bg-[#0a0a0a]/90 backdrop-blur-xl border-white/10",
                variant === "default" && "border-l-4 border-l-purple-500", // Default / Info
                variant === "success" && "border-l-4 border-l-green-500",
                variant === "destructive" && "border-l-4 border-l-red-500",
                className
            )}
        >
            {/* Glow effect matching modal */}
            <div
                className={cn(
                    "absolute inset-0 opacity-20 pointer-events-none",
                    variant === "default" && "bg-gradient-to-r from-purple-500/10 to-transparent",
                    variant === "success" && "bg-gradient-to-r from-green-500/10 to-transparent",
                    variant === "destructive" && "bg-gradient-to-r from-red-500/10 to-transparent"
                )}
            />

            <div className="flex gap-3 w-full z-10">
                <div className="flex-shrink-0 pt-0.5">
                    {variant === "default" && <Info className="h-5 w-5 text-purple-400" />}
                    {variant === "success" && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    {variant === "destructive" && <AlertCircle className="h-5 w-5 text-red-400" />}
                </div>

                <div className="flex-1 space-y-1">
                    {title && (
                        <div className="text-sm font-semibold text-white">
                            {title}
                        </div>
                    )}
                    {description && (
                        <div className="text-sm opacity-90 text-slate-300">
                            {description}
                        </div>
                    )}
                </div>
            </div>

            {action && <div className="z-10">{action}</div>}

            <button
                onClick={() => onOpenChange?.(false)}
                className="absolute right-2 top-2 rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:text-white focus:opacity-100 group-hover:opacity-100 group-hover:bg-white/10 z-20"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
