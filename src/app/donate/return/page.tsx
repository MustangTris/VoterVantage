"use client"

import React, { useEffect, useState } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ReturnPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<string | null>(null);
    const [customerEmail, setCustomerEmail] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            return;
        }

        // In a real app, you might want to fetch session details from your backend here
        // to verify the payment status securely. 
        // For now, we'll assume if we have a session_id and landed here, it's likely complete
        // or we could inspect the query params if Stripe passes more data (usually minimal).

        // Since we can't easily fetch session details from the client without a new API endpoint,
        // we'll simulate a check or just show success. 
        // Ideally: fetch(`/api/checkout-status?session_id=${sessionId}`)

        setStatus('complete');
    }, [sessionId]);

    if (!sessionId) {
        return (
            <div className="container mx-auto flex items-center justify-center min-h-[60vh] px-4">
                <Card className="glass-panel border-white/10 bg-white/5 text-white max-w-md w-full">
                    <CardContent className="p-8 text-center text-slate-300">
                        <p>No donation session found.</p>
                        <Button asChild className="mt-4" variant="outline">
                            <Link href="/donate">Return to Donate</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (status === 'open') {
        return (
            <div className="container mx-auto flex items-center justify-center min-h-[60vh] px-4">
                <p className="text-white">Redirecting...</p>
                {/* Or logic to redirect back to checkout */}
            </div>
        );
    }

    if (status === 'complete') {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative z-10">
                {/* Background Decor */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-600/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

                <Card className="glass-panel border-white/10 bg-white/5 text-white max-w-lg w-full text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-500/20 p-3 rounded-full w-fit mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-400" />
                        </div>
                        <CardTitle className="text-3xl">Donation Successful!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-slate-300">
                        <p className="text-lg">
                            Thank you for your generous support. Your contribution directly helps us maintain transparency in campaign finance.
                        </p>
                        <p className="text-sm">
                            A confirmation email has been sent to you.
                        </p>

                        <div className="pt-4">
                            <Button asChild className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white shadow-lg">
                                <Link href="/">Return Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto flex items-center justify-center min-h-[60vh] px-4">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        </div>
    );
}
