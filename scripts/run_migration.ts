
import pool from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.join(process.cwd(), 'migration_add_county_type.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running migration...');
        const client = await pool.connect();
        try {
            await client.query(sql);
            console.log('Migration successful!');
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        // Force exit to close pool
        process.exit(0);
    }
}

runMigration();
