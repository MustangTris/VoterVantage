const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const delimiterIndex = line.indexOf('=');
            if (delimiterIndex !== -1) {
                const key = line.substring(0, delimiterIndex).trim();
                const value = line.substring(delimiterIndex + 1).trim().replace(/^["']|["']$/g, '');
                if (key && value) {
                    process.env[key] = value;
                }
            }
        });
    }
} catch (e) {
    console.warn("Could not read .env.local", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createBucket() {
    console.log("Creating 'filings' bucket...");

    const { data, error } = await supabase
        .storage
        .createBucket('filings', {
            public: false, // Private bucket (only accessible via signed URLs or Service Role)
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv', 'application/pdf']
        });

    if (error) {
        if (error.message.includes("already exists")) {
            console.log("Bucket 'filings' already exists.");
        } else {
            console.error("Failed to create bucket:", error);
            process.exit(1);
        }
    } else {
        console.log("Bucket 'filings' created successfully:", data);
    }

    process.exit(0);
}

createBucket();
