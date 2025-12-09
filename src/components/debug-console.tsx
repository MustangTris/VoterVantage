"use client"

import React, { useEffect, useState, useRef } from 'react'
import { AlertCircle, Terminal, X, Trash2, ChevronUp, ChevronDown, CheckCircle, Info } from 'lucide-react'
import { DebugLogger, LogEntry, LogLevel } from '@/lib/debug-logger'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DebugConsole() {
    const [isOpen, setIsOpen] = useState(false)
    const [logs, setLogs] = useState<LogEntry[]>(() => [...DebugLogger.getLogs()])
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Initialize logger (safe to call multiple times)
        DebugLogger.init()

        // Subscribe
        const unsubscribe = DebugLogger.subscribe((entry) => {
            setLogs(prev => [...prev, entry])
        })

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (isOpen && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs, isOpen])

    const clearLogs = () => {
        DebugLogger.clear()
        setLogs([])
    }

    // Icons based on level
    const getIcon = (level: LogLevel) => {
        switch (level) {
            case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
            case 'warn': return <AlertCircle className="h-4 w-4 text-amber-500" />
            case 'info': return <Info className="h-4 w-4 text-blue-500" />
            case 'debug': return <Terminal className="h-4 w-4 text-slate-500" />
        }
    }

    const getColor = (level: LogLevel) => {
        switch (level) {
            case 'error': return 'bg-red-50 border-red-100 text-red-900'
            case 'warn': return 'bg-amber-50 border-amber-100 text-amber-900'
            case 'info': return 'bg-blue-50 border-blue-100 text-blue-900'
            case 'debug': return 'bg-slate-50 border-slate-100 text-slate-700'
        }
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full h-12 w-12 shadow-lg bg-slate-900 hover:bg-slate-800 text-white p-0 flex items-center justify-center"
                >
                    <Terminal className="h-6 w-6" />
                    {logs.filter(l => l.level === 'error').length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white" />
                    )}
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] h-[400px] flex flex-col transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50 sticky top-0">
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold text-sm">Debug Console</span>
                    <span className="text-xs text-slate-400">({logs.length} logs)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={clearLogs} className="h-8 text-xs gap-1 hover:text-red-600">
                        <Trash2 className="h-3 w-3" /> Clear
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Logs Area */}
            <ScrollArea className="flex-1 p-4 font-mono text-xs">
                <div className="space-y-1">
                    {logs.map((log) => (
                        <div key={log.id} className={cn("p-2 rounded border flex items-start gap-2", getColor(log.level))}>
                            <div className="mt-0.5 shrink-0">{getIcon(log.level)}</div>
                            <div className="flex-1 overflow-hidden break-all">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold uppercase text-[10px] opacity-70 tracking-wider w-12">{log.level}</span>
                                    <span className="opacity-50 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="mt-1 whitespace-pre-wrap">{log.message}</div>
                                {log.data && log.data.length > 0 && (
                                    <div className="mt-2 bg-black/5 p-2 rounded overflow-auto max-h-40">
                                        {log.data.map((d, i) => (
                                            <div key={i}>{typeof d === 'object' ? JSON.stringify(d, null, 2) : String(d)}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                        <Terminal className="h-12 w-12 mb-2 opacity-20" />
                        <p>No logs captured yet...</p>
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
