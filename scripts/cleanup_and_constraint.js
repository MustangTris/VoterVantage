const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function checkDuplicates() {
    const client = await pool.connect();
    try {
        console.log("Checking for duplicate profiles...");
        const res = await client.query(`
            SELECT name, type, COUNT(*) 
            FROM profiles 
            GROUP BY name, type 
            HAVING COUNT(*) > 1
        `);

        if (res.rows.length > 0) {
            console.log(`Found ${res.rows.length} sets of duplicates.`);
            res.rows.forEach(r => console.log(` - ${r.name} (${r.type}): ${r.count} copies`));

            // Auto cleanup?
            console.log("Cleaning up duplicates (keeping oldest)...");
            for (const row of res.rows) {
                // Find IDs
                const idsRes = await client.query(`
                    SELECT id FROM profiles 
                    WHERE name = $1 AND type = $2 
                    ORDER BY created_at ASC
                `, [row.name, row.type]);

                const ids = idsRes.rows.map(r => r.id);
                const keepId = ids[0];
                const removeIds = ids.slice(1);

                console.log(`Keeping ${keepId}, removing ${removeIds.join(', ')}`);

                // Relink foreign keys before deleting?
                // transactions.entity_profile_id might point to the ones we are deleting.
                // We should update transactions to point to keepId.

                await client.query(`
                    UPDATE transactions 
                    SET entity_profile_id = $1 
                    WHERE entity_profile_id = ANY($2::uuid[])
                `, [keepId, removeIds]);

                await client.query(`
                    DELETE FROM profiles 
                    WHERE id = ANY($1::uuid[])
                `, [removeIds]);
            }
            console.log("Duplicates cleaned up.");
        } else {
            console.log("No duplicates found. Safe to add constraint.");
        }

        // Add constraint
        console.log("Adding UNIQUE constraint on (name, type)...");
        await client.query(`
            ALTER TABLE profiles 
            ADD CONSTRAINT profiles_name_type_key UNIQUE (name, type);
        `);
        console.log("Constraint added successfully.");

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

checkDuplicates();
