const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.rppxstkdrbdvmhhgtoyr:EconRulez!2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

(async () => {
    const client = await pool.connect();

    try {
        const cityName = 'Desert Hot Springs';

        console.log(`=== TESTING CITY STATS QUERIES FOR: "${cityName}" ===\n`);

        // Test 1: Total Raised
        const totalRaisedRes = await client.query(`
            SELECT COALESCE(SUM(f.total_contributions), 0) as total
            FROM filings f
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1
        `, [cityName]);
        console.log(`1. Total Raised: $${parseFloat(totalRaisedRes.rows[0].total)}`);

        // Test 2: Candidates Count
        const candidatesRes = await client.query(`
            SELECT COUNT(*) FROM profiles 
            WHERE city ILIKE $1 AND type = 'POLITICIAN'
        `, [cityName]);
        console.log(`2. Candidates Count: ${candidatesRes.rows[0].count}`);

        // Test 3: Donors Count
        const donorsRes = await client.query(`
            SELECT COUNT(DISTINCT t.entity_name)
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1 AND t.transaction_type = 'CONTRIBUTION'
        `, [cityName]);
        console.log(`3. Donors Count: ${donorsRes.rows[0].count}`);

        // Test 4: Check transactions for this city
        const transactionCheck = await client.query(`
            SELECT 
                p.name as politician,
                COUNT(t.id) as transaction_count,
                SUM(t.amount) as total_amount
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1
            GROUP BY p.name
        `, [cityName]);

        console.log(`\n4. Transactions by Politician:`);
        transactionCheck.rows.forEach(row => {
            console.log(`   - ${row.politician}: ${row.transaction_count} transactions, $${parseFloat(row.total_amount)}`);
        });

        // Test 5: Check if there are any filings with data
        const filingCheck = await client.query(`
            SELECT 
                f.filer_name,
                f.total_contributions,
                f.total_expenditures,
                p.city
            FROM filings f
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city ILIKE $1
        `, [cityName]);

        console.log(`\n5. Filings for this city:`);
        filingCheck.rows.forEach(row => {
            console.log(`   - ${row.filer_name}: contrib=$${row.total_contributions}, expend=$${row.total_expenditures}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
})();
