'use server'

import pool from '@/lib/db'

export async function getFilings() {
    const client = await pool.connect()
    try {
        const result = await client.query(`
            SELECT 
                f.id, 
                f.filer_name, 
                f.status, 
                f.source_file_url, 
                f.created_at,
                (SELECT COUNT(*) FROM transactions t WHERE t.filing_id = f.id) as transaction_count
            FROM filings f
            ORDER BY f.created_at DESC
            LIMIT 50
        `)
        return { success: true, filings: result.rows }
    } catch (error) {
        console.error('Error fetching filings:', error)
        return { success: false, error: 'Failed to fetch filings' }
    } finally {
        client.release()
    }
}
