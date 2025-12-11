'use server'

import pool from "@/lib/db"

export interface Transaction {
    id: number
    date: string
    amount: number
    type: string
    entity: string // The other party (Donor for politician, Recipient for lobbyist)
    description: string
    city?: string
    state?: string
    zip?: string
    filerName?: string // Useful for City view (who received it)
    entityId?: string
    entityType?: string
    filerId?: string
    filerType?: string
}

export interface GetTransactionsResult {
    data: Transaction[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export async function getTransactions(
    viewType: 'CITY' | 'POLITICIAN' | 'LOBBYIST',
    entityName: string,
    page: number = 1,
    limit: number = 20,
    search: string = '',
    sortField: string = 'date', // date, amount, entity
    sortDir: 'asc' | 'desc' = 'desc'
): Promise<GetTransactionsResult> {
    let client
    try {
        client = await pool.connect()
        // const offset = (page - 1) * limit // Removed unused variable warning if strict

        let baseQuery = ''
        const params: any[] = []

        // --- Build Query based on View Type ---
        // We will now LEFT JOIN profiles to get IDs for entity and filer
        // p_entity = Profile for t.entity_name
        // p_filer = Profile for f.filer_name

        if (viewType === 'CITY') {
            // All transactions for politicians in this city
            baseQuery = `
                SELECT 
                    t.id,
                    t.transaction_date as date,
                    t.amount,
                    t.transaction_type,
                    t.entity_name,
                    t.description,
                    t.entity_city,
                    t.entity_state,
                    t.entity_zip,
                    f.filer_name,
                    p_entity.id as entity_id,
                    p_entity.type as entity_type,
                    p_filer.id as filer_id,
                    p_filer.type as filer_type
                FROM transactions t
                JOIN filings f ON t.filing_id = f.id
                JOIN profiles p ON f.filer_name = p.name -- The city filter is on the politician's profile
                LEFT JOIN profiles p_entity ON t.entity_name = p_entity.name
                LEFT JOIN profiles p_filer ON f.filer_name = p_filer.name
                WHERE p.city = $1
                AND t.transaction_type NOT ILIKE 'Expenditure'
            `
            params.push(entityName)
        } else if (viewType === 'POLITICIAN') {
            // Transactions where filer is this politician
            baseQuery = `
                SELECT 
                    t.id,
                    t.transaction_date as date,
                    t.amount,
                    t.transaction_type,
                    t.entity_name,
                    t.description,
                    t.entity_city,
                    t.entity_state,
                    t.entity_zip,
                    f.filer_name,
                    p_entity.id as entity_id,
                    p_entity.type as entity_type,
                    p_filer.id as filer_id,
                    p_filer.type as filer_type
                FROM transactions t
                JOIN filings f ON t.filing_id = f.id
                LEFT JOIN profiles p_entity ON t.entity_name = p_entity.name
                LEFT JOIN profiles p_filer ON f.filer_name = p_filer.name
                WHERE f.filer_name = $1
            `
            params.push(entityName)
        } else if (viewType === 'LOBBYIST') {
            // Transactions where entity_name is this lobbyist
            baseQuery = `
                SELECT 
                    t.id,
                    t.transaction_date as date,
                    t.amount,
                    t.transaction_type,
                    t.entity_name, 
                    t.description,
                    t.entity_city, 
                    t.entity_state, 
                    t.entity_zip,
                    f.filer_name,
                    p_entity.id as entity_id,
                    p_entity.type as entity_type,
                    p_filer.id as filer_id,
                    p_filer.type as filer_type
                FROM transactions t
                JOIN filings f ON t.filing_id = f.id
                LEFT JOIN profiles p_entity ON t.entity_name = p_entity.name
                LEFT JOIN profiles p_filer ON f.filer_name = p_filer.name
                WHERE t.entity_name = $1
            `
            params.push(entityName)
        }

        // --- Search Filter ---
        if (search) {
            const searchParamIndex = params.length + 1
            params.push(`%${search}%`)
            // Search in entity_name, description, or filer_name
            baseQuery += ` AND (
                t.entity_name ILIKE $${searchParamIndex} OR 
                t.description ILIKE $${searchParamIndex} OR
                f.filer_name ILIKE $${searchParamIndex}
            )`
        }

        // --- Count Total ---
        const fromWhereIndex = baseQuery.indexOf('FROM')
        const fromWhereClause = baseQuery.substring(fromWhereIndex)

        const countRes = await client.query(`SELECT COUNT(*) ${fromWhereClause}`, params)
        const total = parseInt(countRes.rows[0].count, 10)

        // --- Sort ---
        let orderBy = ''
        if (sortField === 'date') {
            orderBy = `ORDER BY t.transaction_date ${sortDir.toUpperCase()}`
        } else if (sortField === 'amount') {
            orderBy = `ORDER BY t.amount ${sortDir.toUpperCase()}`
        } else if (sortField === 'entity') {
            orderBy = `ORDER BY t.entity_name ${sortDir.toUpperCase()}`
        } else {
            orderBy = `ORDER BY t.transaction_date DESC`
        }

        // --- Pagination ---
        const limitParamIndex = params.length + 1
        const offsetParamIndex = params.length + 2
        params.push(limit)
        params.push((page - 1) * limit)

        const finalQuery = `${baseQuery} ${orderBy} LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`

        const res = await client.query(finalQuery, params)

        const data: Transaction[] = res.rows.map(row => ({
            id: row.id,
            date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
            amount: parseFloat(row.amount),
            type: row.transaction_type,
            entity: row.entity_name,
            description: row.description,
            city: row.entity_city,
            state: row.entity_state,
            zip: row.entity_zip,
            filerName: row.filer_name,
            entityId: row.entity_id,
            entityType: row.entity_type,
            filerId: row.filer_id,
            filerType: row.filer_type
        }))

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }

    } catch (error) {
        console.error("Error fetching transactions:", error)
        return { data: [], total: 0, page: 1, limit, totalPages: 0 }
    } finally {
        if (client) client.release()
    }
}
