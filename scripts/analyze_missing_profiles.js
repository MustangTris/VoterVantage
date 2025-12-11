const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars
// ... (omitted generic env loading code for brevity if you want, but good to include)
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

async function analyzeMissingProfiles() {
    const client = await pool.connect();
    try {
        console.log("Analyzing Missing Data Points...\n");

        // 1. Missing Politicians (Filer Names in Filings vs Profiles)
        console.log("Checking Filings for missing Politician profiles...");
        const missingPoliticians = await client.query(`
            SELECT DISTINCT f.filer_name
            FROM filings f
            LEFT JOIN profiles p ON f.filer_name = p.name AND p.type = 'POLITICIAN'
            WHERE p.id IS NULL
        `);

        // Filter out likely Measures based on refined regex
        const potentialPoliticians = [];
        const measures = [];

        for (const row of missingPoliticians.rows) {
            const name = row.filer_name;
            const isMeasure = /^(Measure\s|Prop\s|Proposition\s|No\son\s|Yes\son\s)/i.test(name);
            if (isMeasure) {
                measures.push(name);
            } else {
                potentialPoliticians.push(name);
            }
        }

        console.log(`Found ${potentialPoliticians.length} Payers (Filers) without Politician Profiles (excluding ${measures.length} likely measures).`);
        if (potentialPoliticians.length > 0) {
            console.log("Examples:", potentialPoliticians.slice(0, 5).join(", "));
        }

        // 2. Missing Donors (Entity Names in Transactions vs Profiles)
        // Focus on Donors > $500
        console.log("\nChecking Transactions for missing Donor/Lobbyist profiles (Total Contributions > $1000)...");
        // Sum contributions per entity to avoid noise
        const missingDonors = await client.query(`
            SELECT t.entity_name, SUM(t.amount) as total_given
            FROM transactions t
            LEFT JOIN profiles p ON t.entity_name = p.name AND p.type = 'LOBBYIST'
            WHERE t.transaction_type = 'CONTRIBUTION' 
            AND p.id IS NULL
            GROUP BY t.entity_name
            HAVING SUM(t.amount) > 1000
            ORDER BY total_given DESC
        `);

        console.log(`Found ${missingDonors.rows.length} Major Donors (>$1k total) without Lobbyist Profiles.`);
        if (missingDonors.rows.length > 0) {
            console.log("Top missing donors:", missingDonors.rows.slice(0, 5).map(r => `${r.entity_name} ($${r.total_given})`).join(", "));
        }

        // 3. Missing Jurisdictions (City strings in profiles vs City profiles)
        console.log("\nChecking for missing City/County profiles...");
        const usedCitiesRes = await client.query(`
            SELECT DISTINCT city 
            FROM profiles 
            WHERE type = 'POLITICIAN' AND city IS NOT NULL
        `);

        const usedCities = usedCitiesRes.rows.map(r => r.city);
        const missingJurisdictions = [];

        for (const city of usedCities) {
            const res = await client.query("SELECT id FROM profiles WHERE name = $1 AND type IN ('CITY', 'COUNTY')", [city]);
            if (res.rows.length === 0) {
                missingJurisdictions.push(city);
            }
        }

        console.log(`Found ${missingJurisdictions.length} referenced jurisdictions without profiles.`);
        if (missingJurisdictions.length > 0) {
            console.log("Participating Jurisdictions missing pages:", missingJurisdictions.join(", "));
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

analyzeMissingProfiles();
