-- Migration script to add new columns to the transactions table

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_cd TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_first_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_last_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_prefix TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_suffix TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_adr1 TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_adr2 TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_self_employed TEXT;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cmte_id TEXT;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_last_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_first_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_prefix TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_suffix TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_adr1 TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_adr2 TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_city TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_state TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS treasurer_zip TEXT;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_last_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_first_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_prefix TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_suffix TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_adr1 TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_adr2 TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_city TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_state TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_zip TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_employer TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_occupation TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intermediary_self_employed TEXT;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS candidate_last_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS candidate_first_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS candidate_prefix TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS candidate_suffix TEXT;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS memo_code TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS memo_refno TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bakref_tid TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS xref_schnm TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS xref_match TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS loan_rate TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS int_cmteid TEXT;
