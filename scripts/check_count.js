const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const value = values.join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key.trim()] = value;
            }
        });
    }
} catch (e) { }

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error("No Connection String found!");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Connecting...");
        const client = await pool.connect();

        const resProfiles = await client.query('SELECT count(*) FROM profiles');
        const resFilings = await client.query('SELECT count(*) FROM filings');
        const resTransactions = await client.query('SELECT count(*) FROM transactions');

        console.log(`\n>>> COUNTS <<<`);
        console.log(` Profiles:     ${resProfiles.rows[0].count}`);
        console.log(` Filings:      ${resFilings.rows[0].count}`);
        console.log(` Transactions: ${resTransactions.rows[0].count}`);
        console.log(`>>> END <<<\n`);

        client.release();
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

run();
