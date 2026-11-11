'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { NavigationManager } from '@/utils/navigation'
import { AUTH_CACHE_KEY } from '@/config/routes'

/**
 * SplashPage - ONLY handles initial app load routing (Reverted to former UI)
 */
export default function SplashPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [showFailsafe, setShowFailsafe] = useState(false)

  // Fail-safe: If stuck for 400ms, show manual entry
  useEffect(() => {
    const timer = setTimeout(() => setShowFailsafe(true), 400)
    return () => clearTimeout(timer)
  }, [])

  // KingsChat Authentication Redirect Flow (Mobile & Web)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash
    const search = window.location.search

    if (hash.includes('access_token=') || search.includes('access_token=')) {
      // Parse parameters from both hash and search
      const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash)
      const searchParams = new URLSearchParams(search.startsWith('?') ? search.substring(1) : search)

      const accessToken = hashParams.get('access_token') || searchParams.get('access_token') || hashParams.get('accessToken') || searchParams.get('accessToken')
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token') || hashParams.get('refreshToken')
      const expiresIn = hashParams.get('expires_in') || searchParams.get('expires_in') || hashParams.get('expiresInMillis')
      const kcUserId = hashParams.get('user_id') || searchParams.get('user_id') || hashParams.get('userId') || searchParams.get('userId') || hashParams.get('kingschat_id') || ''
      const kcEmail = hashParams.get('email') || searchParams.get('email') || ''

      const hasMobileState = search.includes('state=mobile-flow') || hash.includes('state=mobile-flow')

      if (accessToken) {
        if (hasMobileState) {
          // Construct deep link to redirect back to the React Native app
          const deepLinkUrl = `rehearsalhub://kingschat-callback?access_token=${accessToken}&refresh_token=${refreshToken || ''}&expires_in=${expiresIn || ''}`
          window.location.href = deepLinkUrl
          return
        }

        // Web Flow - If opened in a popup from /auth or /pages/profile
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(
              {
                type: 'KINGSCHAT_AUTH_SUCCESS',
                accessToken,
                refreshToken: refreshToken || '',
                expiresIn: expiresIn || '',
                kcUserId,
                kcEmail,
                user: { userId: kcUserId, username: '' },
              },
              '*'
            )
            window.close()
            return
          } catch (postErr) {
            console.warn('[KingsChat] Popup postMessage failed, falling back to direct navigation:', postErr)
          }
        }

        // Web Flow - Direct navigation in browser: forward to /auth/callback to finalize sign in
        const fullParams = (search ? search : '') + (hash ? hash : '')
        router.replace(`/auth/callback${fullParams}`)
        return
      }
    }
  }, [pathname, router])

  // IMMEDIATE Redirect Effect: Fast, deterministic route based on token presence
  useEffect(() => {
    if (pathname !== '/') return
    if (typeof window !== 'undefined' && (window.location.hash.includes('access_token=') || window.location.search.includes('access_token='))) return

    const hasToken = typeof window !== 'undefined'
      ? (!!localStorage.getItem('lwsrh_access_token') || !!localStorage.getItem('lwsrh_refresh_token'))
      : false

    // 1. Authenticated User (has valid token) - send to home or last visited page
    if (hasToken) {
      if (typeof document !== 'undefined' && !document.cookie.includes('lwsrh_is_logged_in=true')) {
        document.cookie = 'lwsrh_is_logged_in=true; path=/; max-age=2592000; SameSite=Lax'
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_CACHE_KEY, 'true')
      }
      const lastPath = NavigationManager.getLastPath()
      const target = (lastPath && lastPath !== '/' && !lastPath.startsWith('/auth')) ? lastPath : '/home'
      router.replace(target)
      return
    }

    // 2. Unauthenticated Visitor (no token) - require login
    router.replace('/auth')
  }, [router, pathname])

  // Big Tech optimization: Only show "Resuming..." IF there is genuinely a token and active user
  const hasToken = typeof window !== 'undefined' ? (!!localStorage.getItem('lwsrh_access_token') || !!localStorage.getItem('lwsrh_refresh_token')) : false;
  const isRedirecting = (pathname === '/' && hasToken);

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium text-gray-400 animate-pulse">Resuming...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center p-4">
      <link rel="preload" href="/logo.png" as="image" />

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <img
          src="/logo.png"
          alt="LoveWorld Singers"
          className="object-contain animate-bounce"
          width={120}
          height={120}
          style={{
            animationDuration: '2s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out'
          }}
        />

        {/* Fail-safe button for stuck users */}
        {showFailsafe && (
          <button
            onClick={() => window.location.reload()}
            className="animate-in fade-in zoom-in duration-500 mt-8 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold shadow-xl hover:bg-white/20 active:scale-95 transition-all outline-none"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}
