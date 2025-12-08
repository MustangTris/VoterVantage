
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase requires SSL, even in dev. We use rejectUnauthorized: false to allow self-signed certs if needed or just standard SSL.
    ssl: { rejectUnauthorized: false },
});

export default pool;
