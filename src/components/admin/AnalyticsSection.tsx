'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart3, Users, Music, TrendingUp, Calendar, Activity, Eye, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useZone } from '@/hooks/useZone'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { ZoneDatabaseService } from '@/lib/zone-database-service'

// Cache for analytics data
const analyticsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function AnalyticsSection() {
  const { currentZone } = useZone()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Month/Year selector
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()) // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    totalPages: 0,
    totalSongs: 0,
    totalEvents: 0,
    totalSessions: 0,
    totalMediaViews: 0,
    recentEvents: [] as any[],
    popularPages: [] as any[],
    topMedia: [] as any[]
  })

  // Check if we have cached data
  const hasCachedData = useMemo(() => {
    if (!currentZone) return false
    const cached = analyticsCache.get(currentZone.id)
    if (!cached) return false
    const isValid = Date.now() - cached.timestamp < CACHE_DURATION
    return isValid
  }, [currentZone])

  useEffect(() => {
    loadAnalytics()
  }, [currentZone, selectedMonth, selectedYear])

  const loadAnalytics = async (forceRefresh = false) => {
    if (!currentZone) return
    
    // Cache key includes month and year
    const cacheKey = `${currentZone.id}-${selectedYear}-${selectedMonth}`
    
    // Check cache first (skip if force refresh)
    if (!forceRefresh) {
      const cached = analyticsCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📊 Using cached analytics data for ${selectedYear}-${selectedMonth + 1}`)
        setAnalytics(cached.data)
        setLoading(false)
        return
      }

      // Show cached data immediately while loading fresh data
      if (cached) {
        console.log('📊 Showing cached data while refreshing')
        setAnalytics(cached.data)
        setLoading(false)
      } else {
        setLoading(true)
      }
    } else {
      setRefreshing(true)
      console.log(`🔄 Force refreshing analytics for ${selectedYear}-${selectedMonth + 1}...`)
    }
    
    // Calculate month date range
    const monthStart = new Date(selectedYear, selectedMonth, 1)
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999)
    
    console.log(`📅 Loading analytics for ${monthStart.toLocaleDateString()} to ${monthEnd.toLocaleDateString()}`)
    
    try {
      console.log('🔄 Loading fresh analytics data...')
      
      // Parallel fetch all data at once (much faster!)
      const [
        members,
        pages,
        analyticsEvents,
        analyticsSessions
      ] = await Promise.all([
        (async () => {
          const { ZoneInvitationService } = await import('@/lib/zone-invitation-service')
          return ZoneInvitationService.getZoneMembers(currentZone.id)
        })(),
        ZoneDatabaseService.getPraiseNightsByZone(currentZone.id, 100),
        FirebaseDatabaseService.getCollection('analytics_events'),
        FirebaseDatabaseService.getCollection('analytics_sessions')
      ])

      console.log('📊 Raw analytics data loaded:', {
        members: members.length,
        pages: pages.length,
        analyticsEvents: analyticsEvents.length,
        analyticsSessions: analyticsSessions.length
      })

      // Count songs from all pages (use cached song counts if available)
      let totalSongs = 0
      for (const page of pages) {
        const pageData = page as any
        if (pageData.songCount !== undefined) {
          totalSongs += pageData.songCount
        } else if (pageData.songs && Array.isArray(pageData.songs)) {
          totalSongs += pageData.songs.length
        }
      }

      // If no song count available, fetch from database (slower)
      if (totalSongs === 0 && pages.length > 0) {
        const songCounts = await Promise.all(
          pages.slice(0, 10).map((page: any) => // Only check first 10 pages for speed
            ZoneDatabaseService.getSongsByPraiseNight(page.id)
              .then((songs: any[]) => songs.length)
              .catch(() => 0)
          )
        )
        totalSongs = songCounts.reduce((sum: number, count: number) => sum + count, 0)
      }

      // Filter events by selected month
      const monthFilteredEvents = analyticsEvents.filter((e: any) => {
        if (!e.timestamp) return false
        const eventDate = new Date(e.timestamp)
        return eventDate >= monthStart && eventDate <= monthEnd
      })
      
      // Filter sessions by selected month
      const monthFilteredSessions = analyticsSessions.filter((s: any) => {
        if (!s.startTime) return false
        const sessionDate = new Date(s.startTime)
        return sessionDate >= monthStart && sessionDate <= monthEnd
      })
      
      console.log(`📊 Filtered data for ${selectedYear}-${selectedMonth + 1}:`, {
        totalEvents: analyticsEvents.length,
        monthEvents: monthFilteredEvents.length,
        totalSessions: analyticsSessions.length,
        monthSessions: monthFilteredSessions.length
      })

      // Get recent events (last 10) from selected month
      const recentEvents = monthFilteredEvents
        .sort((a: any, b: any) => {
          const dateA = a.timestamp ? a.timestamp : 0
          const dateB = b.timestamp ? b.timestamp : 0
          return dateB - dateA
        })
        .slice(0, 10)

      // Calculate page views from analytics events (filtered by month)
      const pageViews = monthFilteredEvents.filter((e: any) => e.type === 'page_view').length

      // Get popular pages from analytics events (filtered by month)
      const pageViewsByPath = monthFilteredEvents
        .filter((e: any) => e.type === 'page_view')
        .reduce((acc: any, event: any) => {
          const page = event.page || 'Unknown'
          acc[page] = (acc[page] || 0) + 1
          return acc
        }, {})

      const popularPagePaths = Object.entries(pageViewsByPath)
        .map(([page, views]) => ({ page, views }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 5)

      const newAnalytics = {
        totalMembers: members.length,
        totalPages: pages.length,
        totalSongs,
        totalEvents: analyticsEvents.length,
        totalSessions: analyticsSessions.length,
        totalMediaViews: pageViews, // Use page views as "media views"
        recentEvents,
        popularPages: popularPagePaths, // Use actual popular pages from analytics
        topMedia: [] // No media analytics yet
      }

      console.log('✅ Analytics loaded:', newAnalytics)

      // Cache the data
      analyticsCache.set(currentZone.id, {
        data: newAnalytics,
        timestamp: Date.now()
      })

      setAnalytics(newAnalytics)
    } catch (error) {
      console.error('❌ Error loading analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    console.log('🔄 Refresh button clicked')
    // Clear cache and force reload
    if (currentZone) {
      console.log('🗑️ Clearing cache for zone:', currentZone.id)
      analyticsCache.delete(currentZone.id)
      loadAnalytics(true)
    } else {
      console.warn('⚠️ No current zone available')
    }
  }

  // Only show skeleton if loading AND no cached data
  if (loading && !hasCachedData) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              {currentZone?.name} Performance Metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Members */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 font-semibold">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalMembers}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Members</p>
          </div>

          {/* Total Pages */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-green-600 font-semibold">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalPages}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Pages</p>
          </div>

          {/* Total Songs */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-semibold">+15%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalSongs}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Songs</p>
          </div>

          {/* Total Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-green-600 font-semibold">Live</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</h3>
            <p className="text-sm text-gray-600 mt-1">Analytics Events</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Total Sessions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalSessions}</h3>
            <p className="text-sm text-gray-600 mt-1">User Sessions</p>
          </div>

          {/* Total Page Views */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{analytics.totalMediaViews.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 mt-1">Page Views</p>
          </div>

          {/* Average Session Duration */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {analytics.totalSessions > 0 
                ? Math.round(analytics.recentEvents.reduce((sum: number, e: any) => sum + (e.metadata?.duration || 0), 0) / analytics.totalSessions / 1000)
                : 0}s
            </h3>
            <p className="text-sm text-gray-600 mt-1">Avg Session</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Pages */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Popular Pages</h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analytics.popularPages.length > 0 ? (
                analytics.popularPages.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{page.page}</p>
                        <p className="text-xs text-gray-500">Page path</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{page.views}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No page views yet</p>
              )}
            </div>
          </div>

          {/* Member Growth */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Member Growth</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">Growth chart coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Analytics Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Analytics Events</h3>
          <div className="space-y-4">
            {analytics.recentEvents.length > 0 ? (
              analytics.recentEvents.map((event: any, index: number) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{event.eventType || 'Event'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.eventName || event.action || 'User activity'}
                    </p>
                    {event.metadata && (
                      <p className="text-xs text-gray-400 mt-1">
                        {JSON.stringify(event.metadata).substring(0, 50)}...
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No analytics events yet</p>
                <p className="text-xs text-gray-400 mt-1">Events will appear here as users interact with the app</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
