'use server'

import pool from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getProfiles() {
    let client;
    try {
        client = await pool.connect()
        const result = await client.query(`
            SELECT id, name, type, city 
            FROM profiles 
            ORDER BY name ASC
        `)
        return { success: true, profiles: result.rows }
    } catch (error) {
        console.error('Error fetching profiles:', error)
        return { success: false, error: 'Failed to fetch profiles' }
    } finally {
        if (client) client.release()
    }
}

interface ManualTransactionData {
    profileId: string
    transactionType: 'CONTRIBUTION' | 'EXPENDITURE'
    amount: number
    date: string
    entityName: string
    description: string

    // Core Entity Details
    entityFirst?: string
    entityLast?: string
    entityCity?: string
    entityState?: string
    entityZip?: string
    entityAdr1?: string
    entityAdr2?: string

    // Employment (Schedule A)
    occupation?: string
    employer?: string
    selfEmployed?: string // 'y' or 'n'

    // Committee Info (Schedule A/E)
    cmteId?: string

    // Treasurer Info
    treasurerFirst?: string
    treasurerLast?: string
    treasurerCity?: string
    treasurerState?: string
    treasurerZip?: string
    treasurerAdr1?: string
    treasurerAdr2?: string

    // Intermediary Info
    intermediaryFirst?: string
    intermediaryLast?: string
    intermediaryCity?: string
    intermediaryState?: string
    intermediaryZip?: string
    intermediaryAdr1?: string
    intermediaryAdr2?: string
    intermediaryEmployer?: string
    intermediaryOccupation?: string

    // Admin / Codes
    expenditureCode?: string // (Schedule E)
    memoCode?: string
    memoRefNo?: string
}

export async function saveManualTransaction(data: ManualTransactionData) {
    const session = await auth()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    let client;
    try {
        client = await pool.connect()
        await client.query('BEGIN')

        // 1. Resolve Profile and Filing
        const profileRes = await client.query('SELECT name FROM profiles WHERE id = $1', [data.profileId])
        if (profileRes.rowCount === 0) throw new Error('Profile not found')
        const filerName = profileRes.rows[0].name

        const todayStr = new Date().toISOString().split('T')[0]
        let filingId
        const existingFiling = await client.query(`
            SELECT id FROM filings 
            WHERE filer_name = $1 AND source_file_url = 'MANUAL_ENTRY' AND filing_date = $2
            LIMIT 1
        `, [filerName, todayStr])

        if (existingFiling.rowCount && existingFiling.rowCount > 0) {
            filingId = existingFiling.rows[0].id
        } else {
            const newFiling = await client.query(`
                INSERT INTO filings (filer_name, filing_date, source_file_url, status)
                VALUES ($1, $2, 'MANUAL_ENTRY', 'VERIFIED')
                RETURNING id
            `, [filerName, todayStr])
            filingId = newFiling.rows[0].id
        }

        // 2. Insert Transaction with ALL fields
        await client.query(`
            INSERT INTO transactions (
                filing_id, 
                transaction_type, 
                amount, 
                transaction_date, 
                entity_name, 
                description,
                
                -- Expanded Fields
                entity_first_name, entity_last_name, 
                entity_city, entity_state, entity_zip, entity_adr1, entity_adr2,
                
                contributor_occupation, contributor_employer, entity_self_employed,
                
                cmte_id,
                
                treasurer_first_name, treasurer_last_name,
                treasurer_city, treasurer_state, treasurer_zip, treasurer_adr1, treasurer_adr2,
                
                intermediary_first_name, intermediary_last_name,
                intermediary_city, intermediary_state, intermediary_zip, intermediary_adr1, intermediary_adr2,
                intermediary_employer, intermediary_occupation,
                
                expenditure_code, memo_code, memo_refno
            )
            VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16,
                $17,
                $18, $19, $20, $21, $22, $23, $24,
                $25, $26, $27, $28, $29, $30, $31, $32, $33,
                $34, $35, $36
            )
        `, [
            filingId,
            data.transactionType,
            data.amount,
            data.date,
            data.entityName,
            data.description,

            data.entityFirst, data.entityLast,
            data.entityCity, data.entityState, data.entityZip, data.entityAdr1, data.entityAdr2,

            data.occupation, data.employer, data.selfEmployed,

            data.cmteId,

            data.treasurerFirst, data.treasurerLast,
            data.treasurerCity, data.treasurerState, data.treasurerZip, data.treasurerAdr1, data.treasurerAdr2,

            data.intermediaryFirst, data.intermediaryLast,
            data.intermediaryCity, data.intermediaryState, data.intermediaryZip, data.intermediaryAdr1, data.intermediaryAdr2,
            data.intermediaryEmployer, data.intermediaryOccupation,

            data.expenditureCode, data.memoCode, data.memoRefNo
        ])

        await client.query('COMMIT')

        revalidatePath('/dashboard/enter')
        revalidatePath('/dashboard/review')

        return { success: true }
    } catch (error) {
        if (client) await client.query('ROLLBACK')
        console.error('Error saving manual transaction:', error)
        return { success: false, error: 'Failed to save transaction' }
    } finally {
        if (client) client.release()
    }
}
