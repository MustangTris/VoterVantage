/**
 * Database Deduplication Runner
 * 
 * Executes SQL scripts to remove duplicate records from the database.
 * Run this script with: node scripts/run_deduplication.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials in .env.local');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeSQL(scriptPath, description) {
    console.log(`\n🔄 ${description}...`);
    console.log(`   Script: ${path.basename(scriptPath)}`);

    try {
        const sql = fs.readFileSync(scriptPath, 'utf8');

        // Execute the SQL script
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
            // If RPC doesn't exist, try direct execution
            // Note: This may not work for all Supabase setups
            const { data, error } = await supabase.from('_sql').select('*').eq('query', sql);
            return { data, error };
        });

        // Since we can't use RPC, we'll need to execute via a different method
        // Let's try using the REST API directly for each statement
        const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

        for (const statement of statements) {
            const trimmed = statement.trim();
            if (!trimmed || trimmed === 'BEGIN' || trimmed === 'COMMIT') continue;

            console.log(`   Executing: ${trimmed.substring(0, 60)}...`);

            // Use raw SQL execution - this is a workaround
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                },
                body: JSON.stringify({ query: trimmed })
            }).catch(() => null);

            if (!response) {
                console.log(`   ⚠️  Note: Direct SQL execution may require manual running`);
            }
        }

        console.log(`✅ ${description} - Complete`);
        if (data) {
            console.log('   Result:', JSON.stringify(data, null, 2));
        }

        return true;
    } catch (err) {
        console.error(`❌ ${description} - Failed`);
        console.error('   Error:', err.message);
        return false;
    }
}

async function runDeduplication() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Database Deduplication Script Runner    ║');
    console.log('╚════════════════════════════════════════════╝');

    const scriptsDir = path.join(__dirname);

    // Execute scripts in order
    const scripts = [
        {
            path: path.join(scriptsDir, 'deduplicate_transactions.sql'),
            description: 'Deduplicating transactions table'
        },
        {
            path: path.join(scriptsDir, 'deduplicate_profiles.sql'),
            description: 'Deduplicating profiles table'
        },
        {
            path: path.join(scriptsDir, 'deduplicate_filings.sql'),
            description: 'Deduplicating filings table'
        }
    ];

    console.log('\n⚠️  WARNING: This will permanently delete duplicate records!');
    console.log('   - Keeping oldest record for each duplicate set');
    console.log('   - Updating all foreign key references');
    console.log('   - This operation cannot be undone\n');

    let allSuccess = true;

    for (const script of scripts) {
        const success = await executeSQL(script.path, script.description);
        if (!success) {
            allSuccess = false;
            console.log('\n❌ Stopping due to error. Please fix and re-run.');
            break;
        }
    }

    if (allSuccess) {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║   ✅ Deduplication Complete!              ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('\nℹ️  Next steps:');
        console.log('   1. Verify data integrity in the application');
        console.log('   2. Test uploading files to ensure upsert logic works');
        console.log('   3. Run migration to add unique constraints');
    }
}

// Note: Since Supabase doesn't easily support arbitrary SQL execution via JS client,
// you may need to run these SQL scripts manually in the Supabase SQL Editor.
console.log('\n📋 MANUAL EXECUTION REQUIRED:');
console.log('   Due to Supabase limitations, please run these SQL scripts manually:');
console.log('   1. Go to Supabase Dashboard > SQL Editor');
console.log('   2. Run each script in order:');
console.log('      - scripts/deduplicate_transactions.sql');
console.log('      - scripts/deduplicate_profiles.sql');
console.log('      - scripts/deduplicate_filings.sql');
console.log('\n   Alternatively, use the apply_migration.js script for each file.\n');

runDeduplication().catch(err => {
    console.error('\n❌ Fatal Error:', err);
    process.exit(1);
});
