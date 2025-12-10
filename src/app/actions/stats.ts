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

export const getPoliticianStats = cache(async (politicianName: string) => {
    let client;
    try {
        client = await pool.connect()

        // 1. Total Raised
        const raisedRes = await client.query(`
            SELECT COALESCE(SUM(total_contributions), 0) as total
            FROM filings 
            WHERE filer_name = $1
        `, [politicianName])
        const totalRaised = parseFloat(raisedRes.rows[0].total)

        // 2. Cash on Hand (latest filing)
        const cashRes = await client.query(`
            SELECT cash_on_hand 
            FROM filings 
            WHERE filer_name = $1
            ORDER BY report_period_end DESC 
            LIMIT 1
        `, [politicianName])
        const cashOnHand = cashRes.rows.length > 0 ? parseFloat(cashRes.rows[0].cash_on_hand) : 0

        // 3. Donor Count
        // Distinct entities who contributed to filings by this politician
        const donorsRes = await client.query(`
            SELECT COUNT(DISTINCT entity_name) 
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name = $1 AND t.transaction_type = 'CONTRIBUTION'
        `, [politicianName])
        const donorCount = parseInt(donorsRes.rows[0].count, 10)

        // 4. Fundraising Trend
        const trendRes = await client.query(`
            SELECT 
                TO_CHAR(t.transaction_date, 'YYYY-MM') as date,
                SUM(t.amount) as amount
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name = $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY 1
            ORDER BY 1 ASC
        `, [politicianName])
        const fundraisingTrend = trendRes.rows.map(row => ({
            date: row.date,
            amount: parseFloat(row.amount)
        }))

        // 5. Source Breakdown
        const sourceQuery = `
            SELECT 
                t.entity_cd,
                SUM(t.amount) as value
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name = $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY t.entity_cd
        `
        const sourceRes = await client.query(sourceQuery, [politicianName])

        const colorMap: Record<string, string> = {
            'IND': '#6366f1',
            'COM': '#ec4899',
            'OTH': '#06b6d4',
            'SCC': '#f43f5e',
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
            cashOnHand,
            donorCount,
            fundraisingTrend,
            donorComposition
        }

    } catch (error) {
        console.error("Error fetching politician stats:", error)
        return { totalRaised: 0, cashOnHand: 0, donorCount: 0, fundraisingTrend: [], donorComposition: [] }
    } finally {
        if (client) client.release()
    }
})

export const getLobbyistStats = cache(async (lobbyistName: string) => {
    let client;
    try {
        client = await pool.connect()

        // 1. Total Spent (Contributions made BY this lobbyist to others)
        // This requires searching transactions where entity_name = lobbyistName
        const spentRes = await client.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE entity_name = $1 AND transaction_type = 'CONTRIBUTION'
        `, [lobbyistName])
        const totalSpent = parseFloat(spentRes.rows[0].total)

        // 2. Beneficiaries (Who did they give to?)
        // We need to find the filer_name of the filings where these transactions occurred
        const benRes = await client.query(`
            SELECT 
                f.filer_name as name,
                SUM(t.amount) as amount
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE t.entity_name = $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY f.filer_name
            ORDER BY amount DESC
            LIMIT 5
        `, [lobbyistName])

        const beneficiaries = benRes.rows.map(row => ({
            name: row.name,
            amount: `$${parseFloat(row.amount).toLocaleString()}`,
            type: 'Contribution'
        }))

        return {
            totalSpent,
            beneficiaries
        }

    } catch (error) {
        console.error("Error fetching lobbyist stats:", error)
        return { totalSpent: 0, beneficiaries: [] }
    } finally {
        if (client) client.release()
    }
})
