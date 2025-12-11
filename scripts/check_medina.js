const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const delimiterIndex = line.indexOf('=');
            if (delimiterIndex !== -1) {
                const key = line.substring(0, delimiterIndex).trim();
                const value = line.substring(delimiterIndex + 1).trim().replace(/^["']|["']$/g, '');
                if (key && value) process.env[key] = value;
            }
        });
    }
} catch (e) { }

const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace('?sslmode=require', ''),
    ssl: { rejectUnauthorized: false }
});

async function checkMedina() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM profiles WHERE name ILIKE '%Jose Medina%'");
        console.log("Jose Medina Profile:", res.rows);
    } finally {
        client.release();
        pool.end();
    }
}

checkMedina();
