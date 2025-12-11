
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

async function refinalize() {
    console.log("Checking for filings with NULL totals...");

    // 1. Get findings with null totals
    const { data: filings, error } = await supabase
        .from('filings')
        .select('id, filer_name')
        .is('total_contributions', null);

    if (error) {
        console.error("Error fetching filings:", error);
        return;
    }

    console.log(`Found ${filings.length} filings to update.`);

    for (const f of filings) {
        console.log(`Processing: ${f.filer_name} (${f.id})`);

        // Sum Contributions
        const { data: contribs } = await supabase
            .from('transactions')
            .select('amount')
            .eq('filing_id', f.id)
            .eq('transaction_type', 'CONTRIBUTION');

        let totalContrib = 0;
        contribs?.forEach(c => totalContrib += Number(c.amount || 0));

        // Sum Expenditures
        const { data: expends } = await supabase
            .from('transactions')
            .select('amount')
            .eq('filing_id', f.id)
            .eq('transaction_type', 'EXPENDITURE');

        let totalExpend = 0;
        expends?.forEach(e => totalExpend += Number(e.amount || 0));

        console.log(` - Contribs: $${totalContrib} | Expends: $${totalExpend}`);

        // Update Filing
        const { error: upError } = await supabase
            .from('filings')
            .update({
                total_contributions: totalContrib,
                total_expenditures: totalExpend,
                status: 'PROCESSED'
            })
            .eq('id', f.id);

        if (upError) console.error(" - Update failed:", upError);
        else console.log(" - Updated successfully.");
    }
}

refinalize();
