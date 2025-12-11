-- Deduplicate Filings Table
-- Strategy: Keep the oldest record (earliest created_at) for each unique filing
-- Uniqueness based on: filer_name + source_file_url
-- Update all foreign key references before deleting duplicates

BEGIN;

-- Step 1: Create a temporary mapping of duplicate filings to the one we'll keep
CREATE TEMP TABLE filing_mapping AS
SELECT 
    id as duplicate_id,
    FIRST_VALUE(id) OVER (
        PARTITION BY filer_name, COALESCE(source_file_url, 'NULL')
        ORDER BY created_at ASC
    ) as keep_id
FROM filings;

-- Step 2: Update all references in transactions table to point to the kept filing
UPDATE transactions
SET filing_id = fm.keep_id
FROM filing_mapping fm
WHERE transactions.filing_id = fm.duplicate_id
  AND fm.duplicate_id != fm.keep_id;

-- Step 3: Delete duplicate filings (keeping the oldest one per unique filer_name+source_file_url)
DELETE FROM filings
WHERE id IN (
    SELECT duplicate_id
    FROM filing_mapping
    WHERE duplicate_id != keep_id
);

-- Report results
SELECT 
    'Deduplication complete' as status,
    COUNT(*) as remaining_filings,
    COUNT(DISTINCT filer_name) as unique_filers
FROM filings;

-- Clean up
DROP TABLE filing_mapping;

COMMIT;
