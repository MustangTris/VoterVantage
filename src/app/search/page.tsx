
'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, TrendingUp, ArrowRight, FileText, User, Building2, Banknote } from "lucide-react"
import { useState, useEffect } from "react"
import { searchDatabase, SearchResult, getConnectedCities } from "./actions"
import dynamic from 'next/dynamic'
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const SoCalMap = dynamic(() => import('@/components/SoCalMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
            <div className="text-slate-500">Loading Map...</div>
        </div>
    )
})

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030014]" />}>
            <SearchPageContent />
        </Suspense>
    )
}

function SearchPageContent() {
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get("q") || ""
    const [query, setQuery] = useState(initialQuery)
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(!!initialQuery)
    const [connectedCities, setConnectedCities] = useState<string[]>([])

    useEffect(() => {
        getConnectedCities().then(cities => {
            setConnectedCities(cities)
        })

        // Auto-search if query exists
        if (initialQuery) {
            setIsSearching(true)
            searchDatabase(initialQuery)
                .then(data => {
                    setResults(data)
                })
                .catch(error => {
                    console.error("Search failed", error)
                })
                .finally(() => {
                    setIsSearching(false)
                })
        }
    }, [initialQuery])

    const trendingSearches = [
        "Palm Springs City Council",
        "Measure A",
        "Police Union",
        "Hotel Development",
        "Mayor Johnson",
        "Riverside County",
        "Affordable Housing"
    ]

    const handleSearch = async () => {
        if (!query.trim()) return

        setIsSearching(true)
        setHasSearched(true)
        try {
            const data = await searchDatabase(query)
            setResults(data)
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const getIconForType = (type: string) => {
        switch (type) {
            case 'POLITICIAN': return <User className="h-5 w-5 text-blue-400" />
            case 'CITY': return <Building2 className="h-5 w-5 text-purple-400" />
            case 'FILING': return <FileText className="h-5 w-5 text-green-400" />
            case 'TRANSACTION': return <Banknote className="h-5 w-5 text-yellow-400" />
            default: return <Search className="h-5 w-5 text-slate-400" />
        }
    }

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Ambience - Liquid Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 pt-32 pb-20 md:pt-40 relative z-10 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        What are you looking for?
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Search across candidates, committees, and city data.
                    </p>
                </div>

                {/* Massive Search Bar */}
                <div className="w-full max-w-3xl relative mb-16 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search politicians, donors, measures..."
                            className="w-full h-16 md:h-20 bg-white/5 border border-white/10 rounded-full pl-16 pr-6 text-lg md:text-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-xl"
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="absolute right-2 top-2 bottom-2 md:top-3 md:bottom-3 rounded-full px-6 bg-purple-600 hover:bg-purple-700 text-white border-0 transition-colors h-auto"
                        >
                            {isSearching ? "Searching..." : "Search"}
                        </Button>
                    </div>
                </div>

                {/* Search Results */}
                {hasSearched && (
                    <div className="w-full max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-4 text-slate-300">
                            <Search className="h-5 w-5 text-blue-400" />
                            <span className="font-medium">
                                {results.length > 0 ? `Found ${results.length} results` : "No results found"}
                            </span>
                        </div>

                        <div className="grid gap-4">
                            {results.map((result) => {
                                const getLink = (type: string, id: string) => {
                                    switch (type) {
                                        case 'POLITICIAN': return `/politicians/${id}`
                                        case 'CITY': return `/cities/${id}`
                                        case 'LOBBYIST': return `/lobby-groups/${id}`
                                        default: return '#'
                                    }
                                }

                                return (
                                    <Link
                                        key={result.id}
                                        href={getLink(result.type, result.id)}
                                        className="block"
                                    >
                                        <div
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                                    {getIconForType(result.type)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                                        {result.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                                                            {result.type === 'LOBBYIST' ? 'DONOR' : result.type}
                                                        </span>
                                                        <span>{result.description}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Example Pages for Review */}
                <div className="w-full max-w-3xl mb-12">
                    <div className="flex items-center gap-2 mb-4 text-slate-300">
                        <Search className="h-5 w-5 text-blue-400" />
                        <span className="font-medium">Browse by Category</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/cities">
                            <div className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group border border-white/5 hover:border-purple-500/30">
                                <span className="text-white font-medium">Cities</span>
                                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                            </div>
                        </Link>
                        <Link href="/politicians">
                            <div className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group border border-white/5 hover:border-blue-500/30">
                                <span className="text-white font-medium">Politicians</span>
                                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                        </Link>
                        <Link href="/lobby-groups">
                            <div className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group border border-white/5 hover:border-green-500/30">
                                <span className="text-white font-medium">Donors</span>
                                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-green-400 transition-colors" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Interactive SoCal Map */}
                <div className="w-full max-w-6xl mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Explore Data by Location</h2>
                        <p className="text-slate-400">Interactive map of Southern California coverage</p>
                    </div>

                    <SoCalMap connectedCities={connectedCities} />
                </div>

                {/* Trending Searches (Only show if not searching or no results) */}
                {(!hasSearched || results.length === 0) && (
                    <div className="w-full max-w-4xl">
                        <div className="flex items-center gap-2 mb-6 text-slate-300">
                            <TrendingUp className="h-5 w-5 text-purple-400" />
                            <span className="font-medium">Trending Searches</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {trendingSearches.map((term, index) => (
                                <div
                                    key={index}
                                    className="glass-panel px-6 py-3 rounded-full text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 cursor-pointer transition-all duration-300 flex items-center gap-2 group"
                                    onClick={() => {
                                        setQuery(term)
                                        // Optional: trigger search immediately
                                    }}
                                >
                                    {term}
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-purple-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
