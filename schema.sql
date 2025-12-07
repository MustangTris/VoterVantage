-- Profiles: Politicians, Lobbyists, Cities
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    
    entity_name TEXT NOT NULL, -- The text name from the form (Donor or Payee)
    entity_profile_id UUID REFERENCES profiles(id), -- Linked verified profile if matched
    
    amount DECIMAL(12, 2) NOT NULL,
    transaction_date DATE,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteers: Users with access to the dashboard
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'VOLUNTEER' CHECK (role IN ('VOLUNTEER', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
