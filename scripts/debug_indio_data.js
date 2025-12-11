const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debugIndioData() {
    const client = await pool.connect();
    try {
        console.log('=== Debugging Indio City Data ===\n');

        // 1. Check politicians linked to Indio
        console.log('1. Politicians linked to Indio:');
        const { rows: politicians } = await client.query(`
      SELECT id, name, city, type 
      FROM profiles 
      WHERE city ILIKE 'Indio' AND type = 'POLITICIAN'
    `);
        console.log(`Found ${politicians.length} politicians:`);
        politicians.forEach(p => console.log(`  - ${p.name} (id: ${p.id})`));
        console.log('');

        // 2. Check filings for these politicians
        if (politicians.length > 0) {
            const politicianNames = politicians.map(p => p.name);
            console.log('2. Filings for Indio politicians:');
            const { rows: filings } = await client.query(`
        SELECT id, filer_name, total_contributions, total_expenditures, status
        FROM filings
        WHERE filer_name = ANY($1)
      `, [politicianNames]);
            console.log(`Found ${filings.length} filings:`);
            filings.forEach(f => console.log(`  - ${f.filer_name}: Contributions=$${f.total_contributions || 0}, Expenditures=$${f.total_expenditures || 0}, Status=${f.status}`));
            console.log('');

            // 3. Check transactions for these filings
            if (filings.length > 0) {
                const filingIds = filings.map(f => f.id);
                console.log('3. Transactions for these filings:');
                const { rows: transactions } = await client.query(`
          SELECT 
            filing_id,
            transaction_type,
            COUNT(*) as count,
            SUM(amount) as total_amount
          FROM transactions
          WHERE filing_id = ANY($1)
          GROUP BY filing_id, transaction_type
        `, [filingIds]);
                console.log(`Transaction summary:`);
                transactions.forEach(t => console.log(`  - Filing ${t.filing_id}: ${t.transaction_type} x${t.count} = $${t.total_amount}`));
                console.log('');
            } else {
                console.log('❌ No filings found for Indio politicians!\n');
            }
        } else {
            console.log('❌ No politicians found linked to Indio!\n');
        }

        // 4. Test the exact query from getCityStats
        console.log('4. Testing getCityStats query (Total Raised):');
        const { rows: totalRaisedTest } = await client.query(`
      SELECT COALESCE(SUM(f.total_contributions), 0) as total
      FROM filings f
      JOIN profiles p ON f.filer_name = p.name
      WHERE p.city ILIKE $1
    `, ['Indio']);
        console.log(`Total Raised: $${totalRaisedTest[0].total}\n`);

        // 5. Check all profiles to see what we have
        console.log('5. All profiles in database:');
        const { rows: allProfiles } = await client.query(`
      SELECT name, type, city
      FROM profiles
      ORDER BY type, name
    `);
        console.log(`Total profiles: ${allProfiles.length}`);
        allProfiles.forEach(p => console.log(`  - ${p.name} (${p.type}) - City: ${p.city || 'NULL'}`));

    } catch (err) {
        console.error('❌ Debug failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

debugIndioData();
