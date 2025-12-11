-- Deduplicate Profiles Table
-- Strategy: Keep the oldest record (earliest created_at) for each unique profile
-- Uniqueness based on: LOWER(name) + type (case-insensitive name matching)
-- Update all foreign key references before deleting duplicates

BEGIN;

-- Step 1: Create a temporary mapping of duplicate profiles to the one we'll keep
CREATE TEMP TABLE profile_mapping AS
SELECT 
    id as duplicate_id,
    FIRST_VALUE(id) OVER (
        PARTITION BY LOWER(name), type 
        ORDER BY created_at ASC
    ) as keep_id
FROM profiles;

-- Step 2: Update all references in transactions table to point to the kept profile
UPDATE transactions
SET entity_profile_id = pm.keep_id
FROM profile_mapping pm
WHERE transactions.entity_profile_id = pm.duplicate_id
  AND pm.duplicate_id != pm.keep_id;

-- Step 3: Delete duplicate profiles (keeping the oldest one per unique name+type)
DELETE FROM profiles
WHERE id IN (
    SELECT duplicate_id
    FROM profile_mapping
    WHERE duplicate_id != keep_id
);

-- Report results
SELECT 
    'Deduplication complete' as status,
    type,
    COUNT(*) as remaining_profiles
FROM profiles
GROUP BY type
ORDER BY type;

-- Clean up
DROP TABLE profile_mapping;

COMMIT;
