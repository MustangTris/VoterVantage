
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

async function cleanupCities() {
    console.log("Cleaning up City profiles (keeping only 'Indio')...");

    // 1. Get all profiles of type CITY
    const { data: cities, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('type', 'CITY')

    if (error) {
        console.error("Error fetching cities:", error);
        return;
    }

    const toDelete = cities.filter(c => c.name.toLowerCase().trim() !== 'indio');
    const ids = toDelete.map(c => c.id);

    if (ids.length > 0) {
        console.log(`Found ${ids.length} cities to delete (keeping Indio).`);
        toDelete.forEach(c => console.log(` - Deleting: ${c.name}`));

        const { error: delError } = await supabase
            .from('profiles')
            .delete()
            .in('id', ids);

        if (delError) {
            console.error("Delete failed:", delError);
        } else {
            console.log("Successfully deleted extraneous cities.");
        }
    } else {
        console.log("No cities found to delete (only Indio exists or table empty).");
    }
}

cleanupCities();
