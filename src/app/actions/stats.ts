'use server'

import pool from "@/lib/db"
import { cache } from 'react'

export interface CityStats {
    totalRaised: number

    candidatesCount: number
    donorsCount: number
    fundraisingTrend: { date: string; amount: number }[]
    donorComposition: { name: string; value: number; color: string }[]
    topDonors: { name: string; amount: number; id?: string; type?: string }[]
    topRecipients: { name: string; amount: number; id?: string; type?: string }[]
    topExpenditures: { name: string; amount: number; id?: string; type?: string }[]

    // Average & Rate Metrics
    avgDonation: number
    monthlyBurnRate: number

    // New Analytical Data
    expenditureBreakdown: { name: string; value: number; color?: string }[]
    donorLocationBreakdown: { name: string; value: number }[]
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

export const getCityStats = async (cityName: string): Promise<CityStats> => {
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
            WHERE p.city ILIKE $1
        `, [cityName])

        const totalRaised = parseFloat(totalRaisedRes.rows[0].total)



        // 3. Candidates Count
        const candidatesRes = await client.query(`
            SELECT COUNT(*) FROM profiles 
            WHERE city ILIKE $1 AND type = 'POLITICIAN'
        `, [cityName])
        const candidatesCount = parseInt(candidatesRes.rows[0].count, 10)

        // 4. Donors Count (Unique entities donating to politicians in this city)
        const donorsRes = await client.query(`
            SELECT COUNT(DISTINCT t.entity_name)
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
        `, [cityName])
        const donorsCount = parseInt(donorsRes.rows[0].count, 10)

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
            WHERE p.city ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
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
            WHERE p.city ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
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

        // 7. Top Donors (Entities donating to city candidates)
        const topDonorsRes = await client.query(`
            SELECT 
                t.entity_name,
                SUM(t.amount) as total,
                MAX(p_entity.id::text) as id,
                MAX(p_entity.type) as type
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            LEFT JOIN profiles p_entity ON t.entity_name = p_entity.name
            WHERE p.city ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY t.entity_name
            ORDER BY total DESC
            LIMIT 5
        `, [cityName])
        const topDonors = topDonorsRes.rows.map(row => ({
            name: row.entity_name,
            amount: parseFloat(row.total),
            id: row.id,
            type: row.type
        }))

        // 8. Top Recipients (Candidates raising money in city)
        const topRecipientsRes = await client.query(`
            SELECT 
                f.filer_name,
                SUM(f.total_contributions) as total,
                MAX(p.id::text) as id,
                MAX(p.type) as type
            FROM filings f
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1
            GROUP BY f.filer_name
            ORDER BY total DESC
            LIMIT 5
        `, [cityName])
        const topRecipients = topRecipientsRes.rows.map(row => ({
            name: row.filer_name,
            amount: parseFloat(row.total),
            id: row.id,
            type: row.type || 'POLITICIAN'
        }))

        // 9. Top Expenditures (Vendors paid by city candidates)
        const topExpendituresRes = await client.query(`
            SELECT 
                t.entity_name,
                SUM(t.amount) as total,
                MAX(p_entity.id::text) as id, 
                MAX(p_entity.type) as type
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            LEFT JOIN profiles p_entity ON t.entity_name = p_entity.name
            WHERE p.city ILIKE $1 AND t.transaction_type = 'EXPENDITURE'
            GROUP BY t.entity_name
            ORDER BY total DESC
            LIMIT 5
        `, [cityName])
        const topExpenditures = topExpendituresRes.rows.map(row => ({
            name: row.entity_name,
            amount: parseFloat(row.total),
            id: row.id,
            type: row.type
        }))

        // 10. City-Wide Expenditure Categories
        const cityExpBreakdownRes = await client.query(`
            SELECT 
                t.expenditure_code,
                SUM(t.amount) as value
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1 AND t.transaction_type = 'EXPENDITURE'
            GROUP BY t.expenditure_code
        `, [cityName])

        const expCodeMap: Record<string, string> = {
            'CMP': 'Campaign Paraphernalia',
            'CNS': 'Campaign Consultants',
            'CTB': 'Contribution (to other)',
            'CVC': 'Civic Donations',
            'FIL': 'Filing Fees',
            'FND': 'Fundraising Events',
            'IND': 'Independent Exp',
            'LEG': 'Legal Defense',
            'LIT': 'Literature/Mailings',
            'MBR': 'Member Comms',
            'MTG': 'Meetings/Appearances',
            'OFC': 'Office Expenses',
            'PET': 'Petition Circulating',
            'PHO': 'Phone Banks',
            'POL': 'Polling',
            'POS': 'Postage',
            'PRO': 'Professional Services',
            'PRT': 'Print Ads',
            'RAD': 'Radio Airtime',
            'RFD': 'Returned Contributions',
            'SAL': 'Campaign Workers Salaries',
            'TEL': 'TV/Cable Airtime',
            'TRC': 'Candidate Travel',
            'TRS': 'Staff/Spouse Travel',
            'TSF': 'Transfer of Funds',
            'VOT': 'Voter Registration',
            'WEB': 'Web/Internet Costs'
        }

        const expenditureBreakdown = cityExpBreakdownRes.rows.map(row => ({
            name: expCodeMap[row.expenditure_code] || row.expenditure_code || 'Uncategorized',
            value: parseFloat(row.value),
            color: '#f87171' // Red-ish for spending
        })).sort((a, b) => b.value - a.value)

        // 11. Donor Location Breakdown (Internal vs External)
        // Simple logic: If entity_city matches cityName => Local, else External
        const locRes = await client.query(`
            SELECT 
                CASE 
                    WHEN t.entity_city ILIKE $1 THEN 'Local'
                    ELSE 'External'
                END as location_type,
                SUM(t.amount) as value
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY 1
        `, [cityName])

        const donorLocationBreakdown = locRes.rows.map(row => ({
            name: row.location_type,
            value: parseFloat(row.value)
        }))

        // 12. Average Donation (City Wide)
        const avgDonRes = await client.query(`
            SELECT AVG(t.amount) as avg_val
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
        `, [cityName])
        const avgDonation = parseFloat(avgDonRes.rows[0].avg_val || '0')

        // 13. Monthly Burn Rate (Total Exp / Months Active)
        // Estimate range from first filing date to last
        const burnRes = await client.query(`
            SELECT 
                SUM(t.amount) as total_exp,
                EXTRACT(YEAR FROM AGE(MAX(t.transaction_date), MIN(t.transaction_date))) * 12 +
                EXTRACT(MONTH FROM AGE(MAX(t.transaction_date), MIN(t.transaction_date))) as months_diff
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1 AND t.transaction_type = 'EXPENDITURE'
        `, [cityName])

        const totalCityExp = parseFloat(burnRes.rows[0].total_exp || '0')
        const monthsActive = Math.max(parseFloat(burnRes.rows[0].months_diff || '1'), 1) // Avoid div by 0
        const monthlyBurnRate = totalCityExp / monthsActive

        return {
            totalRaised,

            candidatesCount,
            donorsCount,
            fundraisingTrend,
            donorComposition,
            topDonors,
            topRecipients,
            topExpenditures,
            expenditureBreakdown,
            donorLocationBreakdown,
            avgDonation,
            monthlyBurnRate
        }

    } catch (error) {
        console.error(`Error fetching stats for ${cityName}:`, error)
        return {
            totalRaised: 0,

            candidatesCount: 0,
            donorsCount: 0,
            fundraisingTrend: [],
            donorComposition: [],
            topDonors: [],
            topRecipients: [],
            topExpenditures: [],
            expenditureBreakdown: [],
            donorLocationBreakdown: [],
            avgDonation: 0,
            monthlyBurnRate: 0
        }
    } finally {
        if (client) client.release()
    }
}

export const getPoliticianStats = cache(async (politicianName: string) => {
    let client;

    try {

        client = await pool.connect()

        // 1. Total Raised
        const raisedRes = await client.query(`
            SELECT COALESCE(SUM(total_contributions), 0) as total
            FROM filings 
            WHERE filer_name ILIKE $1
        `, [politicianName])
        const totalRaised = parseFloat(raisedRes.rows[0].total)




        // 3. Donor Count
        // Distinct entities who contributed to filings by this politician
        const donorsRes = await client.query(`
            SELECT COUNT(DISTINCT entity_name) 
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
        `, [politicianName])
        const donorCount = parseInt(donorsRes.rows[0].count, 10)

        // 4. Fundraising Trend
        const trendRes = await client.query(`
            SELECT 
                TO_CHAR(t.transaction_date, 'YYYY-MM') as date,
                SUM(t.amount) as amount
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
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
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
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



        // 6. Total Expenditures
        const spentRes = await client.query(`
            SELECT COALESCE(SUM(total_expenditures), 0) as total
            FROM filings 
            WHERE filer_name ILIKE $1
        `, [politicianName])
        const totalExpenditures = parseFloat(spentRes.rows[0].total)

        // 7. Expenditure Trend
        const expTrendRes = await client.query(`
            SELECT 
                TO_CHAR(t.transaction_date, 'YYYY-MM') as date,
                SUM(t.amount) as amount
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'EXPENDITURE'
            GROUP BY 1
            ORDER BY 1 ASC
        `, [politicianName])

        const expenditureTrend = expTrendRes.rows.map(row => ({
            date: row.date,
            amount: parseFloat(row.amount)
        }))

        // 8. Top Expenditures (Vendors)
        // LEFT JOIN profiles to get ID if accessible
        const topExpRes = await client.query(`
            SELECT 
                t.entity_name,
                SUM(t.amount) as value,
                MAX(p.id::text) as id,
                MAX(p.type) as type
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            LEFT JOIN profiles p ON t.entity_name = p.name
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'EXPENDITURE'
            GROUP BY t.entity_name
            ORDER BY value DESC
            LIMIT 5
        `, [politicianName])

        const topExpenditures = topExpRes.rows.map(row => ({
            name: row.entity_name,
            value: parseFloat(row.value),
            id: row.id,
            type: row.type
        }))

        // 9. Expenditure Breakdown (By Code)
        const expBreakdownRes = await client.query(`
            SELECT 
                t.expenditure_code,
                SUM(t.amount) as value
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'EXPENDITURE'
            GROUP BY t.expenditure_code
        `, [politicianName])

        const expCodeMap: Record<string, string> = {
            'CMP': 'Campaign Paraphernalia',
            'CNS': 'Campaign Consultants',
            'CTB': 'Contribution (to other)',
            'CVC': 'Civic Donations',
            'FIL': 'Filing Fees',
            'FND': 'Fundraising Events',
            'IND': 'Independent Exp',
            'LEG': 'Legal Defense',
            'LIT': 'Literature/Mailings',
            'MBR': 'Member Comms',
            'MTG': 'Meetings/Appearances',
            'OFC': 'Office Expenses',
            'PET': 'Petition Circulating',
            'PHO': 'Phone Banks',
            'POL': 'Polling',
            'POS': 'Postage',
            'PRO': 'Professional Services',
            'PRT': 'Print Ads',
            'RAD': 'Radio Airtime',
            'RFD': 'Returned Contributions',
            'SAL': 'Comp. Salaries',
            'TEL': 'TV/Cable Airtime',
            'TRC': 'Candidate Travel',
            'TRS': 'Staff/Spouse Travel',
            'TSF': 'Transfer of Funds',
            'VOT': 'Voter Registration',
            'WEB': 'Web/Internet Costs'
        }

        const expenditureBreakdown = expBreakdownRes.rows.map(row => ({
            name: expCodeMap[row.expenditure_code] || row.expenditure_code || 'Uncategorized',
            value: parseFloat(row.value),
            color: '#f87171'
        })).sort((a, b) => b.value - a.value)

        // 10. Contributor Occupation Breakdown
        const occRes = await client.query(`
            SELECT 
                COALESCE(t.contributor_occupation, 'Unknown') as name,
                SUM(t.amount) as value
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
            AND t.entity_cd = 'IND' -- Usually only individuals have occupations
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 10
        `, [politicianName])

        const contributorOccupationBreakdown = occRes.rows.map(row => ({
            name: row.name,
            value: parseFloat(row.value),
            color: '#6366f1' // Indigo
        }))

        // 11. Contributor Location Breakdown
        const locRes = await client.query(`
            SELECT 
                COALESCE(t.entity_city, 'Unknown') as name,
                SUM(t.amount) as value
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 10
        `, [politicianName])

        const contributorLocationBreakdown = locRes.rows.map(row => ({
            name: row.name,
            value: parseFloat(row.value),
            color: '#10b981' // Emerald
        }))

        // 12. Average Donation
        const avgDonRes = await client.query(`
            SELECT AVG(t.amount) as avg_val
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
        `, [politicianName])
        const avgDonation = parseFloat(avgDonRes.rows[0].avg_val || '0')

        // 13. Monthly Burn Rate
        const burnRes = await client.query(`
            SELECT 
                SUM(t.amount) as total_exp,
                EXTRACT(YEAR FROM AGE(MAX(t.transaction_date), MIN(t.transaction_date))) * 12 +
                EXTRACT(MONTH FROM AGE(MAX(t.transaction_date), MIN(t.transaction_date))) as months_diff
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            WHERE f.filer_name ILIKE $1 AND t.transaction_type = 'EXPENDITURE'
        `, [politicianName])

        const totalPolyExp = parseFloat(burnRes.rows[0].total_exp || '0')
        const polyMonths = Math.max(parseFloat(burnRes.rows[0].months_diff || '1'), 1)
        const monthlyBurnRate = totalPolyExp / polyMonths

        return {
            totalRaised,

            donorCount,
            fundraisingTrend,
            donorComposition,
            totalExpenditures,
            expenditureTrend,
            topExpenditures,
            expenditureBreakdown,
            contributorOccupationBreakdown,
            contributorLocationBreakdown,
            avgDonation,
            monthlyBurnRate
        }


    } catch (error) {
        console.error("Error fetching politician stats:", error)
        return {
            totalRaised: 0,
            cashOnHand: 0,
            donorCount: 0,
            fundraisingTrend: [],
            donorComposition: [],
            totalExpenditures: 0,
            expenditureTrend: [],
            topExpenditures: [],
            expenditureBreakdown: [],
            contributorOccupationBreakdown: [],
            contributorLocationBreakdown: [],
            avgDonation: 0,
            monthlyBurnRate: 0
        }
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
        // LEFT JOIN profiles to get ID
        const benRes = await client.query(`
            SELECT 
                f.filer_name as name,
                SUM(t.amount) as amount,
                
                MAX(p.id::text) as id,
                MAX(p.type) as type
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            LEFT JOIN profiles p ON f.filer_name = p.name
            WHERE t.entity_name = $1 AND t.transaction_type = 'CONTRIBUTION'
            GROUP BY f.filer_name
            ORDER BY amount DESC
            LIMIT 5
        `, [lobbyistName])

        const beneficiaries = benRes.rows.map(row => ({
            name: row.name,
            amount: `$${parseFloat(row.amount).toLocaleString()}`,
            type: 'Contribution',
            id: row.id,
            profileType: row.type || 'POLITICIAN' // Fallback to politician if type not found but name is there
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
