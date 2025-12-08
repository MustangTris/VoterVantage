-- Migration to add city to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
