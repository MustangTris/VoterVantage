
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'api' }
});

async function debugStats() {
    console.log("Debugging City Stats for 'Indio'...");

    // 1. Check Profiles in Indio
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, name, city')
        .eq('city', 'Indio');

    if (pError) console.error("Profile Error:", pError);
    console.log(`Profiles in Indio: ${profiles?.length || 0}`);
    profiles?.forEach(p => console.log(` - [${p.name}]`));

    if (!profiles || profiles.length === 0) return;

    // 2. Check Filings for these profiles
    const names = profiles.map(p => p.name);
    const { data: filings, error: fError } = await supabase
        .from('filings')
        .select('id, filer_name, total_contributions')
        .in('filer_name', names);

    console.log(`\nFilings matching these profiles: ${filings?.length || 0}`);
    filings?.forEach(f => console.log(` - Filer: [${f.filer_name}] | Total: ${f.total_contributions}`));

    // 3. Run the JOIN query simulation
    let total = 0;
    filings?.forEach(f => total += f.total_contributions || 0);
    console.log(`\nCalculated Total: ${total}`);
}

debugStats();
