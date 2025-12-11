const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function removeDuplicateFilings() {
    const client = await pool.connect();
    try {
        console.log('=== Removing Duplicate Filings ===\n');

        // Step 1: Find all filings grouped by filer_name and source_file_url
        console.log('Step 1: Identifying duplicate filings...');
        const { rows: duplicates } = await client.query(`
      SELECT 
        filer_name,
        source_file_url,
        COUNT(*) as count,
        ARRAY_AGG(id ORDER BY created_at ASC) as filing_ids,
        MIN(created_at) as first_created
      FROM filings
      GROUP BY filer_name, source_file_url
      HAVING COUNT(*) > 1
    `);

        if (duplicates.length === 0) {
            console.log('✅ No duplicate filings found!\n');
            return;
        }

        console.log(`Found ${duplicates.length} sets of duplicate filings:\n`);
        duplicates.forEach(dup => {
            console.log(`  - "${dup.filer_name}" (${dup.source_file_url}): ${dup.count} copies`);
            console.log(`    Filing IDs: ${dup.filing_ids.join(', ')}`);
        });
        console.log('');

        // Step 2: For each set of duplicates, keep the oldest one and delete the rest
        console.log('Step 2: Removing duplicate filings (keeping the oldest copy)...\n');

        let totalDeleted = 0;
        for (const dup of duplicates) {
            const filingIds = dup.filing_ids;
            const keepId = filingIds[0]; // Keep the first (oldest) one
            const deleteIds = filingIds.slice(1); // Delete the rest

            console.log(`Processing "${dup.filer_name}":`);
            console.log(`  Keeping: ${keepId}`);
            console.log(`  Deleting: ${deleteIds.join(', ')}`);

            // Delete transactions associated with duplicate filings
            const { rowCount: txDeleted } = await client.query(`
        DELETE FROM transactions
        WHERE filing_id = ANY($1)
      `, [deleteIds]);
            console.log(`  Deleted ${txDeleted} transactions`);

            // Delete the duplicate filings
            const { rowCount: filingsDeleted } = await client.query(`
        DELETE FROM filings
        WHERE id = ANY($1)
      `, [deleteIds]);
            console.log(`  Deleted ${filingsDeleted} filings`);

            totalDeleted += filingsDeleted;
            console.log('');
        }

        console.log(`✅ Removed ${totalDeleted} duplicate filings\n`);

        // Step 3: Recalculate filing totals for remaining filings
        console.log('Step 3: Recalculating totals for remaining filings...');
        const { rows: remainingFilings } = await client.query(`
      SELECT DISTINCT id FROM filings
    `);

        for (const filing of remainingFilings) {
            // Calculate contributions
            const { rows: contribs } = await client.query(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE filing_id = $1 AND transaction_type = 'CONTRIBUTION'
      `, [filing.id]);

            // Calculate expenditures
            const { rows: expends } = await client.query(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE filing_id = $1 AND transaction_type = 'EXPENDITURE'
      `, [filing.id]);

            // Update filing
            await client.query(`
        UPDATE filings
        SET 
          total_contributions = $1,
          total_expenditures = $2
        WHERE id = $3
      `, [parseFloat(contribs[0].total), parseFloat(expends[0].total), filing.id]);
        }

        console.log(`✅ Recalculated totals for ${remainingFilings.length} filings\n`);

        console.log('=== Cleanup Complete ===');

    } catch (err) {
        console.error('❌ Cleanup failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

removeDuplicateFilings();
