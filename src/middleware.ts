import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public paths that do not require authentication
const PUBLIC_PREFIXES = [
  '/auth',
  '/signup-success',
  '/success',
  '/subscription/callback',
  '/support',
  '/pages/support',
  '/api',
]

function isPublic(pathname: string): boolean {
  if (pathname === '/' || pathname === '/splash') return true
  return PUBLIC_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get('lwsrh_is_logged_in')?.value === 'true'
  const { pathname } = req.nextUrl

  // If already logged in and navigating directly to auth login, send to /home
  // (Do not redirect /auth/callback which handles OAuth exchange)
  if (isLoggedIn && (pathname === '/auth' || pathname === '/auth/login')) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // If not logged in and attempting to access a protected route, redirect to /auth
  if (!isLoggedIn && !isPublic(pathname)) {
    const loginUrl = new URL('/auth', req.url)
    const returnUrl = pathname + (req.nextUrl.search || '')
    if (returnUrl && returnUrl !== '/') {
      loginUrl.searchParams.set('returnUrl', returnUrl)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static public assets (images, audio, manifests, fonts)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.(?:json|webmanifest)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4|wav|woff2?|css|js)$).*)',
  ],
}
