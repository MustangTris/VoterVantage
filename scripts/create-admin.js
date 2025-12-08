const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 1. Load Environment Variables
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
            }
        });
    }
} catch (e) {
    console.warn("Could not read .env.local", e);
}

// 2. Setup DB Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 3. Main Function
async function createAdmin() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error("Usage: node scripts/create-admin.js <email> <password>");
        process.exit(1);
    }

    try {
        const client = await pool.connect();

        console.log(`Hashing password for ${email}...`);
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Upserting user into database...");

        // This query inserts a new user or updates the password if they exist, and sets role to ADMIN
        const query = `
            INSERT INTO users (email, password, role, name)
            VALUES ($1, $2, 'ADMIN', 'Admin User')
            ON CONFLICT (email) 
            DO UPDATE SET 
                password = $2,
                role = 'ADMIN'
            RETURNING id, email, role;
        `;

        const res = await client.query(query, [email, hashedPassword]);

        console.log("✅ Admin user created/updated successfully:");
        console.log(res.rows[0]);

        client.release();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating admin user:", err);
        process.exit(1);
    }
}

createAdmin();
