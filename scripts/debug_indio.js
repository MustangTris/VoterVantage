```javascript
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debugIndio() {
    const client = await pool.connect();
    try {
        console.log('--- Checking City Profile "Indio" ---');
        const cityRes = await client.query("SELECT * FROM profiles WHERE type = 'CITY' AND name = 'Indio'");
        console.log('City Profile:', cityRes.rows);

        console.log('\n--- Checking Politicians linked to "Indio" ---');
        // Check if any profiles have city = 'Indio'
        const politiciansRes = await client.query("SELECT id, name, type, city FROM profiles WHERE city = 'Indio'");
        console.log(`Found ${ politiciansRes.rowCount } profiles with city = 'Indio': `);
        console.log(politiciansRes.rows);

        console.log('\n--- Checking Filings for these politicians ---');
        if (politiciansRes.rowCount > 0) {
            const names = politiciansRes.rows.map(p => p.name);
            const filingsRes = await client.query(`
            SELECT id, filer_name, 'total_contributions', total_contributions 
            FROM filings 
            WHERE filer_name = ANY($1)
    `, [names]);
            console.log(`Found ${ filingsRes.rowCount } filings for these politicians: `);
            console.log(filingsRes.rows.slice(0, 5)); // Show first 5
        }

        console.log('\n--- Checking Transactions for these filings ---');
        // If we have filings, check transactions
        // ...

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

debugIndio();
