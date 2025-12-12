const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

async function checkDates() {
    try {
        const res = await pool.query(`
      SELECT 
        MIN(transaction_date) as min_date, 
        MAX(transaction_date) as max_date, 
        COUNT(*) as total 
      FROM transactions
    `);
        console.log("Date Range:", res.rows[0]);

        // Also check distribution by year
        const yearRes = await pool.query(`
        SELECT 
            EXTRACT(YEAR FROM transaction_date) as year,
            COUNT(*) as count,
            SUM(amount) as total_amount
        FROM transactions
        GROUP BY 1
        ORDER BY 1
    `);
        console.log("By Year:", yearRes.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkDates();
