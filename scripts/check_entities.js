/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Load Env Vars
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        console.log('Loading .env.local...');
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const deli = line.indexOf('=');
            if (deli > 0) {
                const key = line.substring(0, deli).trim();
                const val = line.substring(deli + 1).trim().replace(/^["']|["']$/g, '');
                if (key && val) process.env[key] = val;
            }
        });
    }
} catch (e) { console.warn("Could not read .env.local", e); }

const originalConnectionString = process.env.DATABASE_URL || '';

// 2. Apply DB Connection Logic from src/lib/db.ts
let connectionString = originalConnectionString.replace('?sslmode=require', '').replace('&sslmode=require', '');

if (originalConnectionString.includes('pooler.supabase.com') && connectionString.includes(':5432')) {
    console.log('Swapping to Transaction Mode (Port 6543)...');
    connectionString = connectionString.replace(':5432', ':6543');
}

if (!connectionString) {
    console.error("No DATABASE_URL found.");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected!');

        // 3. Verify Tables Needed for Logic
        const tablesRes = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('profiles', 'transactions', 'filings')
        `);
        console.log('Tables present:', tablesRes.rows.map(r => r.table_name).join(', '));

        // 4. Verify Columns in Profiles (check for 'city' and 'type')
        // We can just select 1 row
        const profilesRes = await client.query("SELECT * FROM profiles LIMIT 1");
        if (profilesRes.rows.length > 0) {
            console.log('Profiles table has columns:', Object.keys(profilesRes.rows[0]).join(', '));
        } else {
            console.log('Profiles table exists but is empty.');
        }

        // 5. Test "Get City Stats" Logic (Simplified)
        // Just run the SUM query to catch SQL errors
        const testCity = 'Palm Springs';
        console.log(`Testing stats query for ${testCity}...`);

        await client.query(`
            SELECT COALESCE(SUM(t.amount), 0) as total
            FROM transactions t
            JOIN filings f ON t.filing_id = f.id
            JOIN profiles p ON f.filer_name = p.name
            WHERE p.city = $1
            AND t.transaction_type = 'CONTRIBUTION'
        `, [testCity]);

        console.log('Stats query syntax valid.');

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
}

verify();
