const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars manually
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

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("No DATABASE_URL found in .env.local");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // Assuming Supabase, enforcing SSL
});

async function testConnection() {
    try {
        console.log("Attempting to connect...");
        const client = await pool.connect();
        console.log('Successfully connected to database');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);

        // Also check if tables exist
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables found:', tables.rows.map(r => r.table_name).join(', '));

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Database connection error details:');
        console.error(err);
        if (err.code) console.error('Error Code:', err.code);
        process.exit(1);
    }
}

testConnection();
