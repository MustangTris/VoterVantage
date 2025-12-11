-- Diagnostic SQL Script: Check Profile Creation Status
-- Run this in Supabase SQL Editor to diagnose missing profiles

-- 1. Count profiles by type
SELECT 
    type,
    COUNT(*) as count
FROM profiles
GROUP BY type
ORDER BY type;

-- 2. List all profiles (limited to recent 20)
SELECT 
    id,
    name,
    type,
    city,
    created_at,
    description
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check recent filings and whether politician profiles were created for them
SELECT 
    f.id as filing_id,
    f.filer_name,
    f.status,
    f.created_at,
    p.id as profile_id,
    p.type as profile_type,
    p.city as profile_city
FROM filings f
LEFT JOIN profiles p ON f.filer_name = p.name AND p.type = 'POLITICIAN'
ORDER BY f.created_at DESC
LIMIT 10;

-- 4. Check for large donors (>$500) and whether lobbyist profiles were created
SELECT 
    t.entity_name,
    SUM(t.amount) as total_contributed,
    p.id as profile_id,
    p.type as profile_type
FROM transactions t
LEFT JOIN profiles p ON t.entity_name = p.name AND p.type = 'LOBBYIST'
WHERE t.transaction_type = 'CONTRIBUTION'
GROUP BY t.entity_name, p.id, p.type
HAVING SUM(t.amount) > 500
ORDER BY total_contributed DESC
LIMIT 10;

-- 5. Check unique constraint on profiles (name, type combo)
SELECT 
    name,
    type,
    COUNT(*) as duplicate_count
FROM profiles
GROUP BY name, type
HAVING COUNT(*) > 1;

-- 6. Check city profiles
SELECT 
    id,
    name,
    description,
    created_at
FROM profiles
WHERE type = 'CITY'
ORDER BY created_at DESC;
