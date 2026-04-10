import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get('lwsrh_is_logged_in')?.value === 'true'
  const { pathname } = req.nextUrl

  // 🛡️ Protected routes: users MUST be logged in
  const isProtectedRoute = 
    pathname.startsWith('/pages') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/subgroup-admin') ||
    pathname.startsWith('/profile') ||
    pathname === '/home'

  // 🔓 Auth routes: users MUST NOT be logged in (redirect to home if they are)
  const isAuthRoute = pathname.startsWith('/auth')

  if (isProtectedRoute && !isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth'
    // Optional: save the return URL for a better UX
    url.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}