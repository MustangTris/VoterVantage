import { Pool, PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';

const originalConnectionString = process.env.DATABASE_URL || '';

// Fix: Automatically switch to Transaction Mode (port 6543) if using Supabase Pooler in Session Mode (port 5432)
// This prevents 'MaxClientsInSessionMode' errors during builds/serverless usage.
let connectionString = originalConnectionString
    .replace('?sslmode=require', '')
    .replace('&sslmode=require', '');

if (originalConnectionString.includes('pooler.supabase.com') && connectionString.includes(':5432')) {
    console.log('Swapping to Transaction Mode (Port 6543) for Supabase Connection Pooler to avoid connection limits.');
    connectionString = connectionString.replace(':5432', ':6543');
}

// Prepare SSL Configuration
// Prepare SSL Configuration
let sslConfig: PoolConfig['ssl'] = { rejectUnauthorized: false };

try {
    // Only attempt to load cert if we are NOT in production or if we specifically want to enforce it.
    // On Vercel, the file system structure is different, and usually rejectUnauthorized: false is enough for Supabase transaction pooler.
    const certPath = path.join(process.cwd(), 'src', 'certs', 'prod-ca-2021.crt');
    if (fs.existsSync(certPath)) {
        sslConfig = {
            rejectUnauthorized: true,
            ca: fs.readFileSync(certPath).toString(),
        };
        console.log('Using SSL Certificate for Database Connection');
    } else {
        console.log('SSL Certificate not found, using default SSL settings (rejectUnauthorized: false).');
    }
} catch (err) {
    console.warn('Could not load SSL Certificate, falling back to insecure connection:', err);
}

// Use a global variable to store the pool instance in development
// to avoid creating multiple connections during hot reloading.
let pool: Pool;

if (process.env.NODE_ENV === 'production') {
    pool = new Pool({
        connectionString,
        ssl: sslConfig,
        max: 1, // Limit pool size to prevent hitting connection limits, especially during build with multiple workers
    });
} else {
    // @ts-ignore
    if (!global.postgresPool) {
        // @ts-ignore
        global.postgresPool = new Pool({
            connectionString,
            ssl: sslConfig,
            max: 1, // Limit pool size
        });
    }
    // @ts-ignore
    pool = global.postgresPool;
}

export default pool;
