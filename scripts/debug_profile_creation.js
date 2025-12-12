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
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'public' }
});

async function debugProfile() {
    console.log("Attempting to UPSERT profile 'Nunez test'...");

    const { data, error } = await supabase.from('profiles').upsert(
        {
            name: 'Nunez Test Profile',
            type: 'POLITICIAN',
            description: 'Debug profile.',
            city: 'Indio'
        },
        {
            onConflict: 'name,type',
            ignoreDuplicates: false
        }
    ).select();

    if (error) {
        console.error("UPSERT FAILED:", error);
    } else {
        console.log("UPSERT SUCCESS:", data);
    }
}

debugProfile();
