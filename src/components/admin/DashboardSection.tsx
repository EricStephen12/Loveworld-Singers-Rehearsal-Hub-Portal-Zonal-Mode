'use client'

import { useZone } from '@/hooks/useZone'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/contexts/SubscriptionContext'
import {
  Users, Crown, Music, Calendar, TrendingUp,
  Link as LinkIcon, Copy, CheckCircle, CreditCard,
  Shield, BarChart3, Upload, QrCode, Sparkles,
  ArrowRight, Clock
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
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

// Animated counter component
function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = ref.current;
    const diff = value - start;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
      else ref.current = value;
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// Time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Relative time helper
function timeAgo(dateInput: any): string {
  if (!dateInput) return '';
  let date: Date;
  try {
    if (dateInput?.toDate && typeof dateInput.toDate === 'function') {
      date = dateInput.toDate(); // Firebase Timestamp with prototype
    } else if (dateInput?.seconds != null) {
      date = new Date(dateInput.seconds * 1000); // Plain {seconds, nanoseconds} object
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      return '';
    }
    if (!date || isNaN(date.getTime())) return '';
  } catch {
    return '';
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface DashboardSectionProps {
  onSectionChange?: (section: string) => void;
}

export default function DashboardSection({ onSectionChange }: DashboardSectionProps = {}) {
  const { currentZone, isZoneCoordinator } = useZone()
  const { profile } = useAuth()
  const { memberLimit, isFreeTier, isPremiumTier } = useSubscription()
  const { theme } = useAdminTheme()

  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [totalSongs, setTotalSongs] = useState(0)
  const [totalPraiseNights, setTotalPraiseNights] = useState(0)
  const [pendingSubmissions, setPendingSubmissions] = useState(0)

  const isHQ = isHQGroup(currentZone?.id)

  const firstName = profile?.first_name || profile?.display_name?.split(' ')[0] || 'Admin';

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
      } else {
        setIsLoading(true);
      }
    } else {
      setIsLoading(true);
    }

    try {
      const { FirebaseDatabaseService } = await import('@/lib/firebase-database')
      const isHQZone = isHQGroup(currentZone.id)

      let zoneMembers: any[] = [];
      if (isHQZone) {
        const allHQMembers = await FirebaseDatabaseService.getCollection('hq_members')
        const allZoneMembers = await FirebaseDatabaseService.getCollection('zone_members')
        const combinedMembers = [...allHQMembers, ...allZoneMembers]

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

      const link = ZoneInvitationService.getZoneSignupLink(currentZone.invitationCode)
      setInviteLink(link)

      const { ZoneDatabaseService } = await import('@/lib/zone-database-service')

      let songsCount = 0;
      let praiseNightsCount = 0;

      if (isHQZone) {
        const allSongs = await FirebaseDatabaseService.getCollection('praise_night_songs', 1000)
        songsCount = allSongs.length;
        setTotalSongs(songsCount)

        const allPraiseNights = await FirebaseDatabaseService.getCollection('praise_nights', 500)
        praiseNightsCount = allPraiseNights.length;
        setTotalPraiseNights(praiseNightsCount)
      } else {
        const allSongs = await ZoneDatabaseService.getAllSongsByZone(currentZone.id)
        songsCount = allSongs.length;
        setTotalSongs(songsCount)

        const allPraiseNights = await ZoneDatabaseService.getPraiseNightsByZone(currentZone.id, 1000)
        praiseNightsCount = allPraiseNights.length;
        setTotalPraiseNights(praiseNightsCount)
      }

      const { getPendingSongs } = await import('@/lib/song-submission-service')
      const pendingSongs = await getPendingSongs(currentZone.id, isHQZone)
      setPendingSubmissions(pendingSongs.length)

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

  // Avatar colors based on first letter
  const avatarColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-600',
    'from-amber-500 to-orange-500',
    'from-cyan-500 to-blue-500',
  ];

  const getAvatarColor = (name: string) => {
    const charCode = (name || 'A').charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-gradient-to-br lg:from-slate-50 lg:via-white lg:to-slate-50">
      <div className="max-w-7xl mx-auto">

        {/* ═══════════════════════════════════════════════════ */}
        {/* GREETING BANNER                                    */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="px-4 pt-5 pb-1 lg:px-6 lg:pt-8 lg:pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                {getGreeting()}, {firstName} 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentZone?.themeColor || '#9333EA' }}
                />
                {currentZone?.name || 'Loveworld Singers'}
                {currentZone?.region && <span className="text-gray-300">•</span>}
                {currentZone?.region && <span>{currentZone.region}</span>}
              </p>
            </div>
            {isZoneCoordinator && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                style={{
                  backgroundColor: `${currentZone?.themeColor || '#9333EA'}15`,
                  color: currentZone?.themeColor || '#9333EA'
                }}
              >
                <Shield className="w-3.5 h-3.5" />
                Coordinator
              </div>
            )}
          </div>
        </div>

        <div className="px-4 lg:px-6 pt-4 pb-6 space-y-5">

          {/* ═══════════════════════════════════════════════════ */}
          {/* STATS — Horizontal scroll on mobile, grid desktop  */}
          {/* ═══════════════════════════════════════════════════ */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Overview</p>
            <div className="flex lg:grid lg:grid-cols-5 gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible snap-x snap-mandatory scrollbar-hide">

              {/* Members */}
              <div className="flex-shrink-0 w-[155px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 border-l-[3px] border-l-blue-500 shadow-sm snap-start">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Members</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  <AnimatedCounter value={members.length} />
                </p>
              </div>

              {/* Subscription */}
              <div className="flex-shrink-0 w-[155px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 border-l-[3px] border-l-yellow-500 shadow-sm snap-start">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremiumTier ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                    <Crown className={`w-5 h-5 ${isPremiumTier ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                  {isPremiumTier && <Sparkles className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Plan</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {isFreeTier ? 'Free' : 'Pro'}
                </p>
                {isFreeTier && (
                  <Link
                    href="/subscription/plans"
                    className="text-[11px] font-semibold mt-1 inline-flex items-center gap-0.5 hover:underline"
                    style={{ color: currentZone?.themeColor || '#9333EA' }}
                  >
                    Upgrade <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Songs */}
              <div
                className="flex-shrink-0 w-[155px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 shadow-sm snap-start"
                style={{ borderLeftWidth: '3px', borderLeftColor: currentZone?.themeColor || '#9333EA' }}
              >
                <div className="flex items-center mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${currentZone?.themeColor || '#9333EA'}10` }}
                  >
                    <Music className="w-5 h-5" style={{ color: currentZone?.themeColor || '#9333EA' }} />
                  </div>
                </div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Songs</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  <AnimatedCounter value={totalSongs} />
                </p>
              </div>

              {/* Programs */}
              <div className="flex-shrink-0 w-[155px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 border-l-[3px] border-l-green-500 shadow-sm snap-start">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Programs</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  <AnimatedCounter value={totalPraiseNights} />
                </p>
              </div>

              {/* Pending Submissions */}
              <button
                onClick={() => onSectionChange?.('Submitted Songs')}
                className={`flex-shrink-0 w-[155px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 shadow-sm snap-start text-left ${pendingSubmissions > 0 ? 'border-l-[3px] border-l-red-500' : 'border-l-[3px] border-l-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingSubmissions > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <Upload className={`w-5 h-5 ${pendingSubmissions > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                  </div>
                  {pendingSubmissions > 0 && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Pending</p>
                <p className={`text-2xl font-bold mt-0.5 ${pendingSubmissions > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  <AnimatedCounter value={pendingSubmissions} />
                </p>
              </button>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════ */}
          {/* INVITE CODE — Compact pill                         */}
          {/* ═══════════════════════════════════════════════════ */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Invite Code</p>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${currentZone?.themeColor || '#9333EA'}15` }}
              >
                <LinkIcon className="w-4 h-4" style={{ color: currentZone?.themeColor || '#9333EA' }} />
              </div>
              <span className="flex-1 font-mono font-bold text-lg text-gray-900 tracking-[0.15em] text-center">
                {currentZone?.invitationCode || '------'}
              </span>
              <button
                onClick={copyInviteLink}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 ${
                  copiedLink
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* QUICK ACTIONS — Clean icon buttons                 */}
          {/* ═══════════════════════════════════════════════════ */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
            <div className="grid grid-cols-4 gap-2 lg:gap-3">
              <Link
                href="/subscription"
                className="flex flex-col items-center gap-2 p-3 lg:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.97] transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentZone?.themeColor || '#9333EA'}10` }}
                >
                  <CreditCard className="w-5 h-5" style={{ color: currentZone?.themeColor || '#9333EA' }} />
                </div>
                <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">Plan</span>
              </Link>

              <button
                onClick={() => onSectionChange?.('Members')}
                className="flex flex-col items-center gap-2 p-3 lg:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.97] transition-all"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">Members</span>
              </button>

              <button
                onClick={() => onSectionChange?.('Pages')}
                className="flex flex-col items-center gap-2 p-3 lg:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.97] transition-all"
              >
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">Pages</span>
              </button>

              <Link
                href="/qr-code"
                className="flex flex-col items-center gap-2 p-3 lg:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.97] transition-all"
              >
                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">QR Scan</span>
              </Link>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* RECENT MEMBERS — Premium card                      */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Recent Members</h3>
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                {members.length}
              </span>
            </div>

            {/* Members List */}
            <div className="divide-y divide-gray-50">
              {members.slice(0, 6).map((member, index) => {
                const displayName = (member.userName || '').trim();
                const displayEmail = (member.userEmail || '').trim();
                const joinedAt = member.joinedAt || member.createdAt;
                const isCoordinator = member.role === 'coordinator';

                return (
                  <div key={member.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                    {/* Avatar with gradient */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(displayName)} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                        {displayName.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      {/* Position number */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                        <span className="text-[8px] font-bold text-gray-400">{index + 1}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-[13px] text-gray-900 truncate">{displayName || 'Unknown'}</p>
                        {isCoordinator && (
                          <span
                            className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider flex-shrink-0"
                            style={{
                              backgroundColor: `${currentZone?.themeColor || '#9333EA'}12`,
                              color: currentZone?.themeColor || '#9333EA'
                            }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{displayEmail}</p>
                    </div>

                    {/* Time */}
                    {joinedAt && (
                      <span className="text-[10px] text-gray-300 flex-shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(joinedAt)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {members.length === 0 && (
              <div className="p-10 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium">No members yet</p>
                <p className="text-xs text-gray-300 mt-1">Share your invite code to get started</p>
              </div>
            )}

            {/* Footer */}
            {members.length > 6 && (
              <button
                onClick={() => onSectionChange?.('Members')}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 border-t border-gray-50 text-sm font-semibold hover:bg-gray-50 transition-colors active:scale-[0.99]"
                style={{ color: currentZone?.themeColor || '#9333EA' }}
              >
                See all {members.length} members
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>


        </div>
      </div>
    </div>
  )
}
