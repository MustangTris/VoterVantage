'use server'

import { Pool } from 'pg'

// Use the connection string from process.env
// Note: In Next.js Server Actions, process.env is available if configured in .env.local
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
})

export async function submitUpload(data: any[]) {
    if (!data || data.length === 0) {
        return { success: false, message: "No data provided." }
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 1. Create a "Filing" record to group these
        // Ideally we'd get the filer name from the user or the file, but for now we'll use a placeholder
        const filingRes = await client.query(`
            INSERT INTO filings (filer_name, status, source_file_url)
            VALUES ($1, $2, $3)
            RETURNING id
        `, ['Manual Import', 'PROCESSED', 'Manual Upload'])

        const filingId = filingRes.rows[0].id

        // 2. Insert Transactions
        let insertedCount = 0
        for (const row of data) {
            // Rudimentary mapping - expects columns like "Name", "Amount", "Date", "Description"
            // or we try to map broadly.
            const name = row['Name'] || row['Entity Name'] || row['Payee'] || row['Contributor'] || 'Unknown Entity'
            const amount = parseFloat((row['Amount'] || row['Amount Received'] || row['Amount Paid'] || '0').toString().replace(/[^0-9.-]+/g, ""))

            // Basic date parsing
            let date = new Date()
            if (row['Date']) date = new Date(row['Date'])

            const description = row['Description'] || row['Memo'] || ''

            // Determine type (Contribution vs Expenditure) based on amount sign or column
            // For now, let's default to CONTRIBUTION unless specified
            const type = row['Type'] ? row['Type'].toUpperCase() : (amount < 0 ? 'EXPENDITURE' : 'CONTRIBUTION')

            const absAmount = Math.abs(amount)

            await client.query(`
                INSERT INTO transactions (
                    filing_id, 
                    transaction_type, 
                    entity_name, 
                    amount, 
                    transaction_date, 
                    description
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                filingId,
                type === 'EXPENDITURE' ? 'EXPENDITURE' : 'CONTRIBUTION', // Enforce enum
                name,
                absAmount,
                date,
                description
            ])
            insertedCount++
        }

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
