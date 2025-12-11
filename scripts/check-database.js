const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: 'postgresql://postgres.rppxstkdrbdvmhhgtoyr:EconRulez!2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

(async () => {
    try {
        const client = await pool.connect();
        let output = '';

        output += '=== PROFILES BY TYPE ===\n';
        const profileCounts = await client.query(`
            SELECT type, COUNT(*) as count 
            FROM profiles 
            GROUP BY type
        `);
        output += JSON.stringify(profileCounts.rows, null, 2) + '\n\n';

        output += '=== ALL POLITICIAN PROFILES ===\n';
        const politicians = await client.query(`
            SELECT id, name, city, created_at 
            FROM profiles 
            WHERE type = 'POLITICIAN' 
            ORDER BY created_at DESC
        `);
        output += JSON.stringify(politicians.rows, null, 2) + '\n\n';

        output += '=== ALL CITY PROFILES ===\n';
        const cities = await client.query(`
            SELECT id, name, created_at 
            FROM profiles 
            WHERE type = 'CITY' 
            ORDER BY created_at DESC
        `);
        output += JSON.stringify(cities.rows, null, 2) + '\n\n';

        output += '=== DISTINCT FILER NAMES FROM FILINGS ===\n';
        const filers = await client.query(`
            SELECT DISTINCT filer_name 
            FROM filings 
            WHERE status = 'PROCESSED'
            ORDER BY filer_name
        `);
        output += JSON.stringify(filers.rows, null, 2) + '\n\n';

        client.release();
        await pool.end();

        fs.writeFileSync('database-diagnostic-output.txt', output);
        console.log('Output written to database-diagnostic-output.txt');
        console.log(output);
    } catch (e) {
        console.error('Error:', e.message);
        console.error(e);
        process.exit(1);
    }
})();
