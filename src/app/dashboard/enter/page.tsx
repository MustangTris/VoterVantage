'use client'

import { useState, useEffect } from 'react'
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, CheckCircle, Upload, ChevronDown } from "lucide-react"
import { getProfiles, saveManualTransaction } from "./actions"

export default function EnterDataPage() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form State
    const [selectedProfile, setSelectedProfile] = useState('')
    const [transactionType, setTransactionType] = useState<'CONTRIBUTION' | 'EXPENDITURE'>('CONTRIBUTION')

    // Core
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState('')
    const [entityName, setEntityName] = useState('')
    const [description, setDescription] = useState('')

    // Details
    const [entityFirst, setEntityFirst] = useState('')
    const [entityLast, setEntityLast] = useState('')
    const [occupation, setOccupation] = useState('')
    const [employer, setEmployer] = useState('')
    const [selfEmployed, setSelfEmployed] = useState('n')
    const [cmteId, setCmteId] = useState('')

    // Address
    const [entityAdr1, setEntityAdr1] = useState('')
    const [entityAdr2, setEntityAdr2] = useState('')
    const [entityCity, setEntityCity] = useState('')
    const [entityState, setEntityState] = useState('')
    const [entityZip, setEntityZip] = useState('')

    // Treasurer
    const [treasurerFirst, setTreasurerFirst] = useState('')
    const [treasurerLast, setTreasurerLast] = useState('')
    const [treasurerCity, setTreasurerCity] = useState('')
    const [treasurerState, setTreasurerState] = useState('')
    const [treasurerZip, setTreasurerZip] = useState('')

    // Admin
    const [expenditureCode, setExpenditureCode] = useState('')
    const [memoCode, setMemoCode] = useState('')
    const [memoRefNo, setMemoRefNo] = useState('')

    useEffect(() => {
        async function load() {
            const res = await getProfiles()
            if (res.success) {
                setProfiles(res.profiles || [])
            } else {
                setMessage({ type: 'error', text: 'Failed to load profiles.' })
            }
            setLoading(false)
        }
        load()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProfile || !amount || !date || !entityName) {
            setMessage({ type: 'error', text: 'Please fill in all required fields (marked *).' })
            return
        }

        setSubmitting(true)
        setMessage(null)

        try {
            const result = await saveManualTransaction({
                profileId: selectedProfile,
                transactionType,
                amount: parseFloat(amount),
                date,
                entityName,
                description,

                entityFirst, entityLast,
                occupation, employer, selfEmployed,
                cmteId,

                entityAdr1, entityAdr2, entityCity, entityState, entityZip,

                treasurerFirst, treasurerLast, treasurerCity, treasurerState, treasurerZip,

                expenditureCode, memoCode, memoRefNo
            })

            if (result.success) {
                setMessage({ type: 'success', text: 'Transaction saved successfully!' })
                // Reset core fields but keep profile
                setAmount('')
                setEntityName('')
                setDescription('')
                // Reset optional fields
                setEntityFirst(''); setEntityLast('')
                setOccupation(''); setEmployer(''); setCmteId('')
                setEntityAdr1(''); setEntityCity(''); setEntityZip('')
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to save.' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Enter Data</h1>
                <p className="text-slate-400">
                    Comprehensive manual entry API. Groups optional fields for efficiency.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 border backdrop-blur-md ${message.type === 'success' ? 'bg-green-500/10 text-green-300 border-green-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p>{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Core Transaction Details */}
                <GlassCard>
                    <GlassCardHeader>
                        <GlassCardTitle>Core Details</GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile" className="text-slate-300">Filer Profile *</Label>
                            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-blue-500/50">
                                    <SelectValue placeholder="Select who is filing..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    {profiles.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="focus:bg-white/10 focus:text-white">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Type *</Label>
                                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                                    <button type="button" onClick={() => setTransactionType('CONTRIBUTION')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${transactionType === 'CONTRIBUTION' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        Contribution
                                    </button>
                                    <button type="button" onClick={() => setTransactionType('EXPENDITURE')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${transactionType === 'EXPENDITURE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        Expenditure
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-slate-300">Date *</Label>
                                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 [color-scheme:dark]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-slate-300">Amount ($) *</Label>
                                <Input id="amount" type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="entity" className="text-slate-300">Full Entity Name *</Label>
                                <Input id="entity" placeholder="Full Legal Name" value={entityName} onChange={e => setEntityName(e.target.value)} required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50" />
                            </div>
                        </div>
                    </GlassCardContent>
                </GlassCard>

                {/* 2. Expanded Details (Accordion) */}
                <Accordion type="multiple" className="space-y-4">

                    <AccordionItem value="entity-details" className="border border-white/10 rounded-lg bg-white/5 px-4">
                        <AccordionTrigger className="hover:no-underline hover:text-white text-slate-300">
                            <span className="font-semibold">Entity Details (Address, Job)</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4 border-t border-white/5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">First Name</Label>
                                    <Input value={entityFirst} onChange={e => setEntityFirst(e.target.value)} placeholder="Optional"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Last Name</Label>
                                    <Input value={entityLast} onChange={e => setEntityLast(e.target.value)} placeholder="Optional"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Self Employed?</Label>
                                    <Select value={selfEmployed} onValueChange={setSelfEmployed}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            <SelectItem value="n" className="focus:bg-white/10 focus:text-white">No</SelectItem>
                                            <SelectItem value="y" className="focus:bg-white/10 focus:text-white">Yes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Occupation</Label>
                                    <Input value={occupation} onChange={e => setOccupation(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Employer</Label>
                                    <Input value={employer} onChange={e => setEmployer(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400">Address Line 1</Label>
                                <Input value={entityAdr1} onChange={e => setEntityAdr1(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">City</Label>
                                    <Input value={entityCity} onChange={e => setEntityCity(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">State</Label>
                                    <Input value={entityState} onChange={e => setEntityState(e.target.value)} maxLength={2}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Zip</Label>
                                    <Input value={entityZip} onChange={e => setEntityZip(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="treasurer" className="border border-white/10 rounded-lg bg-white/5 px-4">
                        <AccordionTrigger className="hover:no-underline hover:text-white text-slate-300">
                            <span className="font-semibold">Committee / Treasurer Details</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4 border-t border-white/5">
                            <div className="space-y-2">
                                <Label className="text-slate-400">Committee ID (FPPC)</Label>
                                <Input value={cmteId} onChange={e => setCmteId(e.target.value)} placeholder="123456"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Treasurer First Name</Label>
                                    <Input value={treasurerFirst} onChange={e => setTreasurerFirst(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Treasurer Last Name</Label>
                                    <Input value={treasurerLast} onChange={e => setTreasurerLast(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">City</Label>
                                    <Input value={treasurerCity} onChange={e => setTreasurerCity(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">State</Label>
                                    <Input value={treasurerState} onChange={e => setTreasurerState(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Zip</Label>
                                    <Input value={treasurerZip} onChange={e => setTreasurerZip(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="admin" className="border border-white/10 rounded-lg bg-white/5 px-4">
                        <AccordionTrigger className="hover:no-underline hover:text-white text-slate-300">
                            <span className="font-semibold">Administrative / Codes</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4 border-t border-white/5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Expenditure Code</Label>
                                    <Input value={expenditureCode} onChange={e => setExpenditureCode(e.target.value)} placeholder="CMP, LIT..."
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Memo Code</Label>
                                    <Input value={memoCode} onChange={e => setMemoCode(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Ref No</Label>
                                    <Input value={memoRefNo} onChange={e => setMemoRefNo(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-300">Description / Memo</Label>
                                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)}
                                    className="h-20 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50" />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-6 text-lg shadow-lg shadow-blue-900/20" disabled={submitting}>
                    {submitting ? 'Saving Transaction...' : 'Save Complete Record'}
                </Button>
            </form>
        </div>
    )
}
