
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            // Simple parser: skip comments, empty lines
            if (!line || line.startsWith('#')) return;
            const idx = line.indexOf('=');
            if (idx === -1) return;
            const key = line.substring(0, idx).trim();
            let value = line.substring(idx + 1).trim();
            // Remove surrounding quotes
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        });
        console.log('.env.local loaded');
    }
} catch (e) {
    console.error('Error loading .env.local:', e);
}

// Bypass SSL validation for this script
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set');
    process.exit(1);
} else {
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 15) + '...');
}


const tables = [
    'filings',
    'profiles',
    'volunteers',
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
    'transactions'
];

const publicTables = [
    'filings',
    'profiles',
    'transactions'
];

async function enableRLS() {
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();

    try {
        console.log('Starting RLS Security Update...');

        for (const table of tables) {
            console.log(`Enabling RLS on table: ${table}`);
            await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
        }

        for (const table of publicTables) {
            console.log(`Creating public read policy for: ${table}`);
            // Check if policy exists to avoid error
            const checkPolicy = await client.query(`
                SELECT * FROM pg_policies 
                WHERE tablename = $1 AND policyname = 'Enable read access for all users'
            `, [table]);

            if (checkPolicy.rowCount === 0) {
                await client.query(`
                    CREATE POLICY "Enable read access for all users" 
                    ON public.${table} 
                    FOR SELECT 
                    USING (true);
                `);
                console.log(`Policy created for ${table}`);
            } else {
                console.log(`Policy already exists for ${table}, skipping.`);
            }
        }

        console.log('RLS applied successfully to all tables.');

    } catch (err) {
        console.error('Error applying RLS:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

enableRLS();
