CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filer_id TEXT UNIQUE, -- Official State/City Filer ID
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('POLITICIAN', 'LOBBYIST', 'CITY')),
    description TEXT,
    image_url TEXT,
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
    
    -- Location data for analysis
    entity_city TEXT,
    entity_state TEXT,
    entity_zip TEXT,
    
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
  
  CONSTRAINT verification_token_unique UNIQUE (identifier, token)
);
