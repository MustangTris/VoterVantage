const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env vars manually
try {
    const envConfig = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, ''); // Simple cleanup
        }
    });
} catch (e) {
    console.error('Could not read .env.local');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspect() {
    console.log('--- Inspecting Schemas ---');
    // Query to list all schemas
    const { data: schemas, error: schemaError } = await supabase
        .rpc('get_schemas') // Assuming we might not have direct access, but let's try direct SQL first if possible?
    // Actually, service role can use the REST API to call RPC if we define one, OR just use the 'postgres' wrapper if we had pg connection.
    // Since we only have supabase-js, we are limited to what the API exposes... UNLESS we can run SQL.
    // Supabase-js doesn't run arbitrary SQL unless there's an RPC for it.

    // Let's try to infer from what we can see.
    // But... we can't see 'public' if it's not exposed!
    // Wait, Service Role Key BYPASSES RLS, but does it bypass Exposed Schemas?
    // Usually Service Role can access ANY schema.

    // Let's try to select from public.filings explicitly with the service role client.

    console.log('Attempting to fetch public.filings with Service Role...');
    const { data: publicData, error: publicError } = await supabase
        .from('filings')
        .select('*')
        .limit(1); // Default client uses 'public' by default if not configured otherwise.

    if (publicError) console.error('Public Error:', publicError);
    else console.log('Public Data:', publicData);

    console.log('\nAttempting to fetch api.filings with Service Role...');
    const apiSupabase = createClient(supabaseUrl, serviceRoleKey, { db: { schema: 'api' } });
    const { data: apiData, error: apiError } = await apiSupabase
        .from('filings')
        .select('*')
        .limit(1);

    if (apiError) console.error('API Error:', apiError);
    else console.log('API Data:', apiData);
}

inspect();
