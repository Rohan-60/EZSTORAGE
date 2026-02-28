import { createClient } from '@supabase/supabase-js'

// Admin client uses the service role key — bypasses RLS.
// Used for privileged browser-side operations (e.g. creating auth users)
// in this internal admin dashboard.
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)
