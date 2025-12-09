import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with service role credentials.
 * This client bypasses Row Level Security (RLS) and should ONLY be used server-side.
 * Never expose this client or the service role key to the client.
 */
export function createServiceRoleClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
}
