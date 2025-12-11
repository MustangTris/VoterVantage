# Supabase & NextAuth Connection Checklist

## 1. Environment Variables (.env.local)
Ensure the following variables are set correctly:

- **DATABASE_URL**: Must be the Transaction Mode connection string (Port 6543) for Supabase.
  - Format: `postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
  - *Current Status*: **FAILING** with "Tenant or user not found". Check Project Reference and Password.
- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase Project URL.
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase Anon Key.
- **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase Service Role Key (for server operations).
- **AUTH_SECRET**: A random string for NextAuth encryption.
- **AUTH_GOOGLE_ID** & **AUTH_GOOGLE_SECRET**: For Google Login.

## 2. Database Schema
- **Tables**: `users`, `accounts`, `sessions`, `verification_tokens` must exist.
- **Missing Column**: The `users` table defined in `auth_schema.sql` is **missing the `password` column**, which is required for Credential (Email/Password) login.
  - *Fix*: Run the newly created migration: `migration_add_password_to_users.sql`.

## 3. Verification Steps
1. **Fix connection string** in `.env.local`.
2. **Run Connection Test**:
   ```bash
   node test-db-connection.js
   ```
3. **Run Migration** (once connected):
   You can run this via Supabase SQL Editor or a tool like `psql`.
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
   ```
4. **Test Auth**:
   Run the auth check script:
   ```bash
   node check-user-auth.js
   ```
