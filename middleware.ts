import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    // DEMO MODE: Authentication disabled for testing
    // Uncomment below to enable authentication

    /*
    const supabase = createMiddlewareClient({ req, res })
  
    const {
      data: { session },
    } = await supabase.auth.getSession()
  
    // Protect dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  
    // Redirect to dashboard if already logged in and trying to access login
    if (req.nextUrl.pathname === '/login' && session) {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url))
    }
    */

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
}
