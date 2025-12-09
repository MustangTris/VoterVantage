import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace('?sslmode=require', '').replace('&sslmode=require', '')
    : '';

// Use a global variable to store the pool instance in development
// to avoid creating multiple connections during hot reloading.
let pool: Pool;

if (process.env.NODE_ENV === 'production') {
    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });
} else {
    // @ts-ignore
    if (!global.postgresPool) {
        // @ts-ignore
        global.postgresPool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
        });
    }
    // @ts-ignore
    pool = global.postgresPool;
}

export default pool;
