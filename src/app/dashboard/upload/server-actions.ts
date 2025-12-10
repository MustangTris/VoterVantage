"use server"

import { auth } from "@/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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

        // Trigger Entity Sync (Fire & Forget or Await? Await for now to ensure consistency)
        await _syncEntities(supabase, filingId, transactions)

        // Revalidate the entire site layout to ensure dashboard stats and other data are fresh
        revalidatePath('/', 'layout')

        return { success: true }
    } catch (error: any) {
        console.error("importTransactionBatch error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Internal helper to sync/create entities (Politicians, Cities, Lobbyists) based on imported data.
 */
async function _syncEntities(supabase: any, filingId: string, transactions: any[]) {
    try {
        console.log(`Syncing entities for filing ${filingId}...`)

        // 1. Sync CANDIDATE (from Filing Header usually, but here we can check the filer from transactions if needed, 
        //    though typically Filer is defined at filing creation. Let's fetch the filing to get the filer name.)
        const { data: filing } = await supabase.from('filings').select('filer_name, id').eq('id', filingId).single()

        if (filing && filing.filer_name) {
            // Check if profile exists
            const { data: existing } = await supabase.from('profiles')
                .select('id')
                .eq('name', filing.filer_name)
                .eq('type', 'POLITICIAN')
                .single()

            if (!existing) {
                console.log(`Creating new Politician profile: ${filing.filer_name}`)
                await supabase.from('profiles').insert({
                    name: filing.filer_name,
                    type: 'POLITICIAN',
                    description: 'Automatically created from filing import.'
                })
            }
        }

        // 2. Sync CITIES (from distinct entity_city)
        const distinctCities = [...new Set(transactions.map((t: any) => t.entity_city).filter((c: any) => c && typeof c === 'string' && c.length > 2))]

        for (const city of distinctCities) {
            // Check if profile exists (Case insensitive usually better, but simplified here)
            // Using ILIKE logic involves more complex querying or just relying on standardized names.
            // For now, exact match check to minimalize perf impact
            const { data: existing } = await supabase.from('profiles')
                .select('id')
                .eq('name', city)
                .eq('type', 'CITY')
                .single()

            if (!existing) {
                console.log(`Creating new City profile: ${city}`)
                await supabase.from('profiles').insert({
                    name: city,
                    type: 'CITY',
                    description: 'Automatically created from filing import.'
                })
            }
        }

        // 3. Sync LOBBYISTS (Big Donors > $1000)
        // Heuristic: If they gave > $1000 and are a Contribution
        const bigDonors = transactions
            .filter((t: any) => t.transaction_type === 'CONTRIBUTION' && parseFloat(t.amount) > 1000 && t.entity_name)
            .map((t: any) => t.entity_name)

        const distinctLobbyists = [...new Set(bigDonors)]

        for (const name of distinctLobbyists) {
            const { data: existing } = await supabase.from('profiles')
                .select('id')
                .eq('name', name)
                .in('type', ['LOBBYIST', 'POLITICIAN']) // Don't re-create if it's already a known politician
                .single()

            if (!existing) {
                console.log(`Creating new Lobbyist profile: ${name}`)
                await supabase.from('profiles').insert({
                    name: name as string,
                    type: 'LOBBYIST',
                    description: 'Automatically created from filing import (Major Donor).'
                })
            }
        }

    } catch (err) {
        console.error("Entity Sync Failed:", err)
        // Don't fail the whole import if sync fails, just log it.
    }
}
