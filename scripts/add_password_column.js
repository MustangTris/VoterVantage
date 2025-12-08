const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
            }
        });
    }
} catch (e) {
    console.warn("Could not read .env.local", e);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        const client = await pool.connect();

        console.log("Adding password column to users table...");

        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password TEXT;
        `);

        console.log("Successfully added password column.");
        client.release();
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
