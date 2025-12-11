const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function removeDuplicates() {
    const client = await pool.connect();
    try {
        console.log('=== Removing Duplicate Filings for "Friends of Lupe Ramos Amith for Indio City Council 2024" ===\n');

        // Get all filings for this politician, ordered by creation date
        const { rows: filings } = await client.query(`
      SELECT id, source_file_url, total_contributions, created_at
      FROM filings
      WHERE filer_name = 'Friends of Lupe Ramos Amith for Indio City Council 2024'
      ORDER BY created_at ASC
    `);

        console.log(`Found ${filings.length} filings for this politician:\n`);
        filings.forEach((f, i) => {
            console.log(`${i + 1}. ID: ${f.id}`);
            console.log(`   Source: ${f.source_file_url}`);
            console.log(`   Created: ${f.created_at}`);
            console.log(`   Contributions: $${f.total_contributions}`);
            console.log('');
        });

        if (filings.length <= 1) {
            console.log('✅ No duplicates to remove!');
            return;
        }

        // Keep the first (oldest) filing
        const keepId = filings[0].id;
        const deleteIds = filings.slice(1).map(f => f.id);

        console.log(`Keeping the oldest filing: ${keepId}`);
        console.log(`Deleting ${deleteIds.length} duplicate filings:\n`);
        deleteIds.forEach(id => console.log(`  - ${id}`));
        console.log('');

        // Delete transactions for duplicate filings
        console.log('Deleting transactions...');
        const { rowCount: txDeleted } = await client.query(`
      DELETE FROM transactions
      WHERE filing_id = ANY($1)
    `, [deleteIds]);
        console.log(`✅ Deleted ${txDeleted} transactions\n`);

        // Delete duplicate filings
        console.log('Deleting duplicate filings...');
        const { rowCount: filingsDeleted } = await client.query(`
      DELETE FROM filings
      WHERE id = ANY($1)
    `, [deleteIds]);
        console.log(`✅ Deleted ${filingsDeleted} filings\n`);

        console.log('=== Cleanup Complete ===');
        console.log(`\nSummary:`);
        console.log(`  - Kept 1 filing (${keepId})`);
        console.log(`  - Deleted ${filingsDeleted} duplicate filings`);
        console.log(`  - Deleted ${txDeleted} duplicate transactions`);

    } catch (err) {
        console.error('❌ Error:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

removeDuplicates();
