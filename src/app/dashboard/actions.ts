'use server'

import { auth } from "@/auth"
import pool from "@/lib/db"

export async function getDashboardStats() {
    const session = await auth()

    if (!session?.user?.email) {
        return {
            filingsCount: 0,
            recordsVerified: 0,
            impactScore: "N/A"
        }
    }

    const client = await pool.connect()
    try {
        // Get user ID from email since filings are linked by UUID, not email directly, 
        // although schema says uploaded_by is UUID. We need the user's UUID.
        // Auth session user id is usually the UUID if using adapter, but let's be safe
        // and query by email if needed, or rely on session.user.id.
        // Standard NextAuth w/ pg-adapter puts UUID in session.user.id.

        const userId = session.user.id
        if (!userId) {
            console.error("No user ID in session")
            return { filingsCount: 0, recordsVerified: 0, impactScore: "N/A" }
        }

        // 1. Filings Uploaded
        const filingsRes = await client.query(
            `SELECT COUNT(*) FROM filings WHERE uploaded_by = $1`,
            [userId]
        )
        const filingsCount = parseInt(filingsRes.rows[0].count, 10)

        // 2. Records Verified (Transactions in verified filings or explicitly verified)
        // For now, let's count all transactions associated with filings uploaded by this user
        // In a real scenario, this might be filtered by status='VERIFIED'
        const recordsRes = await client.query(
            `SELECT COUNT(*) 
       FROM transactions t
       JOIN filings f ON t.filing_id = f.id
       WHERE f.uploaded_by = $1`,
            [userId]
        )
        const recordsVerified = parseInt(recordsRes.rows[0].count, 10)

        // 3. Impact Score (Mock calculation for now)
        // maybe 10 points per filing + 1 point per record
        const impactScoreNum = (filingsCount * 10) + (recordsVerified * 1)

        // Convert to a percentile-like string or just a rank
        let impactScore = "Top 50%" // Default
        if (impactScoreNum > 1000) impactScore = "Top 1%"
        else if (impactScoreNum > 500) impactScore = "Top 5%"
        else if (impactScoreNum > 100) impactScore = "Top 10%"
        else if (impactScoreNum > 0) impactScore = "Top 25%"

        return {
            filingsCount,
            recordsVerified,
            impactScore
        }

    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return {
            filingsCount: 0,
            recordsVerified: 0,
            impactScore: "Error"
        }
    } finally {
        client.release()
    }
}

export async function getRecentActivity() {
    const session = await auth()

    if (!session?.user?.id) return []

    const client = await pool.connect()
    try {
        const res = await client.query(
            `SELECT 
        f.id,
        f.filer_name,
        f.uploaded_by, 
        f.created_at,
        f.status
       FROM filings f
       WHERE f.uploaded_by = $1
       ORDER BY f.created_at DESC
       LIMIT 5`,
            [session.user.id]
        )

        return res.rows.map(row => ({
            id: row.id,
            description: `Uploaded filing for ${row.filer_name}`,
            date: new Date(row.created_at).toISOString(),
            status: row.status
        }))
    } catch (error) {
        console.error("Error fetching recent activity:", error)
        return []
    } finally {
        client.release()
    }
}
