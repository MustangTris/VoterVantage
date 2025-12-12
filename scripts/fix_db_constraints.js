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

async function fixConstraints() {
    try {
        console.log("Connecting to database...");
        const client = await pool.connect();

        console.log("Applying Unique Index on profiles(name, type)...");
        // Use IF NOT EXISTS to be safe
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_name_type 
            ON profiles (name, type);
        `);

        console.log("Success! Index created.");

        client.release();
    } catch (err) {
        console.error("Fix Failed:", err);
    } finally {
        pool.end();
    }
}

fixConstraints();
