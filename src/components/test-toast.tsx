"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function TestToast() {
    const { toast } = useToast()

    return (
        <div className="fixed bottom-20 right-4 z-[50] flex flex-col gap-2">
            <Button
                onClick={() => toast({
                    title: "Test Notification",
                    description: "This is how a confirmation banner looks.",
                    variant: "default"
                })}
                className="bg-purple-600"
            >
                Test Info Toast
            </Button>
            <Button
                onClick={() => toast({
                    title: "Success!",
                    description: "Action completed successfully.",
                    variant: "success"
                })}
                className="bg-green-600"
            >
                Test Success Toast
            </Button>
            <Button
                onClick={() => toast({
                    title: "Error Occurred",
                    description: "Something went wrong.",
                    variant: "destructive"
                })}
                className="bg-red-600"
            >
                Test Error Toast
            </Button>
        </div>
    )
}
