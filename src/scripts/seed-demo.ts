
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.warn("Could not read .env.local", e);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function main() {
    console.log("Seeding database...");
    const client = await pool.connect();
    try {
        // Upsert Mayor Johnson
        // Upsert Mayor Johnson
        await client.query(`
            INSERT INTO profiles (name, type, description, image_url)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (filer_id) DO UPDATE 
            SET description = $3
            RETURNING id;
        `, [
            'Mayor Johnson',
            'POLITICIAN',
            'Mayor of Palm Springs • Incumbent • Term 2024-2028',
            '/mayor.jpg' // Placeholder
        ]);

        // Note: filer_id is unique but I didn't provide it above. 
        // schema.sql says filer_id TEXT UNIQUE.
        // If I want to allow duplicates for names without filer_ids, I should be careful.
        // Let's just insert and ignore conflicts or clear table for demo.
        // Actually, let's just insert.

    } catch (e) {
        // If unique constraint fails (e.g. if I ran this before), just ignore or log
        console.log("Error (might already exist):", (e as Error).message);

        // Let's try to fetch him to get ID
    }

    // Let's ensure we have him.
    const check = await client.query("SELECT * FROM profiles WHERE name = 'Mayor Johnson'");
    if (check.rows.length === 0) {
        // Insert without ON CONFLICT if the query above failed due to syntax or something
        await client.query(`
            INSERT INTO profiles (name, type, description)
            VALUES ($1, $2, $3)
        `, [
            'Mayor Johnson',
            'POLITICIAN',
            'Mayor of Palm Springs • Incumbent • Term 2024-2028'
        ]);
        console.log("Inserted Mayor Johnson");
    } else {
        console.log("Mayor Johnson already exists with ID:", check.rows[0].id);
    }

    client.release();
}

main().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
