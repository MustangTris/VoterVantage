-- Add Unique Constraints to Prevent Future Duplicates
-- Run this AFTER deduplication scripts have been executed

BEGIN;

-- 1. Add unique constraint on transactions (external_id + filing_id)
-- Only apply where external_id is not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_unique_external_id 
ON transactions(external_id, filing_id) 
WHERE external_id IS NOT NULL;

-- 2. Add unique constraint on profiles (case-insensitive name + type)
-- This prevents duplicate politicians, donors, and cities
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_name_type 
ON profiles(LOWER(name), type);

-- 3. Add unique constraint on filings (filer_name + source_file_url)
-- This prevents uploading the same file multiple times
CREATE UNIQUE INDEX IF NOT EXISTS idx_filings_unique_filer_file 
ON filings(filer_name, source_file_url) 
WHERE source_file_url IS NOT NULL;

-- Verify constraints were created
SELECT 
    indexname as constraint_name,
    tablename as table_name,
    indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%unique%'
ORDER BY tablename, indexname;

COMMIT;
