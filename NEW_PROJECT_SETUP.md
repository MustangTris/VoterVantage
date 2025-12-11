# Supabase Project ID Change Guide

Since the Supabase Project ID has changed, you need to update your configuration and initialize the new database.

## 1. Update Environment Variables

Open `.env.local` and update the following variables.
**Note:** I cannot edit this file for you because it is protected by `.gitignore`.

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[NEW_PROJECT_ID].supabase.co` | Find in Supabase Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[NEW_ANON_KEY]` | Find in Supabase Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | `[NEW_SERVICE_ROLE_KEY]` | Find in Supabase Settings > API |
| `DATABASE_URL` | `postgres://postgres.[NEW_PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` | **Use Transaction Mode (Port 6543)**. <br/>Replace `[PASSWORD]` with your DB password.<br/>Replace `[REGION]` (e.g. `us-west-1`). |

*Tip: You can verify the `DATABASE_URL` by going to Supabase > Settings > Database > Connection String > URI > check "Use connection pooling" and "Transaction Mode".*

## 2. Initialize the New Database

Since this is a new project, the database is empty. You need to recreate the tables.

### Option A: Run via SQL Editor (Easiest)
Copy and paste the content of these files into the Supabase SQL Editor in this order:

1.  `c:\Users\trist\VoterVantageApp\schema.sql` (Creates all tables)
2.  `c:\Users\trist\VoterVantageApp\migration_add_password_to_users.sql` (Adds the missing password column)

### Option B: Run via Scripts (If Connected)
Once `.env.local` is correct:

```bash
# Test connection
node test-db-connection.js

# Initial Schema Setup (You might need to use a tool like psql or the SQL Editor for the big schema file, 
# or I can create a script to run schema.sql if you confirm connection)

# Apply Password Migration
node scripts/apply_migration.js
```

## 3. Verify
Run the auth check again:
```bash
node check-user-auth.js
```
