CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filer_id TEXT UNIQUE, -- Official State/City Filer ID
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('POLITICIAN', 'LOBBYIST', 'CITY')),
    description TEXT,
    image_url TEXT,
    city TEXT, -- Link to city for filtering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Filings: Uploaded Form 460s (PDF or Excel source)
CREATE TABLE filings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filer_name TEXT NOT NULL,
    filing_date DATE,
    report_period_start DATE, -- From_Date
    report_period_end DATE,   -- Thru_Date
    amendment_number INTEGER, -- Report_Num
    total_contributions DECIMAL(12, 2), -- Summary Page Total
    total_expenditures DECIMAL(12, 2),  -- Summary Page Total
    cash_on_hand DECIMAL(12, 2),        -- Ending Cash Balance
    source_file_url TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'VERIFIED')),
    uploaded_by UUID, -- Link to volunteer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions: Contributions and Expenditures
-- Linked to a Filing, and optionally to a Profile (recipient/contributor)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_id UUID REFERENCES filings(id),
    
    transaction_type TEXT CHECK (transaction_type IN ('CONTRIBUTION', 'EXPENDITURE')),
    schedule TEXT, -- E.g., 'A', 'E'
    
    entity_name TEXT NOT NULL, -- The text name from the form (Donor or Payee)
    entity_profile_id UUID REFERENCES profiles(id), -- Linked verified profile if matched
    
    amount DECIMAL(12, 2) NOT NULL,
    transaction_date DATE,
    description TEXT,
    
    -- Schedule E specific
    expenditure_code TEXT, -- CMP, CNS, LIT, etc.
    
    -- Schedule A specific
    contributor_occupation TEXT,
    contributor_employer TEXT,
    
    -- Existing Location data (matches Tran_City, Tran_State, Tran_Zip4)
    entity_city TEXT,
    entity_state TEXT,
    entity_zip TEXT,

    -- Extended Donor/Entity Details
    entity_cd TEXT,
    entity_first_name TEXT,
    entity_last_name TEXT, -- Can be used alongside entity_name
    entity_prefix TEXT,
    entity_suffix TEXT,
    entity_adr1 TEXT,
    entity_adr2 TEXT,
    entity_self_employed TEXT, -- 'y' or 'n' or similar
    
    -- Committee Info
    cmte_id TEXT, -- If donor is a committee

    -- Treasurer Info (for Committee donors)
    treasurer_last_name TEXT,
    treasurer_first_name TEXT,
    treasurer_prefix TEXT,
    treasurer_suffix TEXT,
    treasurer_adr1 TEXT,
    treasurer_adr2 TEXT,
    treasurer_city TEXT,
    treasurer_state TEXT,
    treasurer_zip TEXT,

    -- Intermediary Info
    intermediary_last_name TEXT,
    intermediary_first_name TEXT,
    intermediary_prefix TEXT,
    intermediary_suffix TEXT,
    intermediary_adr1 TEXT,
    intermediary_adr2 TEXT,
    intermediary_city TEXT,
    intermediary_state TEXT,
    intermediary_zip TEXT,
    intermediary_employer TEXT,
    intermediary_occupation TEXT,
    intermediary_self_employed TEXT,

    -- Candidate Info (if related/earmarked)
    candidate_last_name TEXT,
    candidate_first_name TEXT,
    candidate_prefix TEXT,
    candidate_suffix TEXT,

    -- Administrative/Tracking
    memo_code TEXT,
    memo_refno TEXT,
    bakref_tid TEXT,
    xref_schnm TEXT,
    xref_match TEXT,
    loan_rate TEXT,
    int_cmteid TEXT,
    
    external_id TEXT, -- Tran_ID from source to prevent duplicates
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteers: Users with access to the dashboard
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'VOLUNTEER' CHECK (role IN ('VOLUNTEER', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NextAuth.js Tables
CREATE TABLE users
(
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  email         TEXT,
  email_verified TIMESTAMP WITH TIME ZONE,
  image         TEXT,
  role          TEXT DEFAULT 'USER'
);

CREATE TABLE accounts
(
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type               TEXT NOT NULL,
  provider           TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token      TEXT,
  access_token       TEXT,
  expires_at         BIGINT,
  token_type         TEXT,
  scope              TEXT,
  id_token           TEXT,
  session_state      TEXT,

  CONSTRAINT provider_unique UNIQUE (provider, provider_account_id)
);

CREATE TABLE sessions
(
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires      TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE verification_tokens
(
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMP WITH TIME ZONE NOT NULL,
  
  PRIMARY KEY (identifier, token)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_entity_profile_id ON public.transactions(entity_profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_filing_id ON public.transactions(filing_id);
