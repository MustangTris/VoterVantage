const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkCityProfileName() {
    const client = await pool.connect();
    try {
        console.log('=== Checking City Profile Name ===\n');

        // Get the exact name stored in the profiles table for the Indio city profile
        const { rows } = await client.query(`
      SELECT id, name, city, type
      FROM profiles 
      WHERE id = 'a3acb864-9de1-46e5-8a13-12aa54fb53dd'
    `);

        if (rows.length > 0) {
            const profile = rows[0];
            console.log('City Profile Found:');
            console.log(`  ID: ${profile.id}`);
            console.log(`  Name: "${profile.name}"`);
            console.log(`  Name Length: ${profile.name.length} characters`);
            console.log(`  Name Bytes: ${Buffer.from(profile.name).toString('hex')}`);
            console.log(`  Type: ${profile.type}`);
            console.log(`  City Field: ${profile.city || 'NULL'}`);
            console.log('');

            // Now test the query with this exact name
            console.log('Testing getCityStats query with this exact name:');
            const { rows: statsTest } = await client.query(`
        SELECT COALESCE(SUM(f.total_contributions), 0) as total
        FROM filings f
        JOIN profiles p ON f.filer_name = p.name
        WHERE p.city ILIKE $1
      `, [profile.name]);
            console.log(`Result: $${statsTest[0].total}`);
        } else {
            console.log('❌ No profile found with that ID!');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkCityProfileName();
