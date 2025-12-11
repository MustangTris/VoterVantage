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

async function initDb() {
    try {
        console.log("Connecting to database for initialization...");
        const client = await pool.connect();
        console.log("Connected.");

        // 1. Run schema.sql
        const schemaPath = path.join(process.cwd(), 'schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing schema.sql...");
        await client.query(schemaSql);
        console.log("Schema applied successfully.");

        // 2. Run migration_add_password_to_users.sql
        const migrationPath = path.join(process.cwd(), 'migration_add_password_to_users.sql');
        if (fs.existsSync(migrationPath)) {
            console.log(`Reading migration from ${migrationPath}...`);
            const migrationSql = fs.readFileSync(migrationPath, 'utf8');
            console.log("Executing migration...");
            await client.query(migrationSql);
            console.log("Password migration applied successfully.");
        } else {
            console.warn("Migration file not found, skipping.");
        }

        // 3. Verification
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables present:', tables.rows.map(r => r.table_name).join(', '));

        const usersCols = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        const hasPassword = usersCols.rows.some(c => c.column_name === 'password');
        console.log(`Users table has 'password' column: ${hasPassword}`);

        client.release();
        process.exit(0);
    } catch (err) {
        console.error("Initialization Failed:", err);
        process.exit(1);
    }
}

initDb();
