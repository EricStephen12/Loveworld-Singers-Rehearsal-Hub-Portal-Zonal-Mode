'use client'

import { useZone } from '@/contexts/ZoneContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { 
  Users, Crown, Music, Calendar, TrendingUp, 
  Link as LinkIcon, Copy, CheckCircle, CreditCard,
  Shield, BarChart3
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ZoneInvitationService } from '@/lib/zone-invitation-service'
import Link from 'next/link'
import { useAdminTheme } from './AdminThemeProvider'
import { isHQGroup } from '@/config/zones'

interface DashboardSectionProps {
  onSectionChange?: (section: string) => void;
}

export default function DashboardSection({ onSectionChange }: DashboardSectionProps = {}) {
  const { currentZone, isZoneCoordinator } = useZone()
  const { subscription, memberLimit, isFreeTier, isPremiumTier } = useSubscription()
  const { theme } = useAdminTheme()
  
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [totalSongs, setTotalSongs] = useState(0)
  const [totalPraiseNights, setTotalPraiseNights] = useState(0)
  
  // Check if this is an HQ group for terminology
  const isHQ = isHQGroup(currentZone?.id)

  useEffect(() => {
    loadData()
  }, [currentZone])

  const loadData = async () => {
    if (!currentZone) return

    setIsLoading(true)
    try {
      // Load members
      const zoneMembers = await ZoneInvitationService.getZoneMembers(currentZone.id)
      setMembers(zoneMembers)

      // Generate invite link
      const link = ZoneInvitationService.getZoneSignupLink(currentZone.invitationCode)
      setInviteLink(link)

      // Load songs and praise nights count
      const { PraiseNightSongsService } = await import('@/lib/praise-night-songs-service')
      const { ZoneDatabaseService } = await import('@/lib/zone-database-service')
      const { FirebaseDatabaseService } = await import('@/lib/firebase-database')
      
      const isHQ = isHQGroup(currentZone.id)
      console.log('🔍 Dashboard loading data for zone:', currentZone.id, 'isHQ:', isHQ)
      
      // Get all songs and praise nights for this zone (HQ-aware)
      if (isHQ) {
        // HQ groups: get from unfiltered collections
        console.log('🏢 Loading HQ data from unfiltered collections')
        const allSongs = await FirebaseDatabaseService.getCollection('praise_night_songs')
        console.log('📊 HQ Songs count:', allSongs.length)
        setTotalSongs(allSongs.length)
        
        const allPraiseNights = await FirebaseDatabaseService.getCollection('praise_nights')
        console.log('📅 HQ Programs count:', allPraiseNights.length)
        setTotalPraiseNights(allPraiseNights.length)
      } else {
        // Regular zones: get from zone-filtered collections
        console.log('📍 Loading zone data from filtered collections')
        const allSongs = await ZoneDatabaseService.getAllSongsByZone(currentZone.id)
        console.log('📊 Zone Songs count:', allSongs.length)
        setTotalSongs(allSongs.length)
        
        const allPraiseNights = await ZoneDatabaseService.getPraiseNightsByZone(currentZone.id, 1000)
        console.log('📅 Zone Programs count:', allPraiseNights.length)
        setTotalPraiseNights(allPraiseNights.length)
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Invite Link Card Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-14 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mb-4"></div>
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Recent Members Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Zone Dashboard</h1>
            {isZoneCoordinator && (
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-100 text-green-800 rounded-lg w-fit">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">Coordinator</span>
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600">{currentZone?.name} - {currentZone?.region}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Members</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {members.length}
              <span className="text-base sm:text-lg text-gray-500">/{memberLimit}</span>
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(members.length / memberLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPremiumTier ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                <Crown className={`w-6 h-6 ${isPremiumTier ? 'text-yellow-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm mb-1">Subscription</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {isFreeTier ? 'Free' : 'Premium'}
            </p>
            {isFreeTier && (
              <Link 
                href="/subscription/plans"
                className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-semibold"
              >
                Upgrade Now →
              </Link>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${theme.primaryLight} rounded-full flex items-center justify-center`}>
                <Music className={`w-6 h-6 ${theme.text}`} />
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm mb-1">Total Songs</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalSongs}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Across all programs</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm mb-1">Total Programs</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalPraiseNights}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-2">{isHQ ? 'All programs' : 'Active programs'}</p>
          </div>
        </div>

        {/* Invite Link Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-4 md:p-6 border-2 border-green-200 mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Zone Invitation Link</h2>
              <p className="text-xs md:text-sm text-gray-600">Share this link to invite new members</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 md:p-4 bg-white rounded-lg border border-green-200 mb-3">
            <input
              type="text"
              value={currentZone?.invitationCode || ''}
              readOnly
              className="flex-1 bg-transparent text-xs md:text-sm text-gray-600 outline-none font-mono font-bold text-center sm:text-left"
            />
            <button
              onClick={copyInviteLink}
              className="px-3 py-2 md:px-4 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold text-sm md:text-base whitespace-nowrap"
            >
              {copiedLink ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Invitation Code:</span>
            <span className="font-mono font-bold text-green-700 bg-white px-3 py-1 rounded-lg">
              {currentZone?.invitationCode}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Link
            href="/subscription"
            className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200 group"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 ${theme.primaryLight} rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
              <CreditCard className={`w-5 h-5 md:w-6 md:h-6 ${theme.text}`} />
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Manage Subscription</h3>
            <p className="text-xs md:text-sm text-gray-600">Upgrade or manage your plan</p>
          </Link>

          <button
            onClick={() => onSectionChange?.('Members')}
            className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200 group text-left"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Manage Members</h3>
            <p className="text-xs md:text-sm text-gray-600">View and manage zone members</p>
          </button>

          <button
            onClick={() => onSectionChange?.('Media')}
            className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200 group text-left"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">View Analytics</h3>
            <p className="text-xs md:text-sm text-gray-600">Track zone performance</p>
          </button>
        </div>

        {/* Recent Members */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Members</h2>
            <span className="text-xs md:text-sm text-gray-600">{members.length} total</span>
          </div>

          <div className="space-y-2 md:space-y-3">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 md:w-10 md:h-10 ${theme.primaryLight} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Users className={`w-4 h-4 md:w-5 md:h-5 ${theme.text}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm md:text-base text-gray-900 truncate">{member.userName}</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{member.userEmail}</p>
                  </div>
                </div>
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap w-fit ${
                  member.role === 'coordinator'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {member.role === 'coordinator' ? '👔 Coordinator' : '👤 Member'}
                </span>
              </div>
            ))}
          </div>

          {members.length > 5 && (
            <button
              onClick={() => {}}
              className={`w-full mt-4 py-3 ${theme.text} font-semibold ${theme.bgHover} rounded-lg transition-colors`}
            >
              View All Members →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
