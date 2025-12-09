"use server"

import { auth } from "@/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"

export type CreateFilingResult = {
    success: boolean
    filingId?: string
    error?: string
}

export async function createFilingHeader(data: {
    filer_name: string
    source_file_url: string | null
    uploaded_by: string
}): Promise<CreateFilingResult> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const supabase = createServiceRoleClient()

        const { data: filingData, error: filingError } = await supabase
            .from('filings')
            .insert({
                filer_name: data.filer_name,
                status: 'PENDING',
                source_file_url: data.source_file_url,
                uploaded_by: data.uploaded_by
            })
            .select()
            .single()

        if (filingError) {
            console.error('createFilingHeader DB Error:', filingError)
            if (filingError.code === '42501') {
                throw new Error("Database RLS Policy Violation. This usually means the Service Role Key is incorrect or invalid.")
            }
            throw new Error(filingError.message)
        }

        return { success: true, filingId: filingData.id }
    } catch (error: any) {
        console.error("createFilingHeader error:", error)
        return { success: false, error: error.message }
    }
}

export async function importTransactionBatch(filingId: string, transactions: any[]): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const supabase = createServiceRoleClient()

        const { error: insertError } = await supabase
            .from('transactions')
            .insert(transactions)

        if (insertError) {
            console.error('importTransactionBatch DB Error:', insertError)
            if (insertError.code === '42501') {
                throw new Error("Database RLS Policy Violation. This usually means the Service Role Key is incorrect or invalid.")
            }
            throw new Error(insertError.message)
        }

        return { success: true }
    } catch (error: any) {
        console.error("importTransactionBatch error:", error)
        return { success: false, error: error.message }
    }
}
