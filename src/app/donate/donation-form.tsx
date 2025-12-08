"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

const PRESET_AMOUNTS = [10, 25, 50, 100]

export function DonationForm() {
    const [amount, setAmount] = useState<number | string>(25)
    const [customAmount, setCustomAmount] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)

    const handlePresetClick = (val: number) => {
        setAmount(val)
        setCustomAmount("")
    }

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setCustomAmount(val)
        setAmount(val)
    }

    const handleDonate = async () => {
        setIsLoading(true)
        try {
            const finalAmount = parseFloat(amount.toString())
            if (!finalAmount || finalAmount <= 0) {
                alert("Please enter a valid amount")
                return
            }

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: finalAmount,
                }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                console.error("Failed to create checkout session")
            }
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 w-full max-w-sm mx-auto">
            <div className="grid grid-cols-2 gap-3">
                {PRESET_AMOUNTS.map((amt) => (
                    <Button
                        key={amt}
                        variant={amount === amt && !customAmount ? "default" : "outline"}
                        className={`h-12 text-lg ${amount === amt && !customAmount
                            ? "bg-purple-600 hover:bg-purple-700 text-white border-transparent"
                            : "bg-transparent border-slate-700 text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                        onClick={() => handlePresetClick(amt)}
                    >
                        ${amt}
                    </Button>
                ))}
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400">$</span>
                </div>
                <Input
                    type="number"
                    placeholder="Custom Amount"
                    className="pl-7 bg-white/5 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-purple-500"
                    value={customAmount}
                    onChange={handleCustomChange}
                />
            </div>

            <Button
                onClick={handleDonate}
                disabled={isLoading}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Donate $${amount || "0"}`
                )}
            </Button>

            <p className="text-xs text-center text-slate-500">
                Secured by Stripe. Cancel anytime.
            </p>
        </div>
    )
}
