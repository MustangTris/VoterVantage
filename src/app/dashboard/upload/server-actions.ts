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
    fileName: string
}): Promise<CreateFilingResult> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const supabase = createServiceRoleClient()

        // 1. Check for Duplicate Filing - REMOVED to allow forced re-uploads
        /*
        if (data.source_file_url) {
            const { data: existingDupes } = await supabase
                .from('filings')
                .select('id')
                .eq('source_file_url', data.source_file_url)
                .limit(1)

            if (existingDupes && existingDupes.length > 0) {
                return { success: false, error: "Duplicate detected: This exact file has already been uploaded." }
            }
        }
        */

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

export async function importTransactionBatch(filingId: string, transactions: any[], jurisdiction?: string, jurisdictionType: 'CITY' | 'COUNTY' = 'CITY'): Promise<{ success: boolean; error?: string; warnings?: string[] }> {
    const warnings: string[] = [];

    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const supabase = createServiceRoleClient()

        // Note: The unique index on (external_id, filing_id) exists but it's an INDEX not a CONSTRAINT
        // Supabase onConflict only works with constraints, not indexes
        // Solution: Insert and catch duplicate errors (code 23505)

        const { error: insertError } = await supabase
            .from('transactions')
            .insert(transactions)

        if (insertError) {
            console.error('importTransactionBatch Insert Error:', insertError)
            if (insertError.code === '42501') {
                throw new Error("Database RLS Policy Violation. This usually means Service Role Key is incorrect or invalid.")
            }
            // Error code 23505 = unique_violation, skip these as they're expected when re-uploading
            if (insertError.code !== '23505') {
                throw new Error(insertError.message)
            }
            warnings.push('Some duplicate transactions were skipped')
            console.warn('Some duplicate transactions were skipped')
        }

        // CRITICAL: Always trigger Entity Sync regardless of transaction insert status
        // This ensures profiles are created even if transactions are duplicates
        console.log(`[UPLOAD] Triggering entity sync for filing ${filingId} with jurisdiction: ${jurisdiction} (${jurisdictionType})`)

        try {
            await _syncEntities(supabase, filingId, transactions, jurisdiction, jurisdictionType)
            console.log(`[UPLOAD] Entity sync completed successfully`)
        } catch (syncError: any) {
            // Entity sync errors should be visible but not fail the entire upload
            const errorMsg = `Profile creation failed: ${syncError.message}. Transactions were imported but politician/city profiles may be missing.`
            console.error(`[UPLOAD ERROR] Entity sync failed:`, syncError)
            warnings.push(errorMsg)
            // Don't throw - allow upload to continue but warn user
        }

        // Revalidate the entire site layout to ensure dashboard stats and other data are fresh
        revalidatePath('/', 'layout')

        return { success: true, warnings: warnings.length > 0 ? warnings : undefined }
    } catch (error: any) {
        console.error("importTransactionBatch error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Internal helper to sync/create entities (Politicians, Cities, Lobbyists) based on imported data.
 */
async function _syncEntities(supabase: any, filingId: string, transactions: any[], jurisdiction?: string, jurisdictionType: 'CITY' | 'COUNTY' = 'CITY') {
    try {
        console.log(`Syncing entities for filing ${filingId}...`)

        // 1. Sync CANDIDATE (from Filing Header usually, but here we can check the filer from transactions if needed, 
        //    though typically Filer is defined at filing creation. Let's fetch the filing to get the filer name.)
        const { data: filing } = await supabase.from('filings').select('filer_name, id').eq('id', filingId).single()

        if (filing && filing.filer_name) {
            // Use UPSERT to create or update politician profile
            // This prevents duplicates when re-uploading files
            console.log(`[SYNC] Creating/updating politician profile for: ${filing.filer_name} (city: ${jurisdiction})`)
            const { data: politicianProfile, error: upsertError } = await supabase.from('profiles').upsert(
                {
                    name: filing.filer_name,
                    type: 'POLITICIAN',
                    description: 'Automatically created from filing import.',
                    city: jurisdiction
                },
                {
                    onConflict: 'name,type',
                    ignoreDuplicates: false // Update city if it changed
                }
            ).select()

            // CHECK: Is this a "Measure"? If so, we might want to skip creating a Politician profile?
            // User Request: "dont include active measures or donor contributions in new pages database function going forward"
            // CHECK: Is this a "Measure"? If so, avoid creating a Politician profile.
            // Refined Regex: Only target explicit Measures/Props, avoid "Committee for" which captures candidates.
            const isMeasure = /^(Measure\s|Prop\s|Proposition\s|No\son\s|Yes\son\s)/i.test(filing.filer_name)

            if (!isMeasure) {
                const { data: politicianProfile, error: upsertError } = await supabase.from('profiles').upsert(
                    {
                        name: filing.filer_name,
                        type: 'POLITICIAN',
                        description: 'Automatically created from filing import.',
                        city: jurisdiction
                    },
                    {
                        onConflict: 'name,type',
                        ignoreDuplicates: false // Update city if it changed
                    }
                ).select()

                if (upsertError) {
                    console.error(`[SYNC ERROR] Failed to upsert politician profile: ${upsertError.message}`, upsertError)
                } else {
                    console.log(`[SYNC SUCCESS] Politician profile created/updated:`, politicianProfile)
                }
            } else {
                console.log(`[SYNC SKIPPED] Filer "${filing.filer_name}" identified as likely Measure/Committee. Skipping Politician profile creation.`)
            }
        }

        // 2. Sync JURISDICTION (City or County)
        // Only create the Profile for the jurisdiction the candidate is running in.
        if (jurisdiction) {
            console.log(`[SYNC] Creating jurisdiction profile: ${jurisdiction} (${jurisdictionType})`)
            const { data: jurisdictionProfile, error: upsertError } = await supabase.from('profiles').upsert(
                {
                    name: jurisdiction,
                    type: jurisdictionType,
                    description: 'Jurisdiction created from filing import.'
                },
                {
                    onConflict: 'name,type',
                    ignoreDuplicates: true // Don't update existing profiles
                }
            ).select()

            if (upsertError) {
                console.error(`[SYNC ERROR] Failed to upsert jurisdiction profile: ${upsertError.message}`, upsertError)
            } else {
                console.log(`[SYNC SUCCESS] Jurisdiction profile created/updated:`, jurisdictionProfile)
            }
        }

        // 3. Sync LOBBYISTS (Big Donors > $500)
        // 3. Sync LOBBYISTS (Major Donors > $500)
        // Re-enabled based on user feedback to support donor pages.
        const bigDonors = transactions
            .filter((t: any) => t.transaction_type === 'CONTRIBUTION' && parseFloat(t.amount) > 500 && t.entity_name)
            .map((t: any) => t.entity_name)

        const distinctLobbyists: string[] = [...new Set(bigDonors as string[])]

        // Batch upsert for efficiency
        if (distinctLobbyists.length > 0) {
            console.log(`[SYNC] Creating ${distinctLobbyists.length} donor/lobbyist profiles for major contributors (>$500)`)
            const lobbyistProfiles = distinctLobbyists.map(name => ({
                name: name as string,
                type: 'LOBBYIST',
                description: 'Automatically created from filing import (Major Donor).'
            }))

            const { data: createdProfiles, error: upsertError } = await supabase.from('profiles').upsert(
                lobbyistProfiles,
                {
                    onConflict: 'name,type',
                    ignoreDuplicates: true // Don't update existing donors
                }
            ).select()

            if (upsertError) {
                console.error(`[SYNC ERROR] Failed to upsert lobbyist profiles: ${upsertError.message}`, upsertError)
            } else {
                console.log(`[SYNC SUCCESS] Created/updated ${distinctLobbyists.length} donor profiles:`, createdProfiles?.map((p: any) => p.name))
            }
        }

    } catch (err) {
        console.error("Entity Sync Failed:", err)
        // Don't fail the whole import if sync fails, just log it.
    }
}

export async function finalizeFiling(filingId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const supabase = createServiceRoleClient()

        // Calculate totals
        // Only use RPC if it exists, otherwise do manual calculation
        let contributions = 0
        let expenditures = 0

        // Manual Aggregation for now to ensure robustness without migration scripts
        const { data: contribs, error: contribError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('filing_id', filingId)
            .eq('transaction_type', 'CONTRIBUTION')

        if (contribError) throw new Error(contribError.message)
        contribs?.forEach((t: any) => contributions += Number(t.amount || 0))

        const { data: expends, error: expendError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('filing_id', filingId)
            .eq('transaction_type', 'EXPENDITURE')

        if (expendError) throw new Error(expendError.message)
        expends?.forEach((t: any) => expenditures += Number(t.amount || 0))


        // Update Filing
        const { error: updateError } = await supabase
            .from('filings')
            .update({
                total_contributions: contributions,
                total_expenditures: expenditures,
                status: 'PROCESSED'
            })
            .eq('id', filingId)

        if (updateError) throw new Error(updateError.message)

        return { success: true }
    } catch (error: any) {
        console.error("finalizeFiling error:", error)
        return { success: false, error: error.message }
    }
}
