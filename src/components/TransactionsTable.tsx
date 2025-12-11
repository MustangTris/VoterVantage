'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTransactions, Transaction, GetTransactionsResult } from '@/app/actions/transactions'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Wait, I didn't see a `table.tsx` in `ui/`. I'll assume I need to build standard HTML table or use divs if `ui/table` doesn't exist.
// Checking `src/components/ui` list again: accordion, avatar, badge, button, card, glass-card, input, label, scroll-area, select, textarea, toast, toaster.
// NO `table.tsx`. I should build a simple table using Tailwind.

import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react"
import Link from 'next/link'

interface TransactionsTableProps {
    viewType: 'CITY' | 'POLITICIAN' | 'LOBBYIST'
    entityName: string
    title?: string
}

export function TransactionsTable({ viewType, entityName, title = "Transactions" }: TransactionsTableProps) {
    const [data, setData] = useState<Transaction[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState('date')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1) // Reset to page 1 on search
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getTransactions(viewType, entityName, page, 10, debouncedSearch, sortField, sortDir)
            setData(res.data)
            setTotal(res.total)
            setTotalPages(res.totalPages)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [viewType, entityName, page, debouncedSearch, sortField, sortDir])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('desc')
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
    }

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-slate-500 ml-1 inline" />
        return <ArrowUpDown className={`h-4 w-4 ml-1 inline ${sortDir === 'asc' ? 'text-white' : 'text-white'}`} style={{ transform: sortDir === 'asc' ? 'rotate(180deg)' : '' }} />
    }

    const getProfileLink = (id?: string, type?: string) => {
        if (!id || !type) return null
        if (type === 'POLITICIAN') return `/politicians/${id}`
        if (type === 'LOBBYIST') return `/lobby-groups/${id}`
        if (type === 'CITY') return `/cities/${id}`
        return null
    }

    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm w-full">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-white text-xl flex items-center gap-2">
                    {title}
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                </CardTitle>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8 bg-black/20 border-white/10 text-white placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-black/20">
                                <tr>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-white/5" onClick={() => handleSort('date')}>
                                        Date {renderSortIcon('date')}
                                    </th>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-white/5 text-right" onClick={() => handleSort('amount')}>
                                        Amount {renderSortIcon('amount')}
                                    </th>
                                    {viewType !== 'LOBBYIST' && (
                                        <th className="px-4 py-3 cursor-pointer hover:bg-white/5" onClick={() => handleSort('entity')}>
                                            Donor/Entity {renderSortIcon('entity')}
                                        </th>
                                    )}
                                    {viewType === 'LOBBYIST' && (
                                        <th className="px-4 py-3 cursor-pointer hover:bg-white/5">
                                            Recipient (Filer)
                                        </th>
                                    )}
                                    {viewType === 'CITY' && (
                                        <th className="px-4 py-3 cursor-pointer hover:bg-white/5">
                                            Recipient (Candidate)
                                        </th>
                                    )}
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row) => {
                                        const entityLink = getProfileLink(row.entityId, row.entityType)
                                        const filerLink = getProfileLink(row.filerId, row.filerType)

                                        return (
                                            <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-300 whitespace-nowrap">
                                                    {row.date}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${row.type === 'EXPENDITURE' || row.type === 'Expenditure' ? 'text-red-400' : 'text-green-400'
                                                    }`}>
                                                    {formatCurrency(row.amount)}
                                                </td>
                                                {viewType !== 'LOBBYIST' && (
                                                    <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate" title={row.entity}>
                                                        {entityLink ? (
                                                            <Link href={entityLink} className="text-blue-400 hover:text-blue-300 hover:underline">
                                                                {row.entity}
                                                            </Link>
                                                        ) : (
                                                            row.entity
                                                        )}
                                                    </td>
                                                )}
                                                {viewType === 'LOBBYIST' && (
                                                    <td className="px-4 py-3 text-slate-300">
                                                        {filerLink ? (
                                                            <Link href={filerLink} className="text-blue-400 hover:text-blue-300 hover:underline">
                                                                {row.filerName}
                                                            </Link>
                                                        ) : (
                                                            row.filerName
                                                        )}
                                                    </td>
                                                )}
                                                {viewType === 'CITY' && (
                                                    <td className="px-4 py-3 text-slate-300">
                                                        {filerLink ? (
                                                            <Link href={filerLink} className="text-blue-400 hover:text-blue-300 hover:underline">
                                                                {row.filerName}
                                                            </Link>
                                                        ) : (
                                                            row.filerName
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-slate-400 text-xs">
                                                    <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                                                        {row.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-[200px] truncate" title={row.description}>
                                                    {row.description}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-slate-400">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="h-8 w-8 p-0 bg-transparent border-white/10 hover:bg-white/10"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="h-8 w-8 p-0 bg-transparent border-white/10 hover:bg-white/10"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
