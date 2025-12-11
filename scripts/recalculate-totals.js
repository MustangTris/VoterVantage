/**
 * Recalculate Totals Script
 * 
 * Iterates through all filings (or just PROCESSED ones) and recalculates
 * total_contributions and total_expenditures from the transactions table.
 * Updates the filings table with the correct values.
 */

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.rppxstkdrbdvmhhgtoyr:EconRulez!2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

(async () => {
    const client = await pool.connect();

    try {
        console.log('=== RECALCULATING FILING TOTALS ===\n');

        // 1. Get all filings
        const filingsRes = await client.query(`
            SELECT id, filer_name, status, total_contributions, total_expenditures
            FROM filings
            ORDER BY created_at DESC
        `);

        console.log(`Found ${filingsRes.rows.length} filings.`);

        let updatedCount = 0;

        for (const filing of filingsRes.rows) {
            console.log(`Processing: ${filing.filer_name} (${filing.status})`);

            // 2. Sum contributions
            const contribRes = await client.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM transactions
                WHERE filing_id = $1 AND transaction_type = 'CONTRIBUTION'
            `, [filing.id]);
            const realContributions = parseFloat(contribRes.rows[0].total);

            // 3. Sum expenditures
            const expendRes = await client.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM transactions
                WHERE filing_id = $1 AND transaction_type = 'EXPENDITURE'
            `, [filing.id]);
            const realExpenditures = parseFloat(expendRes.rows[0].total);

            // 4. Update if different (or if current is null)
            const currentContrib = filing.total_contributions === null ? -1 : parseFloat(filing.total_contributions);
            const currentExpend = filing.total_expenditures === null ? -1 : parseFloat(filing.total_expenditures);

            if (Math.abs(currentContrib - realContributions) > 0.01 ||
                Math.abs(currentExpend - realExpenditures) > 0.01) {

                await client.query(`
                    UPDATE filings
                    SET total_contributions = $1, total_expenditures = $2, status = 'PROCESSED'
                    WHERE id = $3
                `, [realContributions, realExpenditures, filing.id]);

                console.log(`   ↻ Updated: Contrib ${currentContrib} -> ${realContributions}, Expend ${currentExpend} -> ${realExpenditures}`);
                updatedCount++;
            } else {
                console.log(`   - Skipped (totals match)`);
            }
        }

        console.log(`\n✅ Recalculation complete! Updated ${updatedCount} filings.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
})();
