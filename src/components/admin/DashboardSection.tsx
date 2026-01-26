'use client'

import { useZone } from '@/hooks/useZone'
import { useSubscription } from '@/contexts/SubscriptionContext'
import {
  Users, Crown, Music, Calendar, TrendingUp,
  Link as LinkIcon, Copy, CheckCircle, CreditCard,
  Shield, BarChart3, Upload
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ZoneInvitationService } from '@/lib/zone-invitation-service'
import Link from 'next/link'
import { useAdminTheme } from './AdminThemeProvider'
import { isHQGroup } from '@/config/zones'
import CustomLoader from '@/components/CustomLoader'

// Dashboard cache for reducing Firebase reads
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface DashboardCache {
  members: any[];
  totalSongs: number;
  totalPraiseNights: number;
  pendingSubmissions: number;
  timestamp: number;
  zoneId: string;
}
const dashboardCache = new Map<string, DashboardCache>();

function isCacheValid(cache: DashboardCache | undefined): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
}

interface DashboardSectionProps {
  onSectionChange?: (section: string) => void;
}

export default function DashboardSection({ onSectionChange }: DashboardSectionProps = {}) {
  const { currentZone, isZoneCoordinator } = useZone()
  const { memberLimit, isFreeTier, isPremiumTier } = useSubscription()
  const { theme } = useAdminTheme()

  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false) // Start false, will be set true only if no cache
  const [copiedLink, setCopiedLink] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [totalSongs, setTotalSongs] = useState(0)
  const [totalPraiseNights, setTotalPraiseNights] = useState(0)
  const [pendingSubmissions, setPendingSubmissions] = useState(0)

  const isHQ = isHQGroup(currentZone?.id)

  useEffect(() => {
    loadData()
  }, [currentZone])

  const loadData = async (forceRefresh = false) => {
    if (!currentZone) return

    // Check cache first (unless force refresh)
    const cacheKey = currentZone.id;
    if (!forceRefresh) {
      const cached = dashboardCache.get(cacheKey);
      if (isCacheValid(cached)) {
        setMembers(cached!.members);
        setTotalSongs(cached!.totalSongs);
        setTotalPraiseNights(cached!.totalPraiseNights);
        setPendingSubmissions(cached!.pendingSubmissions);
        // Still generate invite link (it's local, no Firebase read)
        const link = ZoneInvitationService.getZoneSignupLink(currentZone.invitationCode);
        setInviteLink(link);
        setIsLoading(false);
        return;
      }

      // Show stale cache while loading fresh data (if available)
      if (cached) {
        setMembers(cached.members);
        setTotalSongs(cached.totalSongs);
        setTotalPraiseNights(cached.totalPraiseNights);
        setPendingSubmissions(cached.pendingSubmissions);
        const link = ZoneInvitationService.getZoneSignupLink(currentZone.invitationCode);
        setInviteLink(link);
        // Don't show loading skeleton if we have stale data
      } else {
        // Only show loading skeleton if no cache at all
        setIsLoading(true);
      }
    } else {
      // Force refresh - show loading
      setIsLoading(true);
    }

    // Continue loading fresh data in background...
    try {
      const { FirebaseDatabaseService } = await import('@/lib/firebase-database')
      const isHQZone = isHQGroup(currentZone.id)

      // Load members - for HQ, load from both hq_members and zone_members
      let zoneMembers: any[] = [];
      if (isHQZone) {
        // Load all members from both collections
        const allHQMembers = await FirebaseDatabaseService.getCollection('hq_members')
        const allZoneMembers = await FirebaseDatabaseService.getCollection('zone_members')
        const combinedMembers = [...allHQMembers, ...allZoneMembers]

        // Deduplicate by userId (same user can be in multiple zones)
        const seenUserIds = new Set<string>();
        zoneMembers = combinedMembers.filter((m: any) => {
          if (m.userId && !seenUserIds.has(m.userId)) {
            seenUserIds.add(m.userId);
            return true;
          }
          return false;
        });

      } else {
        const rawMembers = await ZoneInvitationService.getZoneMembers(currentZone.id)

        // Deduplicate by userId
        const seenUserIds = new Set<string>();
        zoneMembers = rawMembers.filter((m: any) => {
          if (m.userId && !seenUserIds.has(m.userId)) {
            seenUserIds.add(m.userId);
            return true;
          }
          return false;
        });
      }
      setMembers(zoneMembers)

      // Generate invite link
      const link = ZoneInvitationService.getZoneSignupLink(currentZone.invitationCode)
      setInviteLink(link)

      // Load songs and praise nights count
      const { ZoneDatabaseService } = await import('@/lib/zone-database-service')

      let songsCount = 0;
      let praiseNightsCount = 0;

      // Get all songs and praise nights for this zone (HQ-aware)
      if (isHQZone) {
        // HQ groups: get from unfiltered collections
        // OPTIMIZED: Limit queries to prevent massive reads, use counts instead of full fetch
        const allSongs = await FirebaseDatabaseService.getCollection('praise_night_songs', 1000)
        songsCount = allSongs.length;
        setTotalSongs(songsCount)

        const allPraiseNights = await FirebaseDatabaseService.getCollection('praise_nights', 500)
        praiseNightsCount = allPraiseNights.length;
        setTotalPraiseNights(praiseNightsCount)
      } else {
        // Regular zones: get from zone-filtered collections
        const allSongs = await ZoneDatabaseService.getAllSongsByZone(currentZone.id)
        songsCount = allSongs.length;
        setTotalSongs(songsCount)

        const allPraiseNights = await ZoneDatabaseService.getPraiseNightsByZone(currentZone.id, 1000)
        praiseNightsCount = allPraiseNights.length;
        setTotalPraiseNights(praiseNightsCount)
      }

      // Load submitted songs count
      const { getPendingSongs } = await import('@/lib/song-submission-service')
      const pendingSongs = await getPendingSongs(currentZone.id, isHQZone)
      setPendingSubmissions(pendingSongs.length)

      // Cache the results
      dashboardCache.set(cacheKey, {
        members: zoneMembers,
        totalSongs: songsCount,
        totalPraiseNights: praiseNightsCount,
        pendingSubmissions: pendingSongs.length,
        timestamp: Date.now(),
        zoneId: currentZone.id
      });

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
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <CustomLoader message="Loading dashboard stats..." />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-gradient-to-br lg:from-slate-50 lg:via-white lg:to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Desktop only header - Mobile uses shared AdminMobileHeader */}
        <div className="hidden lg:block p-6 mb-2">
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

        {/* Content wrapper - no extra padding on mobile top since header handles it */}
        <div className="px-4 pt-2 pb-3 lg:px-6 lg:pt-0">

          {/* Stats Cards - Horizontal scroll on mobile */}
          <div className="flex lg:grid lg:grid-cols-4 gap-3 lg:gap-6 mb-6 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible scrollbar-hide">
            <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-blue-500 lg:border-t-0 lg:border-r-0 lg:border-b-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Members</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {members.length}
              </p>
            </div>

            <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-yellow-500 lg:border-t-0 lg:border-r-0 lg:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPremiumTier ? 'bg-yellow-100' : 'bg-gray-100'
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

            <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-purple-500 lg:border-t-0 lg:border-r-0 lg:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${theme.primaryLight} rounded-full flex items-center justify-center`}>
                  <Music className={`w-6 h-6 ${theme.text}`} />
                </div>
              </div>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Total Songs</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalSongs}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-2">Across all programs</p>
            </div>

            <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-green-500 lg:border-t-0 lg:border-r-0 lg:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Total Programs</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalPraiseNights}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-2">{isHQ ? 'All programs' : 'Active programs'}</p>
            </div>

            {/* Pending Submissions */}
            <button
              onClick={() => onSectionChange?.('Submitted Songs')}
              className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-red-500 lg:border-t-0 lg:border-r-0 lg:border-b-0 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${pendingSubmissions > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <Upload className={`w-6 h-6 ${pendingSubmissions > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                {pendingSubmissions > 0 && (
                  <TrendingUp className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Pending Songs</p>
              <p className={`text-2xl md:text-3xl font-bold ${pendingSubmissions > 0 ? 'text-red-600' : 'text-gray-900'}`}>{pendingSubmissions}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-2">Needs review</p>
            </button>
          </div>

          {/* Invite Link Card - Clean mobile design */}
          <div className="bg-white lg:bg-gradient-to-br lg:from-green-50 lg:to-emerald-50 rounded-2xl lg:rounded-xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-2 lg:border-green-200 mb-4 lg:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base lg:text-xl font-semibold text-gray-900">Invite Members</h2>
                <p className="text-xs text-gray-500">Share code to add new members</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 lg:bg-white rounded-xl border border-gray-200 lg:border-green-200">
              <span className="flex-1 font-mono font-bold text-lg text-center text-gray-900 tracking-wider">
                {currentZone?.invitationCode || '------'}
              </span>
              <button
                onClick={copyInviteLink}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${copiedLink
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
              >
                {copiedLink ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Quick Actions - Horizontal scroll on mobile */}
          <div className="mb-4 lg:mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 lg:hidden">Quick Actions</h3>
            <div className="flex lg:grid lg:grid-cols-3 gap-3 lg:gap-6 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:pb-0 scrollbar-hide">
              <Link
                href="/subscription"
                className="flex-shrink-0 w-[140px] lg:w-auto bg-white rounded-2xl lg:rounded-xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-2 lg:border-transparent lg:hover:border-purple-200 active:scale-95 lg:active:scale-100 transition-all"
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${theme.primaryLight} rounded-xl flex items-center justify-center mb-3`}>
                  <CreditCard className={`w-5 h-5 lg:w-6 lg:h-6 ${theme.text}`} />
                </div>
                <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-1">Subscription</h3>
                <p className="text-xs text-gray-500 hidden lg:block">Manage your plan</p>
              </Link>

              <button
                onClick={() => onSectionChange?.('Members')}
                className="flex-shrink-0 w-[140px] lg:w-auto bg-white rounded-2xl lg:rounded-xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-2 lg:border-transparent lg:hover:border-purple-200 active:scale-95 lg:active:scale-100 transition-all text-left"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-1">Members</h3>
                <p className="text-xs text-gray-500 hidden lg:block">View and manage</p>
              </button>

              <button
                onClick={() => onSectionChange?.('Media')}
                className="flex-shrink-0 w-[140px] lg:w-auto bg-white rounded-2xl lg:rounded-xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-2 lg:border-transparent lg:hover:border-purple-200 active:scale-95 lg:active:scale-100 transition-all text-left"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-1">Analytics</h3>
                <p className="text-xs text-gray-500 hidden lg:block">Track performance</p>
              </button>
            </div>
          </div>

          {/* Recent Members - Clean list design */}
          <div className="bg-white rounded-2xl lg:rounded-xl shadow-sm lg:shadow-lg border border-gray-100 lg:border-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
              <h2 className="text-base lg:text-xl font-semibold text-gray-900">Recent Members</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{members.length}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {members.slice(0, 5).map((member) => {
                // Trim name to remove extra whitespace
                const displayName = (member.userName || '').trim();
                const displayEmail = (member.userEmail || '').trim();

                return (
                  <div key={member.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                      {displayName.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                    </div>
                    {member.role === 'coordinator' && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {members.length > 5 && (
              <button
                onClick={() => onSectionChange?.('Members')}
                className="w-full p-4 text-center text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                See all members
              </button>
            )}

            {members.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No members yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
