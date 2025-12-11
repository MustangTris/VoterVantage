-- Migration: Add 'COUNTY' to profiles type check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_type_check CHECK (type IN ('POLITICIAN', 'LOBBYIST', 'CITY', 'COUNTY'));
