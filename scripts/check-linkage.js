const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.rppxstkdrbdvmhhgtoyr:EconRulez!2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

(async () => {
    const client = await pool.connect();

    try {
        console.log('=== CHECKING CITY DATA LINKAGE ===\n');

        // Check if filings link to profiles correctly
        const result = await client.query(`
            SELECT 
                f.filer_name,
                f.id as filing_id,
                f.total_contributions,
                p.id as profile_id,
                p.name as profile_name,
                p.city as profile_city,
                CASE 
                    WHEN p.id IS NULL THEN 'NO_MATCH'
                    WHEN LOWER(TRIM(f.filer_name)) = LOWER(TRIM(p.name)) THEN 'EXACT'
                    ELSE 'PARTIAL'
                END as match_quality
            FROM filings f
            LEFT JOIN profiles p ON LOWER(TRIM(f.filer_name)) = LOWER(TRIM(p.name)) AND p.type = 'POLITICIAN'
            WHERE f.status = 'PROCESSED'
            ORDER BY match_quality, f.filer_name
        `);

        console.log('Filings and their profile matches:');
        result.rows.forEach(row => {
            console.log(`[${row.match_quality}] Filing: "${row.filer_name}" -> Profile: "${row.profile_name || 'NONE'}" (city: ${row.profile_city || 'N/A'})`);
        });

        console.log(`\n=== SUMMARY ===`);
        const noMatch = result.rows.filter(r => r.match_quality === 'NO_MATCH').length;
        const exact = result.rows.filter(r => r.match_quality === 'EXACT').length;
        console.log(`Total filings: ${result.rows.length}`);
        console.log(`Exact matches: ${exact}`);
        console.log(`No matches: ${noMatch}`);

        if (noMatch > 0) {
            console.log(`\n⚠️  ${noMatch} filings have NO matching profile!`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
})();
