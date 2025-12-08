'use server'

import { Pool } from 'pg'

// Use the connection string from process.env
// Note: In Next.js Server Actions, process.env is available if configured in .env.local
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
})

export async function submitUpload(data: any[], fileUrl?: string) {
    if ((!data || data.length === 0) && !fileUrl) {
        return { success: false, message: "No data or file provided." }
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 1. Identify the Filer from the first row of data (if available)
        // We expect columns like Filer_NamL, Filer_ID, Committee_Type
        let filerName = 'Unknown Filer'
        let filerId = null
        let filerCity = null
        let committeeType = 'POLITICIAN' // Default

        if (data && data.length > 0) {
            const firstRow = data[0]
            if (firstRow) {
                filerName = firstRow['Filer_NamL'] || firstRow['Filer Name'] || 'Unknown Filer'
                filerId = firstRow['Filer_ID'] || null // State ID
                filerCity = firstRow['Filer_City'] || null
                const cType = firstRow['Committee_Type'] // recipient committee type
                if (cType && cType.toLowerCase().includes('lobby')) {
                    committeeType = 'LOBBYIST'
                } else if (cType && cType.toLowerCase().includes('candidate')) {
                    committeeType = 'POLITICIAN'
                }
            }
        }

        // 2. Upsert Profile Logic if we have enough info
        if (filerId && filerName !== 'Unknown Filer') {
            await client.query(`
                INSERT INTO profiles (filer_id, name, type, city)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (filer_id) 
                DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, city = EXCLUDED.city
            `, [filerId, filerName, committeeType, filerCity])
        }

        // 3. Create Filing Record
        const filingRes = await client.query(`
            INSERT INTO filings (filer_name, status, source_file_url)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [filerName, 'PROCESSED', fileUrl || 'Manual Upload'])

        const filingId = filingRes.rows[0].id

        // 4. Insert Transactions (if data exists)
        let insertedCount = 0
        if (data && data.length > 0) {
            for (const row of data) {
                // Extract core fields with fallbacks
                let name = row['Name'] || row['Entity Name'] || row['Payee'] || row['Contributor']

                // Build name from components if not found
                if (!name && (row['Tran_NamL'] || row['Tran_NamF'])) {
                    const parts = [row['Tran_NamT'], row['Tran_NamF'], row['Tran_NamL'], row['Tran_NamS']].filter(Boolean)
                    name = parts.join(' ')
                }
                if (!name) name = 'Unknown Entity'

                const amount = parseFloat((row['Amount'] || row['Amount Received'] || row['Amount Paid'] || row['Tran_Amt1'] || row['Tran_Amt2'] || '0').toString().replace(/[^0-9.-]+/g, ""))

                // Date parsing
                let date = new Date()
                if (row['Date']) date = new Date(row['Date'])
                else if (row['Tran_Date']) date = new Date(row['Tran_Date'])
                else if (row['Rpt_Date']) date = new Date(row['Rpt_Date'])

                const description = row['Description'] || row['Memo'] || row['Tran_Dscr'] || ''

                const typeRaw = row['Type'] || row['Rec_Type'] || (amount < 0 ? 'EXPENDITURE' : 'CONTRIBUTION')
                const type = typeRaw.toString().toUpperCase().includes('EXP') ? 'EXPENDITURE' : 'CONTRIBUTION'

                const absAmount = Math.abs(amount)

                // Extract detailed fields
                const entity_cd = row['Entity_Cd'] || null
                const entity_city = row['Tran_City'] || row['City'] || null
                const entity_state = row['Tran_State'] || row['State'] || null
                const entity_zip = row['Tran_Zip4'] || row['Zip'] || null

                const entity_first_name = row['Tran_NamF'] || null
                const entity_last_name = row['Tran_NamL'] || null
                const entity_prefix = row['Tran_NamT'] || null
                const entity_suffix = row['Tran_NamS'] || null
                const entity_adr1 = row['Tran_Adr1'] || null
                const entity_adr2 = row['Tran_Adr2'] || null
                const entity_self_employed = row['Tran_Self'] || null

                const cmte_id = row['Cmte_ID'] || null

                // Employer/Occupation
                const contributor_employer = row['Tran_Emp'] || row['Employer'] || null
                const contributor_occupation = row['Tran_Occ'] || row['Occupation'] || null
                const expenditure_code = row['Expn_Code'] || null

                const treasurer_last_name = row['Tres_NamL'] || null
                const treasurer_first_name = row['Tres_NamF'] || null
                const treasurer_prefix = row['Tres_NamT'] || null
                const treasurer_suffix = row['Tres_NamS'] || null
                const treasurer_adr1 = row['Tres_Adr1'] || null
                const treasurer_adr2 = row['Tres_Adr2'] || null
                const treasurer_city = row['Tres_City'] || null
                const treasurer_state = row['Tres_State'] || null
                const treasurer_zip = row['Tres_Zip'] || null

                const intermediary_last_name = row['Intr_NamL'] || null
                const intermediary_first_name = row['Intr_NamF'] || null
                const intermediary_prefix = row['Intr_NamT'] || null
                const intermediary_suffix = row['Intr_NamS'] || null
                const intermediary_adr1 = row['Intr_Adr1'] || null
                const intermediary_adr2 = row['Intr_Adr2'] || null
                const intermediary_city = row['Intr_City'] || null
                const intermediary_state = row['Intr_State'] || null
                const intermediary_zip = row['Intr_Zip4'] || null
                const intermediary_employer = row['Intr_Emp'] || null
                const intermediary_occupation = row['Intr_Occ'] || null
                const intermediary_self_employed = row['Intr_Self'] || null

                const candidate_last_name = row['Cand_NamL'] || null
                const candidate_first_name = row['Cand_NamF'] || null
                const candidate_prefix = row['Cand_NamT'] || null
                const candidate_suffix = row['Cand_NamS'] || null

                const memo_code = row['Memo_Code'] || null
                const memo_refno = row['Memo_RefNo'] || null
                const bakref_tid = row['BakRef_TID'] || null
                const xref_schnm = row['XRef_SchNm'] || null
                const xref_match = row['XRef_Match'] || null
                const loan_rate = row['Loan_Rate'] || null
                const int_cmteid = row['Int_CmteId'] || null
                const external_id = row['Tran_ID'] || null

                await client.query(`
                     INSERT INTO transactions (
                         filing_id, 
                         transaction_type, 
                         entity_name, 
                         amount, 
                         transaction_date, 
                         description,
                         entity_city,
                         entity_state,
                         entity_zip,
                         entity_cd,
                         entity_first_name,
                         entity_last_name,
                         entity_prefix,
                         entity_suffix,
                         entity_adr1,
                         entity_adr2,
                         entity_self_employed,
                         contributor_employer,
                         contributor_occupation,
                         expenditure_code,
                         cmte_id,
                         treasurer_last_name,
                         treasurer_first_name,
                         treasurer_prefix,
                         treasurer_suffix,
                         treasurer_adr1,
                         treasurer_adr2,
                         treasurer_city,
                         treasurer_state,
                         treasurer_zip,
                         intermediary_last_name,
                         intermediary_first_name,
                         intermediary_prefix,
                         intermediary_suffix,
                         intermediary_adr1,
                         intermediary_adr2,
                         intermediary_city,
                         intermediary_state,
                         intermediary_zip,
                         intermediary_employer,
                         intermediary_occupation,
                         intermediary_self_employed,
                         candidate_last_name,
                         candidate_first_name,
                         candidate_prefix,
                         candidate_suffix,
                         memo_code,
                         memo_refno,
                         bakref_tid,
                         xref_schnm,
                         xref_match,
                         loan_rate,
                         int_cmteid,
                         external_id
                     )
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54)
                 `, [
                    filingId,
                    type === 'EXPENDITURE' ? 'EXPENDITURE' : 'CONTRIBUTION',
                    name,
                    absAmount,
                    date,
                    description,
                    entity_city,
                    entity_state,
                    entity_zip,
                    entity_cd,
                    entity_first_name,
                    entity_last_name,
                    entity_prefix,
                    entity_suffix,
                    entity_adr1,
                    entity_adr2,
                    entity_self_employed,
                    contributor_employer,
                    contributor_occupation,
                    expenditure_code,
                    cmte_id,
                    treasurer_last_name,
                    treasurer_first_name,
                    treasurer_prefix,
                    treasurer_suffix,
                    treasurer_adr1,
                    treasurer_adr2,
                    treasurer_city,
                    treasurer_state,
                    treasurer_zip,
                    intermediary_last_name,
                    intermediary_first_name,
                    intermediary_prefix,
                    intermediary_suffix,
                    intermediary_adr1,
                    intermediary_adr2,
                    intermediary_city,
                    intermediary_state,
                    intermediary_zip,
                    intermediary_employer,
                    intermediary_occupation,
                    intermediary_self_employed,
                    candidate_last_name,
                    candidate_first_name,
                    candidate_prefix,
                    candidate_suffix,
                    memo_code,
                    memo_refno,
                    bakref_tid,
                    xref_schnm,
                    xref_match,
                    loan_rate,
                    int_cmteid,
                    external_id
                ])
                insertedCount++
            }
        } // End if data loop

        await client.query('COMMIT')
        return { success: true, count: insertedCount, filingId }

    } catch (e) {
        await client.query('ROLLBACK')
        console.error("Upload Error:", e)
        return { success: false, message: "Failed to save data: " + (e as Error).message }
    } finally {
        client.release()
    }
}
