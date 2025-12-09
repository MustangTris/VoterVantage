-- Fix RLS Policies for Supabase Advisors
-- 1. Enable RLS on 'measures' (High Severity - Security)
ALTER TABLE measures ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active measures (Site content)
CREATE POLICY "Enable read access for all users" 
ON measures FOR SELECT 
TO public 
USING (true);

-- 2. Add Policies to NextAuth tables (Info Severity - "RLS Enabled No Policy")
-- These tables already have RLS enabled but no policies, preventing access via PostgREST.
-- We will add strict policies to clear the warnings and allow potential future client-side usage safely.

-- USERS: Allow users to read their own data
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- ACCOUNTS: Allow users to view their own linked accounts
CREATE POLICY "Users can view own accounts" 
ON accounts FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- SESSIONS: Allow users to view their own sessions
CREATE POLICY "Users can view own sessions" 
ON sessions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- VERIFICATION TOKENS: Sensitive. No public/authenticated access needed via API.
-- Explicitly deny all to clear the "No Policy" warning, or allow only service_role (which bypasses anyway).
-- We'll create a "deny all" policy for public/authenticated to be explicit.
CREATE POLICY "No public access to tokens" 
ON verification_tokens FOR ALL 
USING (false);

-- VOLUNTEERS: Internal admin table. No public access.
CREATE POLICY "No public access to volunteers" 
ON volunteers FOR ALL 
USING (false);
