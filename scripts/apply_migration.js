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

async function runMigration() {
    try {
        console.log("Connecting to database...");
        const client = await pool.connect();
        console.log("Connected.");

        const migrationSql = fs.readFileSync(path.join(process.cwd(), 'migration_add_password_to_users.sql'), 'utf8');
        console.log("Running migration: migration_add_password_to_users.sql");

        await client.query(migrationSql);

        console.log("Migration applied successfully!");

        // Verification
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'password'
        `);

        if (res.rows.length > 0) {
            console.log("VERIFIED: 'password' column exists in 'users' table.");
        } else {
            console.error("VERIFICATION FAILED: 'password' column NOT found.");
        }

        client.release();
        process.exit(0);
    } catch (err) {
        console.error("Migration Failed:");
        console.error(err.message);
        if (err.code === '28P01') {
            console.error("\nERROR: Password authentication failed. Please check your DATABASE_URL in .env.local");
        } else if (err.code === '3D000') {
            console.error("\nERROR: Database does not exist. Check your DATABASE_URL.");
        }
        process.exit(1);
    }
}

runMigration();
