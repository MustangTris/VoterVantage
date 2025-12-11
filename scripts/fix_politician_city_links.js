const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fixPoliticianCityLinks() {
    const client = await pool.connect();
    try {
        console.log('=== Starting Data Migration: Fix Politician City Links ===\n');

        // Step 1: Find all politicians without a city set
        console.log('Step 1: Finding politicians without city links...');
        const { rows: politiciansWithoutCity } = await client.query(`
      SELECT id, name, city 
      FROM profiles 
      WHERE type = 'POLITICIAN' 
        AND (city IS NULL OR city = '')
    `);
        console.log(`Found ${politiciansWithoutCity.length} politicians without city links.\n`);

        if (politiciansWithoutCity.length > 0) {
            console.log('Politicians to update:');
            politiciansWithoutCity.forEach(p => console.log(`  - ${p.name}`));
            console.log('');
        }

        // Step 2: Update all politicians to link to Indio
        // (Currently assuming all filings are for Indio jurisdiction)
        console.log('Step 2: Updating politician profiles to link to "Indio"...');
        const updateResult = await client.query(`
      UPDATE profiles 
      SET city = 'Indio' 
      WHERE type = 'POLITICIAN' 
        AND name IN (SELECT DISTINCT filer_name FROM filings)
        AND (city IS NULL OR city = '')
      RETURNING id, name
    `);

        console.log(`✅ Updated ${updateResult.rowCount} politician profiles.\n`);

        if (updateResult.rows.length > 0) {
            console.log('Updated profiles:');
            updateResult.rows.forEach(p => console.log(`  - ${p.name} → Indio`));
            console.log('');
        }

        // Step 3: Verify the update
        console.log('Step 3: Verifying results...');
        const { rows: verifyResults } = await client.query(`
      SELECT name, city 
      FROM profiles 
      WHERE type = 'POLITICIAN' 
      ORDER BY name
    `);

        console.log(`Total politicians in database: ${verifyResults.length}`);
        const linkedToIndio = verifyResults.filter(p => p.city === 'Indio').length;
        const unlinked = verifyResults.filter(p => !p.city).length;
        console.log(`  - Linked to Indio: ${linkedToIndio}`);
        console.log(`  - Still unlinked: ${unlinked}\n`);

        console.log('=== Migration Complete ===');

    } catch (err) {
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

fixPoliticianCityLinks();
