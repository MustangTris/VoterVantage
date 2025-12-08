const { Pool } = require('pg');

const connectionString = "postgresql://postgres:password@localhost:5432/votervantage";

const pool = new Pool({
    connectionString,
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to database');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Database connection error details:');
        console.error(err);
        if (err.code) console.error('Error Code:', err.code);
        process.exit(1);
    }
}

testConnection();
