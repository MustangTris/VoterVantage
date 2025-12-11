
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

async function checkDuplicates() {
    const { data: filings, error } = await supabase
        .from('filings')
        .select('id, filer_name, source_file_url, created_at, status')
        .ilike('filer_name', '%Ramos%')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching filings:', error);
        return;
    }

    console.log('Recent Filings for Ramos:');
    filings.forEach(f => {
        console.log(`- ID: ${f.id}`);
        console.log(`  Filer: ${f.filer_name}`);
        console.log(`  File: ${f.source_file_url}`);
        console.log(`  Created: ${f.created_at}`);
        console.log(`  Status: ${f.status}`);
        console.log('---');
    });
}

checkDuplicates();
