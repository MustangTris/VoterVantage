const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const index = line.indexOf('=');
            if (index !== -1) {
                const key = line.substring(0, index).trim();
                const val = line.substring(index + 1).trim().replace(/^["']|["']$/g, '');
                if (key && val) process.env[key] = val;
            }
        });
    }
} catch (e) { }

let connectionString = process.env.DATABASE_URL;
console.log("Connection String found:", !!connectionString);

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // 5s timeout
});

async function run() {
    try {
        console.log("Connecting...");
        const client = await pool.connect();
        console.log("Connected. Disabling RLS on users...");
        await client.query('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
        console.log("Success: RLS disabled on users table.");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

run();
