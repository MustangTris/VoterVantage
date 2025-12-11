
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

async function linkRamos() {
    console.log("Linking 'Friends of Lupe Ramos Amith...' to 'Indio'...");

    // 1. Find Politician Profile
    const { data: politicians, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', '%Lupe Ramos Amith%')
        .eq('type', 'POLITICIAN');

    if (pError) {
        console.error("Error finding politician:", pError);
        return;
    }

    if (!politicians || politicians.length === 0) {
        console.error("No politician profile found for Lupe Ramos Amith.");
        return;
    }

    const politician = politicians[0];
    console.log(`Found Politician: ${politician.name} (ID: ${politician.id})`);

    // 2. Update City to 'Indio'
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ city: 'Indio' })
        .eq('id', politician.id);

    if (updateError) {
        console.error("Update failed:", updateError);
    } else {
        console.log("Successfully linked to Indio.");
    }
}

linkRamos();
