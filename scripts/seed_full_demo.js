const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const delimiterIndex = line.indexOf('=');
            if (delimiterIndex !== -1) {
                const key = line.substring(0, delimiterIndex).trim();
                const value = line.substring(delimiterIndex + 1).trim().replace(/^["']|["']$/g, '');
                if (key && value) {
                    process.env[key] = value;
                }
            }
        });
    }
} catch (e) {
    console.warn("Could not read .env.local", e);
}

const connectionString = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace('?sslmode=require', '').replace('&sslmode=require', '')
    : '';

if (!connectionString) {
    console.error("No DATABASE_URL found in .env.local");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    const client = await pool.connect();
    try {
        console.log("Seeding sample data...");

        // 1. Create Profiles
        const profiles = [
            { name: "Mayor Sarah Jenkins", type: "POLITICIAN", city: "Palm Springs", desc: "Long serving mayor focused on sustainability." },
            { name: "Councilman Bob Smith", type: "POLITICIAN", city: "Indio", desc: "Local business owner and council member." },
            { name: "BuildIt Corp", type: "LOBBYIST", city: "Rancho Mirage", desc: "Real estate development firm." },
            { name: "Green Energy Sol", type: "LOBBYIST", city: "Palm Desert", desc: "Renewable energy advocates." },
            { name: "Palm Springs", type: "CITY", city: "Palm Springs", desc: "City of Palm Springs" },
            { name: "Indio", type: "CITY", city: "Indio", desc: "City of Indio" },
        ];

        for (const p of profiles) {
            // Try Insert
            try {
                await client.query(`
                    INSERT INTO profiles (name, type, city, description)
                    VALUES ($1, $2, $3, $4)
                `, [p.name, p.type, p.city, p.desc]);
                console.log(`Inserted: ${p.name}`);
            } catch (err) {
                // Ignore unique constraint violations (already exists)
                if (err.code === '23505') {
                    console.log(`Skipped (Already Exists): ${p.name}`);
                } else {
                    throw err;
                }
            }
        }

        // Re-fetch all profiles to build the map correctly (whether inserted or existing)
        const res = await client.query("SELECT id, name FROM profiles");
        const profileMap = {};
        res.rows.forEach(r => {
            profileMap[r.name] = r.id;
            console.log(`Profile: ${r.name} => ${r.id}`);
        });

        // 2. Create Filings
        // Filing for Palm Springs Mayor
        const filingRes = await client.query(`
            INSERT INTO filings (filer_name, filing_date, total_contributions, total_expenditures, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, ['Mayor Sarah Jenkins', new Date(), 50000.00, 15000.00, 'PROCESSED']);
        const filingId = filingRes.rows[0].id;
        console.log("Inserted filing (Palm Springs):", filingId);

        // Filing for Indio Councilman
        const filingIndioRes = await client.query(`
             INSERT INTO filings (filer_name, filing_date, total_contributions, total_expenditures, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id
        `, ['Councilman Bob Smith', new Date(), 25000.00, 5000.00, 'PROCESSED']);
        const filingIndioId = filingIndioRes.rows[0].id;
        console.log("Inserted filing (Indio):", filingIndioId);

        // 3. Create Transactions
        const transactions = [
            // Palm Springs
            { type: 'CONTRIBUTION', amount: 5000, entity: 'BuildIt Corp', date: '2024-01-15', filing_id: filingId, cd: 'COM' },
            { type: 'CONTRIBUTION', amount: 2500, entity: 'Green Energy Sol', date: '2024-02-10', filing_id: filingId, cd: 'OTH' },
            { type: 'EXPENDITURE', amount: 5000, entity: 'Print Shop Local', date: '2024-03-01', filing_id: filingId },

            // Indio
            { type: 'CONTRIBUTION', amount: 10000, entity: 'BuildIt Corp', date: '2024-01-20', filing_id: filingIndioId, cd: 'COM' },
            { type: 'CONTRIBUTION', amount: 500, entity: 'John Doe', date: '2024-02-15', filing_id: filingIndioId, cd: 'IND' },
            { type: 'EXPENDITURE', amount: 2000, entity: 'Indio Events Center', date: '2024-03-10', filing_id: filingIndioId }
        ];

        for (const t of transactions) {
            await client.query(`
                INSERT INTO transactions (
                    filing_id, transaction_type, amount, entity_name, 
                    entity_profile_id, transaction_date, description, entity_cd
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                t.filing_id, t.type, t.amount, t.entity,
                profileMap[t.entity] || null, // Link if exists
                t.date, 'Seeded transaction', t.cd || 'OTH'
            ]);
        }
        console.log(`Inserted ${transactions.length} transactions.`);

        console.log("Seeding complete!");

    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

seed();
