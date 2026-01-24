'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FirebaseAuthService } from '@/lib/firebase-auth'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters in URL
        const urlParams = new URLSearchParams(window.location.search)
        const error = urlParams.get('error')
        const errorCode = urlParams.get('error_code')
        const errorDescription = urlParams.get('error_description')

        if (error) {
          console.error('Auth callback error:', { error, errorCode, errorDescription })
          
          // Handle specific error cases
          if (errorCode === 'otp_expired') {
            router.push('/auth?error=link_expired&message=Password reset link has expired. Please request a new one.')
          } else if (errorCode === 'access_denied') {
            router.push('/auth?error=access_denied&message=Access denied. Please try again.')
          } else {
            router.push(`/auth?error=${error}&message=${errorDescription || 'Authentication failed'}`)
          }
          return
        }

        // Check Firebase auth state
        const user = FirebaseAuthService.getCurrentUser()
        
        if (user) {
                    const type = urlParams.get('type')
          
          if (type === 'recovery') {
            // Redirect to password reset page
            router.push('/auth/reset-password')
          } else {
            // Regular auth success, go to home
            router.push('/home')
          }
        } else {
          // No user, redirect to auth
          router.push('/auth?error=no_session&message=No active session found')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth?error=callback_error&message=An unexpected error occurred')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}