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

        console.log("Adding UNIQUE constraint to users(email)...");

        // NextAuth defaults don't always enforce unique email at DB level if using different strategies,
        // but for Credentials login it's essential.
        await client.query(`
            ALTER TABLE users 
            ADD CONSTRAINT users_email_unique UNIQUE (email);
        `);

        console.log("Successfully added unique constraint.");
        client.release();
        process.exit(0);
    } catch (err) {
        console.error("Migration warning/error details:", err.message);
        // If it already exists, that's fine, but the error code 42P10 suggests it didn't exist for the conflict target.
        process.exit(1);
    }
}

migrate();
