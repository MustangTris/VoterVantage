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
    console.error("No DATABASE_URL found");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function inspect() {
    try {
        console.log("Connecting...");
        const client = await pool.connect();

        console.log("\n--- FILING INFO ---");
        const filings = await client.query('SELECT id, filer_name, status FROM filings');
        if (filings.rows.length > 0) {
            console.log("Filer Name:", filings.rows[0].filer_name);
            console.log("Status:", filings.rows[0].status);
        } else {
            console.log("No filings found.");
        }

        console.log("\n--- PROFILE COUNT ---");
        const profsCount = await client.query('SELECT count(*) FROM profiles');
        console.log("Count:", profsCount.rows[0].count);

        console.log("\n--- PROFILES (Type distribution) ---");
        const profTypes = await client.query('SELECT type, count(*) FROM profiles GROUP BY type');
        profTypes.rows.forEach(r => console.log(`${r.type}: ${r.count}`));

        console.log("\n--- RECENT PROFILES (Last 10) ---");
        const recentProfs = await client.query('SELECT name, type, city, created_at FROM profiles ORDER BY created_at DESC LIMIT 10');
        recentProfs.rows.forEach(r => console.log(`[${r.type}] ${r.name} (City: ${r.city})`));

        client.release();
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

inspect();
