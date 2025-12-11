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

async function clearDb() {
    try {
        console.log("Connecting to database...");
        const client = await pool.connect();

        console.log("Clearing mock data...");
        // Order matters due to foreign keys
        await client.query("TRUNCATE TABLE transactions CASCADE;");
        await client.query("TRUNCATE TABLE filings CASCADE;");
        // We preserve 'users' so people can still log in, assuming mock data was mostly in profiles/transactions
        await client.query("TRUNCATE TABLE profiles CASCADE;");

        console.log("Database cleared (Users preserved).");

        client.release();
        process.exit(0);
    } catch (err) {
        console.error("Clear Failed:", err);
        process.exit(1);
    }
}

clearDb();
