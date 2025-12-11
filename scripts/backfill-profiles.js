/**
 * Backfill Script: Create Missing Profiles
 * 
 * This script creates politician and city profiles for all PROCESSED filings
 * that don't currently have associated profiles.
 */

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.rppxstkdrbdvmhhgtoyr:EconRulez!2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

// Map filer names to their jurisdictions based on the filer name content
function detectJurisdiction(filerName) {
    const name = filerName.toLowerCase();

    if (name.includes('indio')) return 'Indio';
    if (name.includes('dhs') || name.includes('desert hot springs')) return 'Desert Hot Springs';
    if (name.includes('rancho mirage')) return 'Rancho Mirage';
    if (name.includes('palm desert')) return 'Palm Desert';
    if (name.includes('la quinta')) return 'La Quinta';
    if (name.includes('palm springs')) return 'Palm Springs';
    if (name.includes('cathedral city')) return 'Cathedral City';
    if (name.includes('coachella')) return 'Coachella';
    if (name.includes('indian wells')) return 'Indian Wells';

    // If no city detected, check for generic patterns
    if (name.includes('city council')) {
        // Extract city name before "city council"
        const match = name.match(/for ([a-z\s]+) city council/);
        if (match) {
            const cityName = match[1].trim();
            // Capitalize first letter of each word
            return cityName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }

    return null; // Unknown jurisdiction
}

async function backfillProfiles() {
    console.log('Starting profile backfill...\n');

    const client = await pool.connect();

    try {
        // 1. Get all PROCESSED filings
        const filingsResult = await client.query(`
            SELECT id, filer_name
            FROM filings
            WHERE status = 'PROCESSED'
            ORDER BY created_at ASC
        `);

        const filings = filingsResult.rows;
        console.log(`Found ${filings.length} PROCESSED filings\n`);

        // 2. Get existing profiles to avoid duplicates
        const profilesResult = await client.query(`
            SELECT name, type
            FROM profiles
        `);

        const existingPoliticians = new Set(
            profilesResult.rows
                .filter(p => p.type === 'POLITICIAN')
                .map(p => p.name.toLowerCase().trim())
        );

        const existingCities = new Set(
            profilesResult.rows
                .filter(p => p.type === 'CITY')
                .map(p => p.name.toLowerCase().trim())
        );

        console.log(`Existing profiles: ${existingPoliticians.size} politicians, ${existingCities.size} cities\n`);

        // 3. Determine what needs to be created
        const politiciansToCreate = [];
        const citiesToCreate = new Set();

        for (const filing of filings) {
            const filerName = filing.filer_name;
            const jurisdiction = detectJurisdiction(filerName);

            // Check if politician profile exists
            if (!existingPoliticians.has(filerName.toLowerCase().trim())) {
                console.log(`✓ Will create politician: ${filerName} (${jurisdiction || 'Unknown'})`);
                politiciansToCreate.push({
                    name: filerName,
                    jurisdiction: jurisdiction
                });
            } else {
                console.log(`- Skip politician (exists): ${filerName}`);
            }

            // Track city for creation
            if (jurisdiction && !existingCities.has(jurisdiction.toLowerCase().trim())) {
                citiesToCreate.add(jurisdiction);
            }
        }

        console.log(`\n=== Summary ===`);
        console.log(`Politicians to create: ${politiciansToCreate.length}`);
        console.log(`Cities to create: ${citiesToCreate.size}`);

        // 4. Create politician profiles
        if (politiciansToCreate.length > 0) {
            console.log('\n=== Creating Politician Profiles ===');

            for (const politician of politiciansToCreate) {
                try {
                    // Check if it already exists first
                    const checkResult = await client.query(`
                        SELECT id FROM profiles
                        WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND type = 'POLITICIAN'
                    `, [politician.name]);

                    if (checkResult.rows.length > 0) {
                        // Update existing
                        await client.query(`
                            UPDATE profiles
                            SET city = $2
                            WHERE id = $1
                        `, [checkResult.rows[0].id, politician.jurisdiction]);
                        console.log(`  ↻ Updated: ${politician.name}`);
                    } else {
                        // Insert new
                        const result = await client.query(`
                            INSERT INTO profiles (name, type, city, description)
                            VALUES ($1, 'POLITICIAN', $2, 'Backfilled from existing filing data.')
                            RETURNING id, name
                        `, [politician.name, politician.jurisdiction]);
                        console.log(`  ✓ Created: ${result.rows[0].name}`);
                    }
                } catch (error) {
                    console.error(`  ✗ Error with ${politician.name}:`, error.message);
                }
            }
        }

        // 5. Create city profiles
        if (citiesToCreate.size > 0) {
            console.log('\n=== Creating City Profiles ===');

            for (const city of citiesToCreate) {
                try {
                    // Check if it already exists
                    const checkResult = await client.query(`
                        SELECT id FROM profiles
                        WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND type = 'CITY'
                    `, [city]);

                    if (checkResult.rows.length > 0) {
                        console.log(`  - Skipped (already exists): ${city}`);
                    } else {
                        const result = await client.query(`
                            INSERT INTO profiles (name, type, description)
                            VALUES ($1, 'CITY', 'City jurisdiction backfilled from filing data.')
                            RETURNING id, name
                        `, [city]);
                        console.log(`  ✓ Created: ${result.rows[0].name}`);
                    }
                } catch (error) {
                    console.error(`  ✗ Error creating ${city}:`, error.message);
                }
            }
        }

        console.log('\n✅ Backfill complete!');

    } catch (error) {
        console.error('Backfill failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the backfill
backfillProfiles()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
