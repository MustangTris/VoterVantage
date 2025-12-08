-- Create measures table for City Dashboard stats
CREATE TABLE IF NOT EXISTS measures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,         -- Linked to specific city (e.g., 'Palm Springs')
    title TEXT NOT NULL,        -- E.g., 'Measure A'
    description TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PASSED', 'FAILED')),
    election_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by city
CREATE INDEX IF NOT EXISTS idx_measures_city ON measures(city);
