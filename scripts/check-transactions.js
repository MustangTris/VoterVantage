const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.rppxstkdrbdvmhhgtoyr:EconRulez!2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

(async () => {
    const client = await pool.connect();

    try {
        console.log('=== CHECKING TRANSACTIONS ===\n');

        // Get generic Nunez filing
        const filingRes = await client.query(`
            SELECT id, filer_name, created_at, status 
            FROM filings 
            WHERE filer_name ILIKE '%Nunez%'
            ORDER BY created_at DESC
        `);

        console.log(`Found ${filingRes.rows.length} filings for Nunez`);

        for (const filing of filingRes.rows) {
            const txCount = await client.query(`
                SELECT COUNT(*) FROM transactions WHERE filing_id = $1
            `, [filing.id]);

            console.log(`\nFiling: ${filing.filer_name} (${filing.status}) - Created: ${filing.created_at}`);
            console.log(`ID: ${filing.id}`);
            console.log(`Transaction count: ${txCount.rows[0].count}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
})();
