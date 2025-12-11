const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkConstraints() {
    try {
        const res = await pool.query(`
            SELECT 
                con.conname as constraint_name,
                con.contype as constraint_type,
                att.attname as column_name,
                pg_get_constraintdef(con.oid) as definition
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_attribute att ON att.attrelid = con.conrelid 
                AND att.attnum = ANY(con.conkey)
            WHERE rel.relname = 'transactions'
            AND con.contype = 'u'
            ORDER BY con.conname;
        `);

        console.log('\n=== Unique Constraints on transactions table ===');
        console.table(res.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkConstraints();
