const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkIndexes() {
    try {
        // Check all indexes on transactions table
        const res = await pool.query(`
            SELECT
                i.relname as index_name,
                a.attname as column_name,
                ix.indisunique as is_unique,
                ix.indisprimary as is_primary,
                pg_get_indexdef(ix.indexrelid) as index_definition
            FROM pg_class t
            JOIN pg_index ix ON t.oid = ix.indrelid
            JOIN pg_class i ON i.oid = ix.indexrelid
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
            WHERE t.relname = 'transactions'
            AND i.relname LIKE '%external%'
            ORDER BY i.relname, a.attnum;
        `);

        console.log('\n=== Indexes on transactions table (external_id) ===');
        console.table(res.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkIndexes();
