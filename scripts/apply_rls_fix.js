const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const value = values.join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key.trim()] = value;
            }
        });
    }
} catch (e) { }

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Applying RLS fixes...");
        const client = await pool.connect();

        const tables = ['profiles', 'filings', 'transactions'];

        for (const table of tables) {
            console.log(`Processing ${table}...`);

            // 1. Enable RLS (Good practice)
            await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);

            // 2. Create Policy (Drop if exists first)
            await client.query(`DROP POLICY IF EXISTS "Public read access" ON ${table}`);
            await client.query(`
                CREATE POLICY "Public read access" 
                ON ${table} FOR SELECT 
                TO public 
                USING (true)
            `);
            console.log(` - Policy created: Public read access on ${table}`);
        }

        console.log("Success: RLS policies applied.");
        client.release();
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

run();
