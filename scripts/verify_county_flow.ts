
import pool from '../src/lib/db';
import { getCountyOverviewStats, getAllCounties } from '../src/app/actions/category-stats';

async function verifyCountyFlow() {
    const client = await pool.connect();
    try {
        console.log('Starting County Flow Verification...');

        // 1. Create Test County
        const countyName = `Test County ${Date.now()}`;
        console.log(`Creating test county: ${countyName}`);

        await client.query(`
            INSERT INTO profiles (name, type, description) 
            VALUES ($1, 'COUNTY', 'Verification Test County')
        `, [countyName]);

        // 2. Create Test Politician linked to County
        const polName = `Test Supervisor ${Date.now()}`;
        console.log(`Creating test politician: ${polName}`);
        await client.query(`
            INSERT INTO profiles (name, type, city) 
            VALUES ($1, 'POLITICIAN', $2)
        `, [polName, countyName]);

        // 3. Create Filing and Transaction
        const { rows } = await client.query(`
            INSERT INTO filings (filer_name, total_contributions, status)
            VALUES ($1, 1000, 'PROCESSED')
            RETURNING id
        `, [polName]);
        const filingId = rows[0].id;

        await client.query(`
            INSERT INTO transactions (filing_id, transaction_type, entity_name, amount)
            VALUES ($1, 'CONTRIBUTION', 'Test Donor', 1000)
        `, [filingId]);

        // 4. Verify Stats
        console.log('Fetching getAllCounties...');
        const allCounties = await getAllCounties();
        const foundCounty = allCounties.find(c => c.name === countyName);

        if (foundCounty) {
            console.log('✅ Found new county in list');
        } else {
            console.error('❌ County not found in list');
        }

        console.log('Fetching getCountyOverviewStats...');
        const stats = await getCountyOverviewStats();
        // Check if county is in top list (might fail if others have more money, but we injected $1000)
        // If it's a fresh DB or minimal data, it should appear.
        const foundStat = stats.topCitiesByRaised.find(c => c.name === countyName);

        if (foundStat) {
            console.log(`✅ Found county in stats. Raised: ${foundStat.total_raised}`);
            if (foundStat.total_raised === 1000) {
                console.log('✅ Raised amount matches expected $1000');
            } else {
                console.warn(`⚠️ Raised amount mismatch. Expected 1000, got ${foundStat.total_raised}`);
            }
        } else {
            console.warn('⚠️ County not in top 5 list (expected if DB has many existing records > $1000)');
        }

        // Cleanup
        console.log('Cleaning up test data...');
        // Order matters for FK
        await client.query("DELETE FROM transactions WHERE filing_id = $1", [filingId]);
        await client.query("DELETE FROM filings WHERE id = $1", [filingId]);
        await client.query("DELETE FROM profiles WHERE name = $1 OR name = $2", [countyName, polName]);
        console.log('Cleanup complete.');

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}

verifyCountyFlow();
