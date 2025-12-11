-- Deduplicate Transactions Table
-- Strategy: Keep the oldest record (earliest created_at) for each unique transaction
-- Uniqueness based on: external_id + filing_id (when external_id exists)

BEGIN;

-- Step 1: Delete duplicate transactions WITH external_id
-- Keep the one with the earliest created_at timestamp
DELETE FROM transactions
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY external_id, filing_id 
                ORDER BY created_at ASC
            ) as rn
        FROM transactions
        WHERE external_id IS NOT NULL
    ) ranked
    WHERE rn > 1
);

-- Step 2: Delete duplicate transactions WITHOUT external_id
-- Use all key fields to determine duplicates (more conservative)
DELETE FROM transactions
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY 
                    filing_id, 
                    transaction_type,
                    entity_name,
                    amount,
                    COALESCE(transaction_date::text, 'NULL')
                ORDER BY created_at ASC
            ) as rn
        FROM transactions
        WHERE external_id IS NULL
    ) ranked
    WHERE rn > 1
);

-- Report results
SELECT 
    'Deduplication complete' as status,
    COUNT(*) as remaining_transactions,
    COUNT(DISTINCT external_id) as unique_external_ids
FROM transactions;

COMMIT;
