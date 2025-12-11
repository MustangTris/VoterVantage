import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with service role credentials.
 * This client bypasses Row Level Security (RLS) and should ONLY be used server-side.
 * Never expose this client or the service role key to the client.
 */
export function createServiceRoleClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    }

    if (serviceRoleKey === anonKey) {
        console.error('CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY matches NEXT_PUBLIC_SUPABASE_ANON_KEY. Service role operations will fail RLS checks.')
        throw new Error('Server misconfiguration: Service Role Key is identical to Anon Key.')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        db: { schema: 'api' }, // Explicitly use the 'api' schema where tables are located
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
}
