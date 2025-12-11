const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.rppxstkdrbdvmhhgtoyr:EconRulez!2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

(async () => {
    const client = await pool.connect();

    try {
        console.log('=== CHECKING CONSTRAINTS ===\n');

        const res = await client.query(`
            SELECT conname, pg_get_constraintdef(oid) as def
            FROM pg_constraint
            WHERE conrelid = 'transactions'::regclass
        `);

        res.rows.forEach(r => {
            console.log(`Constraint: ${r.conname}`);
            console.log(`Definition: ${r.def}\n`);
        });

        console.log('=== CHECKING INDEXES ===\n');
        const idxRes = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'transactions'
        `);

        idxRes.rows.forEach(r => {
            console.log(`Index: ${r.indexname}`);
            console.log(`Def: ${r.indexdef}\n`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
})();
