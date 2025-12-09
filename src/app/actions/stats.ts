'use server'

import pool from "@/lib/db"
import { cache } from 'react'

export interface CityStats {
    totalRaised: number
    activeMeasures: number
    candidatesCount: number
    lobbyistsCount: number
    fundraisingTrend: { date: string; amount: number }[]
    donorComposition: { name: string; value: number; color: string }[]
}

export interface LandingStats {
    citiesCount: number
    candidatesCount: number
    volunteersCount: number // mocked as 100% for now or count users? keeping as is per design
}

// Cache the results to avoid hitting DB on every render if called multiple times
export const getLandingPageStats = cache(async (): Promise<LandingStats> => {
    let client;
    try {
        client = await pool.connect()
        // Count cities (profiles where type = 'CITY')
        const citiesRes = await client.query("SELECT COUNT(*) FROM profiles WHERE type = 'CITY'")
        const citiesCount = parseInt(citiesRes.rows[0].count, 10)

        // Count candidates (profiles where type = 'POLITICIAN')
        const candidatesRes = await client.query("SELECT COUNT(*) FROM profiles WHERE type = 'POLITICIAN'")
        const candidatesCount = parseInt(candidatesRes.rows[0].count, 10)

        return {
            citiesCount,
            candidatesCount,
            volunteersCount: 100 // Hardcoded as it's a percentage "100% Volunteer" in the design
        }
    } catch (error) {
        console.error("Error fetching landing page stats:", error)
        return { citiesCount: 0, candidatesCount: 0, volunteersCount: 100 }
    } finally {
        if (client) client.release()
    }
})

export const getCityStats = cache(async (cityName: string): Promise<CityStats> => {
    let client;
    try {
        client = await pool.connect()
        // 1. Total Raised: Sum contributions for profiles in this city
        // We link transactions -> filings -> profiles(filer) -> city
        // OR transactions with entity_profile_id if we want recipient side?
        // Let's assume filings are linked to profiles via filer_id matching or similar.
        // Simplified: Join transactions -> profiles (via entity_profile_id as RECIPIENT?)
        // Wait, standard campaign finance: Filings belong to a Committee (Profile).
        // Let's look for profiles in this city, then find their filings, then sum transactions.

        // Query: Total Contributions for Politicians/Committees in this City
        // Assuming profiles have 'city' column.

        const totalRaisedQuery = `
            SELECT COALESCE(SUM(t.amount), 0) as total
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name -- Linking via name as fallback, or better if we had profile_id on filings
            WHERE p.city = $1
            AND t.transaction_type = 'CONTRIBUTION'
        `
        // NOTE: schema says filings has `filer_name`, usage might be loose. 
        // Let's try to link directly if possible or rely on `filer_name`.
        // Ideally: profiles.id <-> filings.profile_id (missing).
        // Let's rely on profiles.name for now or just generic query.

        // Alternative: If schema links are weak, we search for profiles in city, then sum their 'total contributions' from filings?
        // Filings table has `total_contributions` column! simpler.

        const totalRaisedRes = await client.query(`
            SELECT COALESCE(SUM(f.total_contributions), 0) as total
            FROM filings f
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city = $1
        `, [cityName])

        const totalRaised = parseFloat(totalRaisedRes.rows[0].total)

        // 2. Active Measures
        const measuresRes = await client.query(`
            SELECT COUNT(*) FROM measures 
            WHERE city = $1 AND status = 'ACTIVE'
        `, [cityName])
        const activeMeasures = parseInt(measuresRes.rows[0].count, 10)

        // 3. Candidates Count
        const candidatesRes = await client.query(`
            SELECT COUNT(*) FROM profiles 
            WHERE city = $1 AND type = 'POLITICIAN'
        `, [cityName])
        const candidatesCount = parseInt(candidatesRes.rows[0].count, 10)

        // 4. Lobbyists Count
        const lobbyistsRes = await client.query(`
            SELECT COUNT(*) FROM profiles 
            WHERE city = $1 AND type = 'LOBBYIST'
        `, [cityName])
        const lobbyistsCount = parseInt(lobbyistsRes.rows[0].count, 10)

        // 5. Fundraising Trend (Aggregated by Year for simplicity or Month)
        // Schema: transactions has `transaction_date`
        // We'll aggregate from transactions linked to city profiles
        const trendQuery = `
            SELECT 
                TO_CHAR(t.transaction_date, 'YYYY-MM') as date,
                SUM(t.amount) as amount
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city = $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY 1
            ORDER BY 1 ASC
        `
        const trendRes = await client.query(trendQuery, [cityName])
        const fundraisingTrend = trendRes.rows.map(row => ({
            date: row.date,
            amount: parseFloat(row.amount)
        }))

        // 6. Donor Composition (by entity_cd)
        // detailed codes: IND=Individual, COM=Committee, OTH=Other, SCC=Small Contributor Cmte
        const sourceQuery = `
            SELECT 
                t.entity_cd,
                SUM(t.amount) as value
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city = $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY t.entity_cd
        `
        const sourceRes = await client.query(sourceQuery, [cityName])

        const colorMap: Record<string, string> = {
            'IND': '#6366f1', // Indigo (Residents/Indiv)
            'COM': '#ec4899', // Pink (Business/Cmte)
            'OTH': '#06b6d4', // Cyan
            'SCC': '#f43f5e', // Rose
            'default': '#94a3b8'
        }

        const labelMap: Record<string, string> = {
            'IND': 'Individuals',
            'COM': 'Committees/Biz',
            'OTH': 'Other',
            'SCC': 'Small Cmtes'
        }

        const donorComposition = sourceRes.rows.map(row => ({
            name: labelMap[row.entity_cd] || 'Unknown',
            value: parseFloat(row.value),
            color: colorMap[row.entity_cd] || colorMap['default']
        }))

        return {
            totalRaised,
            activeMeasures,
            candidatesCount,
            lobbyistsCount,
            fundraisingTrend,
            donorComposition
        }

    } catch (error) {
        console.error(`Error fetching stats for ${cityName}:`, error)
        return {
            totalRaised: 0,
            activeMeasures: 0,
            candidatesCount: 0,
            lobbyistsCount: 0,
            fundraisingTrend: [],
            donorComposition: []
        }
    } finally {
        if (client) client.release()
    }
})
