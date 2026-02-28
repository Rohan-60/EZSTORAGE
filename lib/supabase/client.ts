import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Using createClientComponentClient so sessions are stored in BOTH cookies and
// localStorage. This is required for the middleware (which uses createMiddlewareClient
// and reads cookies) to see the session after login.
export const supabase = createClientComponentClient()
