import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

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
    try {
      // Get user role to redirect appropriately
      const { data: staff, error } = await supabase
        .from('staff')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching staff role in middleware:', error)
        // Default to admin if staff query fails
        return NextResponse.redirect(new URL('/dashboard/admin', req.url))
      }

      const roleRedirects: { [key: string]: string } = {
        admin: '/dashboard/admin',
        operations_manager: '/dashboard/operations',
        warehouse_staff: '/dashboard/warehouse',
        driver: '/dashboard/driver',
        accountant: '/dashboard/accounts',
      }

      const redirectPath = staff?.role ? roleRedirects[staff.role] : '/dashboard/admin'
      return NextResponse.redirect(new URL(redirectPath, req.url))
    } catch (err) {
      console.error('Failed to fetch staff role in middleware:', err)
      return NextResponse.redirect(new URL('/dashboard/admin', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
