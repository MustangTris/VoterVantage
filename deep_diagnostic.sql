-- Deep Diagnostic: Check why profiles aren't being created for all uploaded filings

-- 1. What filings have been uploaded?
SELECT 
    id,
    filer_name,
    source_file_url,
    status,
    total_contributions,
    total_expenditures,
    created_at
FROM filings
ORDER BY created_at DESC
LIMIT 20;

-- 2. What are the actual profile counts?
SELECT 
    type,
    COUNT(*) as count,
    array_agg(name ORDER BY created_at DESC) FILTER (WHERE name IS NOT NULL) as sample_names
FROM profiles
GROUP BY type;

-- 3. Check if politician profiles exist for each filing
SELECT 
    f.filer_name,
    f.created_at as filing_created,
    COUNT(t.id) as transaction_count,
    p.id as profile_id,
    p.name as profile_name,
    p.city as profile_city,
    p.created_at as profile_created
FROM filings f
LEFT JOIN transactions t ON f.id = t.filing_id
LEFT JOIN profiles p ON LOWER(TRIM(f.filer_name)) = LOWER(TRIM(p.name)) AND p.type = 'POLITICIAN'
GROUP BY f.filer_name, f.created_at, p.id, p.name, p.city, p.created_at
ORDER BY f.created_at DESC;

-- 4. Check what cities should exist based on profile.city field
SELECT DISTINCT
    p.city as city_from_politician_profiles,
    COUNT(*) as politician_count
FROM profiles p
WHERE p.type = 'POLITICIAN' AND p.city IS NOT NULL
GROUP BY p.city;

-- 5. Check if city profiles were created for those jurisdictions
SELECT 
    cp.name as city_profile_name,
    cp.created_at as city_profile_created
FROM profiles cp
WHERE cp.type = 'CITY'
ORDER BY cp.created_at DESC;

-- 6. Check for name mismatches (case sensitivity, extra spaces, etc)
SELECT 
    f.filer_name as filing_filer_name,
    p.name as profile_name,
    CASE 
        WHEN f.filer_name = p.name THEN 'EXACT_MATCH'
        WHEN LOWER(f.filer_name) = LOWER(p.name) THEN 'CASE_MISMATCH'
        WHEN TRIM(f.filer_name) = TRIM(p.name) THEN 'WHITESPACE_MISMATCH'
        ELSE 'NO_MATCH'
    END as match_type
FROM filings f
LEFT JOIN profiles p ON p.type = 'POLITICIAN'
ORDER BY f.created_at DESC
LIMIT 20;

-- 7. Check what's in transactions to understand jurisdiction data
SELECT 
    f.filer_name,
    f.id as filing_id,
    t.entity_city,
    COUNT(*) as transaction_count
FROM filings f
JOIN transactions t ON f.id = t.filing_id
WHERE t.entity_city IS NOT NULL
GROUP BY f.filer_name, f.id, t.entity_city
ORDER BY f.id DESC, transaction_count DESC
LIMIT 30;
