'use server'

import pool from '@/lib/db';

export type SearchResult = {
    id: string;
    title: string;
    type: 'POLITICIAN' | 'LOBBYIST' | 'CITY' | 'FILING' | 'TRANSACTION';
    description: string;
    date?: string;
};

export async function searchDatabase(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    // If no database URL is set, return empty array (safe fallback for now)
    if (!process.env.DATABASE_URL) {
        console.warn("Database connection string missing");
        return [];
    }

    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    try {
        const client = await pool.connect();

        try {
            // 1. Search Profiles
            const profilesQuery = `
        SELECT id, name as title, type, description, created_at
        FROM profiles
        WHERE name ILIKE $1 OR description ILIKE $1
        LIMIT 5
      `;
            const profilesRes = await client.query(profilesQuery, [searchTerm]);

            profilesRes.rows.forEach((row: any) => {
                results.push({
                    id: row.id,
                    title: row.title,
                    type: row.type, // 'POLITICIAN', 'LOBBYIST', 'CITY'
                    description: row.description || `Profile for ${row.title}`,
                    date: row.created_at?.toString()
                });
            });

            // 2. Search Filings
            const filingsQuery = `
        SELECT id, filer_name, status, filing_date
        FROM filings
        WHERE filer_name ILIKE $1
        LIMIT 5
      `;
            const filingsRes = await client.query(filingsQuery, [searchTerm]);

            filingsRes.rows.forEach((row: any) => {
                results.push({
                    id: row.id,
                    title: `Filing: ${row.filer_name}`,
                    type: 'FILING',
                    description: `Status: ${row.status}`,
                    date: row.filing_date?.toString()
                });
            });

            // 3. Search Transactions (Contributors/Payees)
            const transQuery = `
        SELECT id, entity_name, amount, transaction_type, description
        FROM transactions
        WHERE entity_name ILIKE $1 OR description ILIKE $1
        LIMIT 5
      `;
            const transRes = await client.query(transQuery, [searchTerm]);

            transRes.rows.forEach((row: any) => {
                results.push({
                    id: row.id,
                    title: `${row.transaction_type}: ${row.entity_name}`,
                    type: 'TRANSACTION',
                    description: `Amount: $${row.amount} - ${row.description || ''}`,
                });
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Database search error:", error);
        // In production, might want to rethrow or return error state
    }

    return results;
}

export async function getConnectedCities(): Promise<string[]> {
    try {
        if (!process.env.DATABASE_URL) return [];

        const client = await pool.connect();
        try {
            // In a real app, you might join with a 'locations' table or similar.
            // For now, we look for profiles of type 'CITY'.
            const query = `
                SELECT DISTINCT name 
                FROM profiles 
                WHERE type = 'CITY'
             `;
            const res = await client.query(query);
            return res.rows.map((r: any) => r.name);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Failed to fetch connected cities", error);
        return [];
    }
}
