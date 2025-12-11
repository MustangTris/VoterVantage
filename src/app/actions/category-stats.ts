'use server'

import pool from "@/lib/db"

export interface PoliticianOverviewStats {
    totalCandidates: number
    totalRaised: number
    topFundraisers: { id: string; name: string; total_raised: number; image_url: string | null }[]
    partyBreakdown: { party: string; count: number }[]
}

export interface LobbyistOverviewStats {
    totalLobbyists: number
    totalSpent: number
    topSpenders: { id: string; name: string; total_spent: number }[]
}

export interface CityOverviewStats {
    totalCities: number
    topCitiesByRaised: { name: string; total_raised: number }[]
}

export const getPoliticianOverviewStats = async (): Promise<PoliticianOverviewStats> => {
    const client = await pool.connect()
    try {
        // 1. Total Candidates
        const countRes = await client.query("SELECT COUNT(*) FROM profiles WHERE type = 'POLITICIAN'")
        const totalCandidates = parseInt(countRes.rows[0].count, 10)

        // 2. Total Raised (Sum of all contributions to politicians)
        // Linking profiles -> filings -> transactions
        const raisedRes = await client.query(`
            SELECT COALESCE(SUM(t.amount), 0) as total
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name -- Ideally join on filer_id if available
            WHERE p.type = 'POLITICIAN' AND t.transaction_type = 'CONTRIBUTION'
        `)
        const totalRaised = parseFloat(raisedRes.rows[0].total)

        // 3. Top Fundraisers
        // Group by profile
        const topRes = await client.query(`
            SELECT p.id, p.name, p.image_url, COALESCE(SUM(t.amount), 0) as total_raised
            FROM profiles p
            LEFT JOIN filings f ON p.name = f.filer_name
            LEFT JOIN transactions t ON f.id = t.filing_id AND t.transaction_type = 'CONTRIBUTION'
            WHERE p.type = 'POLITICIAN'
            GROUP BY p.id, p.name, p.image_url
            ORDER BY total_raised DESC
            LIMIT 5
        `)
        const topFundraisers = topRes.rows.map(row => ({
            id: row.id,
            name: row.name,
            total_raised: parseFloat(row.total_raised),
            image_url: row.image_url
        }))

        // 4. Party Breakdown (Mock data if not in schema, assuming description contains party or adding dummy)
        // Schema doesn't have Party column. We'll return mock for design.
        const partyBreakdown = [
            { party: "Democrat", count: Math.floor(totalCandidates * 0.6) },
            { party: "Republican", count: Math.floor(totalCandidates * 0.3) },
            { party: "Independent", count: Math.ceil(totalCandidates * 0.1) }
        ]

        return {
            totalCandidates,
            totalRaised,
            topFundraisers,
            partyBreakdown
        }
    } finally {
        client.release()
    }
}

export const getLobbyistOverviewStats = async (): Promise<LobbyistOverviewStats> => {
    const client = await pool.connect()
    try {
        const countRes = await client.query("SELECT COUNT(*) FROM profiles WHERE type = 'LOBBYIST'")
        const totalLobbyists = parseInt(countRes.rows[0].count, 10)

        // Total Spent (Contributions made BY Lobbyists to others)
        // We look for transactions where entity_name matches a profile of type 'LOBBYIST'
        const spentRes = await client.query(`
            SELECT COALESCE(SUM(t.amount), 0) as total
            FROM transactions t
            JOIN profiles p ON t.entity_name = p.name
            WHERE p.type = 'LOBBYIST' AND t.transaction_type = 'CONTRIBUTION'
        `)
        const totalSpent = parseFloat(spentRes.rows[0].total)

        // Top Spenders (Lobbyists who contributed the most)
        const topRes = await client.query(`
            SELECT p.id, p.name, COALESCE(SUM(t.amount), 0) as total_spent
            FROM profiles p
            LEFT JOIN transactions t ON p.name = t.entity_name AND t.transaction_type = 'CONTRIBUTION'
            WHERE p.type = 'LOBBYIST'
            GROUP BY p.id, p.name
            HAVING COALESCE(SUM(t.amount), 0) > 0
            ORDER BY total_spent DESC
            LIMIT 5
        `)

        const topSpenders = topRes.rows.map(row => ({
            id: row.id,
            name: row.name,
            total_spent: parseFloat(row.total_spent)
        }))

        return {
            totalLobbyists,
            totalSpent,
            topSpenders
        }
    } finally {
        client.release()
    }
}

