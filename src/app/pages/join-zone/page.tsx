'use client'

import { useState, CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { ZoneInvitationService } from '@/lib/zone-invitation-service'
import { getZoneByInvitationCode } from '@/config/zones'
import { ArrowLeft, Users, CheckCircle, AlertCircle, Crown } from 'lucide-react'
import Link from 'next/link'
import { useCanAddMember } from '@/components/MemberLimitGuard'

export default function JoinZonePage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { refreshZones, currentZone } = useZone()
  const [invitationCode, setInvitationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [zoneName, setZoneName] = useState('')

  const fallbackColor = '#10b981'
  const themeColor = currentZone?.themeColor || fallbackColor
  const withAlpha = (color: string, alphaHex: string) => {
    if (!color.startsWith('#') || color.length !== 7) return color
    return `${color}${alphaHex}`
  }
  const pageBackground: CSSProperties & { '--join-theme'?: string } = {
    '--join-theme': themeColor,
    background: `linear-gradient(145deg, ${withAlpha(themeColor, '1F')}, #f4f6fb)`
  }
  const headerBackground = {
    background: `linear-gradient(135deg, ${themeColor}, ${withAlpha(themeColor, 'CC')})`
  }

  const handleJoinZone = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile) {
      setError('You must be logged in to join a zone')
      return
    }

    if (!invitationCode.trim()) {
      setError('Please enter an invitation code')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Validate code format
      const code = invitationCode.trim().toUpperCase()
      
      // Check if zone exists
      const zone = getZoneByInvitationCode(code)
      if (!zone) {
        setError('Invalid invitation code. Please check and try again.')
        setIsLoading(false)
        return
      }

      // Join the zone
      const result = await ZoneInvitationService.joinZoneWithCode(
        user.uid,
        code,
        profile.email || user.email || '',
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
      )

      if (result.success) {
        setSuccess(true)
        setZoneName(('zoneName' in result ? result.zoneName : zone.name) || zone.name)
        
        // Refresh zones in context
        await refreshZones()
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/home')
        }, 2000)
      } else {
        setError(('error' in result ? result.error : 'Failed to join zone') || 'Failed to join zone')
      }
    } catch (error) {
      console.error('Error joining zone:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Not Logged In</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to join a zone.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 text-white rounded-xl transition-colors hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-y-auto pb-20" style={pageBackground}>
      {/* Header */}
      <div className="text-white p-6" style={headerBackground}>
        <div className="max-w-2xl mx-auto">
          <Link href="/pages/profile" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-bold">Join a Zone</h1>
          <p className="mt-2" style={{ color: withAlpha(themeColor, 'B3') }}>
            Enter your zone invitation code to join
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {success ? (
          // Success State
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: withAlpha(themeColor, '1F') }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: themeColor }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Successfully Joined!</h2>
            <p className="text-gray-600 mb-2">
              You've been added to
            </p>
            <p className="text-xl font-bold mb-6" style={{ color: themeColor }}>
              {zoneName}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to home page...
            </p>
          </div>
        ) : (
          // Join Form
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: withAlpha(themeColor, '1F') }}
              >
                <Users className="w-8 h-8" style={{ color: themeColor }} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Enter Invitation Code
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Get the invitation code from your zone coordinator
            </p>

            <form onSubmit={handleJoinZone} className="space-y-6">
              {/* Invitation Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Invitation Code
                </label>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="LWS-HQ-001"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--join-theme)] focus:border-[var(--join-theme)]"
                  style={{ borderColor: withAlpha(themeColor, '66') }}
                  maxLength={20}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Example: LWS-HQ-001, LWS-NG-LAG1, LWS-US-R1Z1
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !invitationCode.trim()}
                className="w-full py-4 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-95"
                style={{
                  backgroundColor: themeColor,
                  boxShadow: `0 20px 45px -20px ${withAlpha(themeColor, '70')}`
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Joining Zone...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Join Zone
                  </>
                )}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Don't have an invitation code?
              </h3>
              <p className="text-sm text-blue-700">
                Contact your zone coordinator to get an invitation code. Each zone has a unique code that allows you to join.
              </p>
            </div>

            {/* Example Codes (for testing) */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">
                Example Codes (for reference):
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-mono">
                <div>LWS-HQ-001</div>
                <div>LWS-NG-LAG1</div>
                <div>LWS-US-R1Z1</div>
                <div>LWS-UK-Z1D</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
