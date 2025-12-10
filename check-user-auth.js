/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
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

if (connectionString.includes('pooler.supabase.com') && connectionString.includes(':5432')) {
    console.log('Swapping to Transaction Mode (Port 6543) for Supabase Connection Pooler.');
    connectionString = connectionString.replace(':5432', ':6543');
}

if (!connectionString) {
    console.error("No DATABASE_URL found in .env.local");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
    try {
        console.log("Attempting to connect...");
        const client = await pool.connect();
        console.log('Successfully connected to database');

        console.log("Checking 'users' table...");
        try {
            const res = await client.query('SELECT id, email, name, password FROM users');
            console.log(`Found ${res.rows.length} users:`);
            res.rows.forEach(u => {
                console.log(` - ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, PasswordHashLength: ${u.password ? u.password.length : 'NULL'}`);
            });
        } catch (e) {
            console.error("Error querying users table:", e.message);
        }

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Database connection error details:');
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
