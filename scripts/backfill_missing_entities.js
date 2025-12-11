const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const delimiterIndex = line.indexOf('=');
            if (delimiterIndex !== -1) {
                const key = line.substring(0, delimiterIndex).trim();
                const value = line.substring(delimiterIndex + 1).trim().replace(/^["']|["']$/g, '');
                if (key && value) process.env[key] = value;
            }
        });
    }
} catch (e) { }

const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace('?sslmode=require', ''),
    ssl: { rejectUnauthorized: false }
});

function detectJurisdiction(name) {
    const n = name.toLowerCase();

    // Explicit mappings
    if (n.includes('riverside') && (n.includes('supervisor') || n.includes('county'))) return 'Riverside County';
    if (n.includes('indio')) return 'Indio';
    if (n.includes('desert hot springs') || n.includes('dhs')) return 'Desert Hot Springs';
    if (n.includes('palm springs')) return 'Palm Springs';
    if (n.includes('cathedral city')) return 'Cathedral City';
    if (n.includes('rancho mirage')) return 'Rancho Mirage';
    if (n.includes('palm desert')) return 'Palm Desert';
    if (n.includes('indian wells')) return 'Indian Wells';
    if (n.includes('la quinta')) return 'La Quinta';
    if (n.includes('coachella')) return 'Coachella';

    return null;
}

async function runBackfill() {
    const client = await pool.connect();
    try {
        console.log("Starting Backfill of Missing Entities...\n");

        // 1. Backfill POLITICIANS from Filings
        // ----------------------------------------------------------------
        console.log("--- Backfilling Politicians ---");
        const filings = await client.query(`
            SELECT DISTINCT filer_name 
            FROM filings 
            WHERE status = 'PROCESSED'
        `);

        let polCount = 0;
        for (const row of filings.rows) {
            const name = row.filer_name;

            // Skip measures
            if (/^(Measure\s|Prop\s|Proposition\s|No\son\s|Yes\son\s)/i.test(name)) continue;

            // Check if exists
            const exists = await client.query("SELECT id FROM profiles WHERE name = $1 AND type = 'POLITICIAN'", [name]);
            if (exists.rows.length === 0) {
                const jurisdiction = detectJurisdiction(name);
                console.log(`Creating Politician: "${name}" (City: ${jurisdiction || 'Unknown'})`);

                await client.query(`
                    INSERT INTO profiles (name, type, city, description)
                    VALUES ($1, 'POLITICIAN', $2, 'Backfilled from data.')
                `, [name, jurisdiction]);
                polCount++;
            }
        }
        console.log(`Created ${polCount} new politician profiles.\n`);

        // 2. Backfill DONORS (LOBBYISTS) from Transactions
        // ----------------------------------------------------------------
        console.log("--- Backfilling Donors/Lobbyists ---");
        // Only donors > $1000 total to avoid cluttering with small individual donors
        const donors = await client.query(`
            SELECT t.entity_name, SUM(t.amount) as total
            FROM transactions t
            LEFT JOIN profiles p ON t.entity_name = p.name AND p.type = 'LOBBYIST'
            WHERE t.transaction_type = 'CONTRIBUTION'
            AND p.id IS NULL
            GROUP BY t.entity_name
            HAVING SUM(t.amount) > 1000
        `);

        let donorCount = 0;
        // Batch insert could be faster, but let's do loop for safety and logging
        // Or batch in chunks of 50
        const batchSize = 100;
        const donorList = donors.rows;

        for (let i = 0; i < donorList.length; i += batchSize) {
            const batch = donorList.slice(i, i + batchSize);
            const values = batch.map(d => {
                // Escape single quotes for SQL literal if doing manual string building, 
                // but we should use parameterized query. 
                // Creating a bulk insert with parameters is annoying in pg-node without a helper.
                // Let's just do individual inserts in parallel for this script or one by one. 
                // One by one is fine for 1700 records, takes a few seconds.
                return d;
            });

            // Use Promise.all for speed within batch
            await Promise.all(values.map(async (d) => {
                try {
                    // Double check overlap to be safe (race condition unlikely here)
                    await client.query(`
                        INSERT INTO profiles (name, type, description)
                        VALUES ($1, 'LOBBYIST', 'Major Donor (Backfilled)')
                        ON CONFLICT (name, type) DO NOTHING
                    `, [d.entity_name]);
                    donorCount++;
                } catch (e) {
                    console.error(`Failed to create donor ${d.entity_name}:`, e.message);
                }
            }));

            process.stdout.write(`\rProcessed ${Math.min(i + batchSize, donorList.length)} / ${donorList.length} donors...`);
        }
        console.log(`\nCreated ~${donorCount} new donor profiles.`);

    } catch (err) {
        console.error("Backfill Error:", err);
    } finally {
        client.release();
        pool.end();
    }
}

runBackfill();
