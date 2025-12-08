
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('?sslmode=require', '').replace('&sslmode=require', '') : '';

const pool = new Pool({
    connectionString,
    // Supabase requires SSL, even in dev. We use rejectUnauthorized: false to allow self-signed certs if needed or just standard SSL.
    ssl: { rejectUnauthorized: false },
});

export default pool;
