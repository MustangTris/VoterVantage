'use server'

import pool from '@/lib/db';

export type SearchResult = {
    id: string;
    title: string;
    type: 'POLITICIAN' | 'LOBBYIST' | 'CITY';
    description: string;
    matchType?: 'DIRECT' | 'FILING' | 'TRANSACTION';
    matchDetail?: string;
    date?: string;
};

export async function searchDatabase(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    if (!process.env.DATABASE_URL) {
        console.warn("Database connection string missing");
        return [];
    }

    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    try {
        const client = await pool.connect();

        try {
            // Unified Search Query
            // 1. Direct Profile Matches
            // 2. Matches via Filings (filer_name = profile.name)
            // 3. Matches via Transactions (filing -> filer -> profile)

            const unifiedQuery = `
                WITH matches AS (
                    -- 1. Direct Profile Matches
                    SELECT 
                        p.id, p.name, p.type, p.description, p.created_at,
                        'DIRECT' as match_type,
                        NULL as match_detail,
                        1 as priority
                    FROM profiles p
                    WHERE p.name ILIKE $1 OR p.description ILIKE $1
                    
                    UNION ALL
                    
                    -- 2. Matches via Filings
                    SELECT 
                        p.id, p.name, p.type, p.description, p.created_at,
                        'FILING' as match_type,
                        f.filer_name as match_detail,
                        2 as priority
                    FROM profiles p
                    JOIN filings f ON f.filer_name = p.name
                    WHERE f.filer_name ILIKE $1
                    
                    UNION ALL
                    
                    -- 3. Matches via Transactions
                    SELECT 
                        p.id, p.name, p.type, p.description, p.created_at,
                        'TRANSACTION' as match_type,
                        t.entity_name || ' ($' || t.amount || ')' as match_detail,
                        3 as priority
                    FROM profiles p
                    JOIN filings f ON f.filer_name = p.name
                    JOIN transactions t ON t.filing_id = f.id
                    WHERE t.entity_name ILIKE $1 OR t.description ILIKE $1
                )
                SELECT DISTINCT ON (id) 
                    id, name, type, description, created_at, match_type, match_detail
                FROM matches
                ORDER BY id, priority ASC
                LIMIT 20;
            `;

            const res = await client.query(unifiedQuery, [searchTerm]);

            res.rows.forEach((row: any) => {
                let description = row.description || `Profile for ${row.name}`;

                // Enhance description based on match source
                if (row.match_type === 'TRANSACTION') {
                    description = `Found via transaction: ${row.match_detail}`;
                } else if (row.match_type === 'FILING') {
                    description = `Found via filing: ${row.match_detail}`;
                }

                results.push({
                    id: row.id,
                    title: row.name,
                    type: row.type,
                    description: description,
                    matchType: row.match_type,
                    matchDetail: row.match_detail,
                    date: row.created_at?.toString()
                });
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Database search error:", error);
    }

    return results;
}

export async function getConnectedCities(): Promise<string[]> {
    try {
        if (!process.env.DATABASE_URL) return [];

        const client = await pool.connect();
        try {
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