export const getCityOverviewStats = async (): Promise<CityOverviewStats> => {
    const client = await pool.connect()
    try {
        const countRes = await client.query("SELECT COUNT(*) FROM profiles WHERE type = 'CITY'") // Or distinct cities from profiles?
        // Actually profiles with type CITY might not exist if city is just a string property.
        // Let's use validation: 'CITY' is in check constraint.
        const totalCities = parseInt(countRes.rows[0].count, 10)

        // Top Cities by Money
        // Sum contributions for all politicians in that city
        const topRes = await client.query(`
            SELECT p.city, COALESCE(SUM(t.amount), 0) as total_raised
            FROM profiles p
            JOIN filings f ON p.name = f.filer_name
            JOIN transactions t ON f.id = t.filing_id AND t.transaction_type = 'CONTRIBUTION'
            WHERE p.type = 'POLITICIAN' AND p.city IS NOT NULL
            GROUP BY p.city
            ORDER BY total_raised DESC
            LIMIT 5
        `)

        const topCitiesByRaised = topRes.rows.map(row => ({
            name: row.city,
            total_raised: parseFloat(row.total_raised)
        }))

        return {
            totalCities,
            topCitiesByRaised
        }
    } finally {
        client.release()
    }
}

export const getAllCities = async () => {
    const client = await pool.connect()
    try {
        const res = await client.query(`
            SELECT p.id, p.name, p.description
            FROM profiles p
            WHERE p.type = 'CITY'
            ORDER BY p.name ASC
        `)

        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            active: true // For now assume all in DB are active
        }))
    } finally {
        client.release()
    }
}

export const getCountyOverviewStats = async (): Promise<CityOverviewStats> => {
    const client = await pool.connect()
    try {
        const countRes = await client.query("SELECT COUNT(*) FROM profiles WHERE type = 'COUNTY'")
        const totalCities = parseInt(countRes.rows[0].count, 10)

        // Top Counties by Money
        // Sum contributions for all politicians in that county
        // Note: Politician profiles have 'city' column which currently acts as 'Jurisdiction Name'.
        // For county politicians, this 'city' column maps to the County Name.
        const topRes = await client.query(`
            SELECT p.city, COALESCE(SUM(t.amount), 0) as total_raised
            FROM profiles p
            JOIN filings f ON p.name = f.filer_name
            JOIN transactions t ON f.id = t.filing_id AND t.transaction_type = 'CONTRIBUTION'
            LEFT JOIN profiles juris ON p.city = juris.name -- Join to check jurisdiction type
            WHERE p.type = 'POLITICIAN' 
              AND juris.type = 'COUNTY'
            GROUP BY p.city
            ORDER BY total_raised DESC
            LIMIT 5
        `)

        const topCitiesByRaised = topRes.rows.map(row => ({
            name: row.city,
            total_raised: parseFloat(row.total_raised)
        }))

        return {
            totalCities, // Reusing interface property name for consistency, though semantic is different
            topCitiesByRaised
        }
    } finally {
        client.release()
    }
}

export const getAllCounties = async () => {
    const client = await pool.connect()
    try {
        const res = await client.query(`
            SELECT p.id, p.name, p.description
            FROM profiles p
            WHERE p.type = 'COUNTY'
            ORDER BY p.name ASC
        `)

        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            active: true
        }))
    } finally {
        client.release()
    }
}
