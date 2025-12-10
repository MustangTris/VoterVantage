"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed bottom-0 right-0 z-[100] flex flex-col p-4 w-full max-w-[420px] gap-2 outline-none sm:bottom-4 sm:right-4">
            {toasts.map(function ({ id, title, description, action, ...props }) {
                return (
                    <Toast
                        key={id}
                        id={id}
                        title={title}
                        description={description}
                        action={action}
                        onOpenChange={(open) => !open && dismiss(id)}
                        {...props}
                    />
                )
            })}
        </div>
    )
}
