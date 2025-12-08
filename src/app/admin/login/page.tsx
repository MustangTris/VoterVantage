'use client'

import { useActionState, useState, useEffect } from 'react'
import { authenticate } from '@/app/lib/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

export default function Login() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)
    const [captcha, setCaptcha] = useState<{ num1: number, num2: number, answer: number } | null>(null)
    const [captchaInput, setCaptchaInput] = useState('')
    const [isCaptchaValid, setIsCaptchaValid] = useState(false)

    useEffect(() => {
        generateCaptcha()
    }, [])

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1
        const num2 = Math.floor(Math.random() * 10) + 1
        setCaptcha({ num1, num2, answer: num1 + num2 })
        setCaptchaInput('')
        setIsCaptchaValid(false)
    }

    const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setCaptchaInput(val)
        if (captcha && parseInt(val) === captcha.answer) {
            setIsCaptchaValid(true)
        } else {
            setIsCaptchaValid(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="admin@votervantage.org"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Math Captcha */}
                        {captcha && (
                            <div className="space-y-2 p-3 bg-slate-100 rounded-md">
                                <Label htmlFor="captcha" className="text-sm font-medium">
                                    Security Check: What is {captcha.num1} + {captcha.num2}?
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="captcha"
                                        type="number"
                                        value={captchaInput}
                                        onChange={handleCaptchaChange}
                                        placeholder="?"
                                        className="w-20"
                                        required
                                    />
                                    {!isCaptchaValid && captchaInput !== '' && (
                                        <span className="text-red-500 text-sm flex items-center">Incorrect</span>
                                    )}
                                    {isCaptchaValid && (
                                        <span className="text-green-600 text-sm flex items-center">Correct</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div
                            className="flex h-8 items-end space-x-1"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {errorMessage && (
                                <>
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <p className="text-sm text-red-500">{errorMessage}</p>
                                </>
                            )}
                        </div>
                        <Button className="w-full" disabled={isPending || !isCaptchaValid}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign in
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
