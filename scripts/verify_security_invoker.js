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
        const query = `
            SELECT 
                n.nspname AS schema_name,
                c.relname AS view_name,
                c.reloptions
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'api' 
              AND c.relkind = 'v';
        `;

        const res = await client.query(query);

        let allGood = true;
        console.log('\nVerifying views in "api" schema:');

        if (res.rows.length === 0) {
            console.warn('No views found in "api" schema!');
            allGood = false;
        }

        for (const row of res.rows) {
            const hasSecurityInvoker = row.reloptions && row.reloptions.includes('security_invoker=true');
            const status = hasSecurityInvoker ? 'PASS' : 'FAIL';
            if (!hasSecurityInvoker) allGood = false;

            console.log(`[${status}] ${row.schema_name}.${row.view_name}`);
            if (!hasSecurityInvoker) {
                console.log(`       Current options: ${row.reloptions ? row.reloptions.join(', ') : 'None'}`);
            }
        }

        if (allGood) {
            console.log('\nSUCCESS: All views have security_invoker=true.');
        } else {
            console.error('\nFAILURE: Some views are missing security_invoker=true.');
            process.exit(1);
        }

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
