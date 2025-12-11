const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars manually
try {
    const envConfig = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, '');
        }
    });
} catch (e) {
    console.error('Could not read .env.local');
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    console.log('Connecting to database...');
    await client.connect();

    try {
        // 1. Get Public Tables
        const listTables = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`;
        const res = await client.query(listTables);
        const tables = res.rows.map(r => r.table_name);

        console.log('Found public tables:', tables);

        // 2. Create Schema
        await client.query('CREATE SCHEMA IF NOT EXISTS api');
        await client.query('GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role');

        // 3. Create Views
        for (const table of tables) {
            console.log(`Creating view api.${table} -> public.${table}`);

            // Using DROP CASCADE to handle any dependent objects if we are re-running
            await client.query(`DROP VIEW IF EXISTS api.${table} CASCADE`);
            await client.query(`CREATE OR REPLACE VIEW api.${table} WITH (security_invoker = true) AS SELECT * FROM public.${table}`);

            // 4. Grant Permissions
            // Important: For views to be auto-updatable, they must be simple select * from table.
            // We grant everything to everyone for now (security handled by RLS on underlying public tables)
            await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON api.${table} TO anon, authenticated, service_role`);
        }

        console.log('Success: API schema views created and permissions granted.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

run();
