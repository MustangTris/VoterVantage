"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from "@stripe/react-stripe-js"

// Make sure to add your public key if not already in env, or use a placeholder for dev if strict
// Usually NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PRESET_AMOUNTS = [10, 25, 50, 100]

export function DonationForm() {
    const [amount, setAmount] = useState<number | string>(25)
    const [customAmount, setCustomAmount] = useState<string>("")
    const [isRecurring, setIsRecurring] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)

    const handlePresetClick = (val: number) => {
        setAmount(val)
        setCustomAmount("")
    }

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setCustomAmount(val)
        setAmount(val)
    }

    const fetchClientSecret = useCallback(async () => {
        setIsLoading(true);
        try {
            const finalAmount = parseFloat(amount.toString())
            if (!finalAmount || finalAmount <= 0) {
                alert("Please enter a valid amount")
                setIsLoading(false);
                return
            }

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: finalAmount,
                    isRecurring,
                }),
            })

            const data = await response.json()

            if (data.clientSecret) {
                setClientSecret(data.clientSecret)
            } else {
                console.error("Failed to create checkout session")
                alert("Failed to initialize checkout. Please try again.")
            }
        } catch (error) {
            console.error("Error:", error)
            alert("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }, [amount, isRecurring]);

    if (clientSecret) {
        return (
            <div className="w-full" id="checkout">
                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ clientSecret }}
                >
                    <EmbeddedCheckout className="h-[600px] rounded-lg overflow-hidden" />
                </EmbeddedCheckoutProvider>
            </div>
        )
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

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-white/5 text-purple-600 focus:ring-purple-500"
                />
                <label
                    htmlFor="recurring"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                >
                    Make this a monthly donation
                </label>
            </div>

            <Button
                onClick={fetchClientSecret}
                disabled={isLoading}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Donate $${amount || "0"}${isRecurring ? "/mo" : ""}`
                )}
            </Button>

            <p className="text-xs text-center text-slate-500">
                Secured by Stripe. Cancel anytime.
            </p>
        </div>
    )
}
