-- Add missing indexes on foreign keys to improve performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_entity_profile_id ON public.transactions(entity_profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_filing_id ON public.transactions(filing_id);

-- Add primary key to verification_tokens table
-- We use the composite key (identifier, token) as the primary key
-- first drop the existing unique constraint if it exists to avoid redundant indexes
ALTER TABLE public.verification_tokens DROP CONSTRAINT IF EXISTS verification_token_unique;
ALTER TABLE public.verification_tokens ADD PRIMARY KEY (identifier, token);
