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

async function backfill() {
    console.log("Starting Backfill for Missing Jurisdictions...");

    // 1. Get all Politicians with a 'city' (Jurisdiction) set
    const { data: politicians, error } = await supabase
        .from('profiles')
        .select('name, city')
        .eq('type', 'POLITICIAN')
        .not('city', 'is', null);

    if (error) {
        console.error("Error fetching politicians:", error);
        return;
    }

    console.log(`Found ${politicians.length} politicians to check.`);

    // 2. Identify unique jurisdictions from them
    const jurisdictionMap = new Set();
    politicians.forEach(p => {
        if (p.city && p.city.trim().length > 0) {
            jurisdictionMap.add(p.city.trim());
        }
    });

    const jurisdictions = Array.from(jurisdictionMap);
    console.log(`Found ${jurisdictions.length} unique jurisdictions:`, jurisdictions);

    // 3. Ensure a profile exists for each jurisdiction
    for (const jName of jurisdictions) {
        // Determine type: containing "County" -> COUNTY, otherwise CITY
        const type = jName.toLowerCase().includes('county') ? 'COUNTY' : 'CITY';

        console.log(`Checking/Creating Profile for: ${jName} (${type})...`);

        const { data, error: upsertError } = await supabase.from('profiles').upsert(
            {
                name: jName,
                type: type,
                description: `Backfilled jurisdiction.`
            },
            {
                onConflict: 'name,type',
                ignoreDuplicates: true // Only create if missing
            }
        ).select();

        if (upsertError) {
            console.error(` - Failed: ${upsertError.message}`);
        } else {
            console.log(` - Success (ID: ${data && data[0] ? data[0].id : 'Existing'})`);
        }
    }

    console.log("Backfill complete.");
}

backfill();
