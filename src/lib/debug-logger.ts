/* eslint-disable @typescript-eslint/no-explicit-any */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogEntry {
    id: string
    timestamp: number
    level: LogLevel
    message: string
    data?: any[]
}

type Listener = (entry: LogEntry) => void

class DebugLoggerFactory {
    private logs: LogEntry[] = []
    private listeners: Listener[] = []
    private originalConsole: Partial<Console> = {}
    private isIntercepting = false

    constructor() {
        this.logs = []
    }

    public getLogs() {
        return this.logs
    }

    public subscribe(listener: Listener) {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    }

    private notify(entry: LogEntry) {
        this.listeners.forEach(l => l(entry))
    }

    public log(level: LogLevel, message: string, ...data: any[]) {
        const entry: LogEntry = {
            id: Math.random().toString(36).slice(2),
            timestamp: Date.now(),
            level,
            message,
            data: data.length ? data : undefined
        }
        this.logs.push(entry)
        this.notify(entry)
    }

    public clear() {
        this.logs = []
    }

    public init() {
        if (typeof window === 'undefined') return
        if (this.isIntercepting) return

        this.isIntercepting = true
        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            debug: console.debug,
        }

        const intercept = (level: LogLevel) => {
            const original = this.originalConsole[level]
            return (...args: any[]) => {
                // Call original
                if (original) original.apply(console, args)

                // Log internally
                try {
                    // format message
                    const msg = args[0] && typeof args[0] === 'string' ? args[0] : '(object)'
                    const data = args[0] && typeof args[0] === 'string' ? args.slice(1) : args

                    this.log(level, String(msg), ...data)
                } catch {
                    // ignore internal errors
                }
            }
        }

        console.log = intercept('info')
        console.warn = intercept('warn')
        console.error = intercept('error')
        console.debug = intercept('debug')
    }
}

export const DebugLogger = new DebugLoggerFactory()
