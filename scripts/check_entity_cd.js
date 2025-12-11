const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkEntityCodes() {
    try {
        // Check distinct entity_cd values
        const res = await pool.query(`
            SELECT 
                entity_cd, 
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM transactions 
            WHERE transaction_type = 'CONTRIBUTION'
            GROUP BY entity_cd 
            ORDER BY count DESC 
            LIMIT 20
        `);

        console.log('\n=== Entity Code Distribution ===');
        console.table(res.rows);

        // Check for NULL or empty entity_cd
        const nullCheck = await pool.query(`
            SELECT 
                COUNT(*) as total_contributions,
                SUM(CASE WHEN entity_cd IS NULL THEN 1 ELSE 0 END) as null_entity_cd,
                SUM(CASE WHEN entity_cd = '' THEN 1 ELSE 0 END) as empty_entity_cd
            FROM transactions 
            WHERE transaction_type = 'CONTRIBUTION'
        `);

        console.log('\n=== NULL/Empty Check ===');
        console.table(nullCheck.rows);

        // Sample some actual records
        const samples = await pool.query(`
            SELECT entity_name, entity_cd, amount 
            FROM transactions 
            WHERE transaction_type = 'CONTRIBUTION'
            LIMIT 10
        `);

        console.log('\n=== Sample Records ===');
        console.table(samples.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkEntityCodes();
