import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function DonateSuccessPage() {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative z-10">
            <Card className="glass-panel border-green-500/30 bg-green-500/10 text-white w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 bg-green-500/20 p-3 rounded-full w-fit">
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Thank You!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-slate-300">
                        Your generous donation has been received. You are helping us bring
                        transparency to local politics.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button asChild size="lg" className="w-full font-semibold">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                        <Button variant="ghost" asChild className="w-full">
                            <Link href="/">Return Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
