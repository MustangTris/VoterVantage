const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkFilings() {
    const client = await pool.connect();
    try {
        console.log('=== Checking All Filings ===\n');

        const { rows: filings } = await client.query(`
      SELECT 
        id,
        filer_name,
        source_file_url,
        total_contributions,
        total_expenditures,
        status,
        created_at
      FROM filings
      ORDER BY filer_name, created_at
    `);

        console.log(`Total filings in database: ${filings.length}\n`);

        filings.forEach((f, i) => {
            console.log(`Filing ${i + 1}:`);
            console.log(`  ID: ${f.id}`);
            console.log(`  Filer: ${f.filer_name}`);
            console.log(`  Source: ${f.source_file_url || 'NULL'}`);
            console.log(`  Contributions: $${f.total_contributions || 0}`);
            console.log(`  Expenditures: $${f.total_expenditures || 0}`);
            console.log(`  Status: ${f.status}`);
            console.log(`  Created: ${f.created_at}`);
            console.log('');
        });

        // Group by filer_name
        console.log('=== Grouped by Filer Name ===\n');
        const grouped = filings.reduce((acc, f) => {
            if (!acc[f.filer_name]) acc[f.filer_name] = [];
            acc[f.filer_name].push(f);
            return acc;
        }, {});

        Object.entries(grouped).forEach(([name, filings]) => {
            console.log(`${name}: ${filings.length} filing(s)`);
            if (filings.length > 1) {
                console.log('  ⚠️ POTENTIAL DUPLICATES');
                filings.forEach((f, i) => {
                    console.log(`    ${i + 1}. ID: ${f.id}, Source: ${f.source_file_url || 'NULL'}, Contributions: $${f.total_contributions || 0}`);
                });
            }
            console.log('');
        });

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkFilings();
