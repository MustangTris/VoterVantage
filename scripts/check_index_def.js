const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkIndex() {
    try {
        const res = await pool.query(`
            SELECT indexdef 
            FROM pg_indexes 
            WHERE tablename = 'transactions' 
            AND indexname = 'idx_transactions_unique_external_id'
        `);

        console.log('\n=== Index Definition ===');
        if (res.rows.length > 0) {
            console.log(res.rows[0].indexdef);
        } else {
            console.log('Index NOT FOUND');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkIndex();
