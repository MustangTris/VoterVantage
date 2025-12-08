"use client"

import { useState } from "react"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/app/actions"
import { cn } from "@/lib/utils"

interface EditableFieldProps {
    id: string
    table: string
    field: string
    initialValue: string | number | null
    type?: "text" | "textarea" | "number"
    label?: string
    isEditable?: boolean
    className?: string
}

export function EditableField({
    id,
    table,
    field,
    initialValue,
    type = "text",
    label,
    isEditable = false,
    className
}: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(initialValue || "")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isEditable) {
        return <span className={className}>{value || <span className="text-slate-500 italic">Empty</span>}</span>
    }

    const handleSave = async () => {
        if (value === initialValue) {
            setIsEditing(false)
            return
        }

        setIsLoading(true)
        setError(null)
        try {
            await updateProfile(table, id, field, value)
            setIsEditing(false)
        } catch (err) {
            console.error(err)
            setError("Failed to save")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setValue(initialValue || "")
        setIsEditing(false)
        setError(null)
    }

    if (isEditing) {
        return (
            <div className="flex flex-col gap-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-100">
                {label && <span className="text-xs text-slate-400">{label}</span>}
                <div className="flex items-center gap-2">
                    {type === "textarea" ? (
                        <Textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="bg-white/10 border-white/20 text-white min-h-[100px]"
                        />
                    ) : (
                        <Input
                            type={type}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="bg-white/10 border-white/20 text-white h-8"
                        />
                    )}
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
        )
    }

    return (
        <div
            className={cn("group relative inline-flex items-center gap-2 cursor-pointer p-1 -m-1 rounded hover:bg-white/5 transition-colors", className)}
            onClick={() => setIsEditing(true)}
        >
            <span>{value || <span className="text-slate-500 italic">Click to edit {label}</span>}</span>
            <Pencil className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}
