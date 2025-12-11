"use client"

import { authenticate } from "@/actions/auth"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Link from "next/link"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

function LoginButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
        </Button>
    )
}

export default function LoginPage() {
    const [errorMessage, formAction] = useActionState(authenticate, undefined)
    const { toast } = useToast()

    useEffect(() => {
        if (errorMessage) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: errorMessage,
            })
        }
    }, [errorMessage, toast])

    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
            {/* Background Ambience - Liquid Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />

            <Card className="w-full max-w-sm glass-panel border-white/10 relative z-10">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-slate-400">
                        Sign in to access the Volunteer Dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-200">Password</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10"
                            />
                        </div>
                        {errorMessage && (
                            <div className="text-sm text-red-400 font-medium">{errorMessage}</div>
                        )}
                        <LoginButton />
                    </form>


                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-slate-400">
                        Don't have an account?{" "}
                        <Link href="/signup" className="underline text-purple-400 hover:text-purple-300">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
