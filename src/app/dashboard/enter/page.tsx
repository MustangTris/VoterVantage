'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Enter Data</h1>
                <p className="text-slate-500">
                    Comprehensive manual entry API. Groups optional fields for efficiency.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p>{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Core Transaction Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Core Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile">Filer Profile *</Label>
                            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select who is filing..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {profiles.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type *</Label>
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                                    <button type="button" onClick={() => setTransactionType('CONTRIBUTION')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${transactionType === 'CONTRIBUTION' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                                        Contribution
                                    </button>
                                    <button type="button" onClick={() => setTransactionType('EXPENDITURE')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${transactionType === 'EXPENDITURE' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                                        Expenditure
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount ($) *</Label>
                                <Input id="amount" type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="entity">Full Entity Name *</Label>
                                <Input id="entity" placeholder="Full Legal Name" value={entityName} onChange={e => setEntityName(e.target.value)} required />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Expanded Details (Accordion) */}
                <Accordion type="multiple" className="space-y-4">

                    <AccordionItem value="entity-details" className="border rounded-lg bg-white px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <span className="font-semibold text-slate-700">Entity Details (Address, Job)</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input value={entityFirst} onChange={e => setEntityFirst(e.target.value)} placeholder="Optional" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input value={entityLast} onChange={e => setEntityLast(e.target.value)} placeholder="Optional" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Self Employed?</Label>
                                    <Select value={selfEmployed} onValueChange={setSelfEmployed}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="n">No</SelectItem>
                                            <SelectItem value="y">Yes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Occupation</Label>
                                    <Input value={occupation} onChange={e => setOccupation(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Employer</Label>
                                    <Input value={employer} onChange={e => setEmployer(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address Line 1</Label>
                                <Input value={entityAdr1} onChange={e => setEntityAdr1(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input value={entityCity} onChange={e => setEntityCity(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input value={entityState} onChange={e => setEntityState(e.target.value)} maxLength={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Zip</Label>
                                    <Input value={entityZip} onChange={e => setEntityZip(e.target.value)} />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="treasurer" className="border rounded-lg bg-white px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <span className="font-semibold text-slate-700">Committee / Treasurer Details</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Committee ID (FPPC)</Label>
                                <Input value={cmteId} onChange={e => setCmteId(e.target.value)} placeholder="123456" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Treasurer First Name</Label>
                                    <Input value={treasurerFirst} onChange={e => setTreasurerFirst(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Treasurer Last Name</Label>
                                    <Input value={treasurerLast} onChange={e => setTreasurerLast(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input value={treasurerCity} onChange={e => setTreasurerCity(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input value={treasurerState} onChange={e => setTreasurerState(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Zip</Label>
                                    <Input value={treasurerZip} onChange={e => setTreasurerZip(e.target.value)} />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="admin" className="border rounded-lg bg-white px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <span className="font-semibold text-slate-700">Administrative / Codes</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Expenditure Code</Label>
                                    <Input value={expenditureCode} onChange={e => setExpenditureCode(e.target.value)} placeholder="CMP, LIT..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Memo Code</Label>
                                    <Input value={memoCode} onChange={e => setMemoCode(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ref No</Label>
                                    <Input value={memoRefNo} onChange={e => setMemoRefNo(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description / Memo</Label>
                                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="h-20" />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg" disabled={submitting}>
                    {submitting ? 'Saving Transaction...' : 'Save Complete Record'}
                </Button>
            </form>
        </div>
    )
}
