const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkConstraints() {
    try {
        const res = await pool.query(`
            SELECT 
                conname, 
                pg_get_constraintdef(oid) as definition
            FROM pg_constraint 
            WHERE conrelid = 'transactions'::regclass 
            AND contype = 'u'
        `);

        console.log('\n=== Unique Constraints on transactions ===');
        if (res.rows.length > 0) {
            res.rows.forEach(r => {
                console.log(`\nConstraint: ${r.conname}`);
                console.log(`Definition: ${r.definition}`);
            });
        } else {
            console.log('No unique constraints found (only unique indexes exist)');
        }

        // Also check unique indexes
        const idxRes = await pool.query(`
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes 
            WHERE tablename = 'transactions' 
            AND indexdef LIKE '%UNIQUE%'
        `);

        console.log('\n=== Unique Indexes on transactions ===');
        idxRes.rows.forEach(r => {
            console.log(`\nIndex: ${r.indexname}`);
            console.log(`Definition: ${r.indexdef}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkConstraints();
