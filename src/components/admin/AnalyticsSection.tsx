'use client'

import { useState, useEffect, useMemo } from 'react'
import { Users, Activity, Eye, Download, RefreshCw, ChevronLeft, ChevronRight, Database, Zap, Monitor, Smartphone, Tablet, UserCheck } from 'lucide-react'
import { useZone } from '@/hooks/useZone'
import { AnalyticsAggregationService } from '@/lib/analytics-aggregation-service'

// Simple Bar Chart Component
function BarChart({ data, maxValue, color = 'purple' }: { 
  data: { label: string; value: number }[]; 
  maxValue: number;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  }
  
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => {
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-600 font-medium">{item.value.toLocaleString()}</span>
            <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '120px' }}>
              <div 
                className={`absolute bottom-0 w-full ${colorClasses[color]} rounded-t-md transition-all duration-500`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 truncate w-full text-center">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// Donut Chart Component
function DonutChart({ data }: { 
  data: { label: string; value: number; color: string }[] 
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-gray-500">No data</p>
      </div>
    )
  }
  
  // Calculate percentages and create conic gradient
  let accumulated = 0
  const gradientParts = data.map(item => {
    const percentage = (item.value / total) * 100
    const start = accumulated
    accumulated += percentage
    return `${item.color} ${start}% ${accumulated}%`
  }).join(', ')
  
  return (
    <div className="flex items-center gap-6">
      <div 
        className="w-32 h-32 rounded-full relative"
        style={{ 
          background: `conic-gradient(${gradientParts})`,
        }}
      >
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{total.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()}</span>
            <span className="text-xs text-gray-400">({((item.value / total) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Horizontal Bar Chart Component
function HorizontalBarChart({ data, color = 'purple' }: { 
  data: { label: string; value: number }[];
  color?: string;
}) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  }
  
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const width = (item.value / maxValue) * 100
        return (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 truncate max-w-[60%]">{item.label}</span>
              <span className="font-semibold text-gray-900">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Cache for aggregated data - instant loads after first fetch
const summaryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

interface MonthlySummary {
  year: number
  month: number
  totalEvents: number
  totalSessions: number
  totalPageViews: number
  uniqueUsers: number
  desktopSessions: number
  mobileSessions: number
  tabletSessions: number
  pageViews: { [page: string]: number }
  countries: { [country: string]: number }
  cities: { [city: string]: number }
  browsers: { [browser: string]: number }
}

export default function AnalyticsSection() {
  const { currentZone } = useZone()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrationLog, setMigrationLog] = useState<string[]>([])
  
  // Month/Year selector
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Pre-aggregated monthly summaries (lightweight!)
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])
  const [totalMembers, setTotalMembers] = useState(0)

  // Get selected month's data
  const selectedSummary = useMemo(() => {
    return monthlySummaries.find(s => s.year === selectedYear && s.month === selectedMonth) || null
  }, [monthlySummaries, selectedYear, selectedMonth])

  // Calculate all-time totals
  const allTimeTotals = useMemo(() => {
    return monthlySummaries.reduce((acc, s) => ({
      events: acc.events + s.totalEvents,
      sessions: acc.sessions + s.totalSessions,
      pageViews: acc.pageViews + s.totalPageViews
    }), { events: 0, sessions: 0, pageViews: 0 })
  }, [monthlySummaries])

  // Convert maps to sorted arrays for display
  const topCountries = useMemo(() => {
    if (!selectedSummary?.countries) return []
    return Object.entries(selectedSummary.countries)
      .map(([country, sessions]) => ({ country: country.replace(/_/g, '.'), sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5)
  }, [selectedSummary])

  const topCities = useMemo(() => {
    if (!selectedSummary?.cities) return []
    return Object.entries(selectedSummary.cities)
      .map(([city, sessions]) => ({ city: city.replace(/_/g, '.'), sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5)
  }, [selectedSummary])

  const topBrowsers = useMemo(() => {
    if (!selectedSummary?.browsers) return []
    return Object.entries(selectedSummary.browsers)
      .map(([browser, count]) => ({ browser: browser.replace(/_/g, '.'), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [selectedSummary])

  const popularPages = useMemo(() => {
    if (!selectedSummary?.pageViews) return []
    return Object.entries(selectedSummary.pageViews)
      .map(([page, views]) => ({ page: page.replace(/_/g, '/'), views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }, [selectedSummary])

  // Chart data: Last 6 months sessions trend
  const sessionsChartData = useMemo(() => {
    const sorted = [...monthlySummaries].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    }).slice(0, 6).reverse()
    
    return sorted.map(s => ({
      label: new Date(s.year, s.month).toLocaleDateString('en-US', { month: 'short' }),
      value: s.totalSessions
    }))
  }, [monthlySummaries])

  const sessionsChartMax = useMemo(() => {
    return Math.max(...sessionsChartData.map(d => d.value), 1)
  }, [sessionsChartData])

  // Device breakdown for donut chart
  const deviceChartData = useMemo(() => {
    if (!selectedSummary) return []
    return [
      { label: 'Desktop', value: selectedSummary.desktopSessions || 0, color: '#8b5cf6' },
      { label: 'Mobile', value: selectedSummary.mobileSessions || 0, color: '#22c55e' },
      { label: 'Tablet', value: selectedSummary.tabletSessions || 0, color: '#f97316' },
    ]
  }, [selectedSummary])

  // Load data on mount
  useEffect(() => {
    if (!currentZone) return
    loadAnalytics()
  }, [currentZone])

  const loadAnalytics = async (forceRefresh = false) => {
    if (!currentZone) return
    
    const cacheKey = `summaries-${currentZone.id}`
    
    // Check cache
    if (!forceRefresh) {
      const cached = summaryCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached analytics summaries')
        setMonthlySummaries(cached.data.summaries)
        setTotalMembers(cached.data.members)
        setLoading(false)
        return
      }
    }
    
    setLoading(true)
    console.log('🔄 Loading analytics summaries...')
    
    try {
      // Fetch pre-aggregated summaries (FAST - just a few documents!)
      const [summaries, members] = await Promise.all([
        AnalyticsAggregationService.getAllMonthlySummaries(),
        (async () => {
          const { ZoneInvitationService } = await import('@/lib/zone-invitation-service')
          return ZoneInvitationService.getZoneMembers(currentZone.id)
        })()
      ])
      
      console.log(`📊 Loaded ${summaries.length} monthly summaries:`, summaries)
      console.log(`👥 Loaded ${members.length} members`)
      
      if (summaries.length > 0) {
        console.log('📅 First summary:', summaries[0])
      }
      
      setMonthlySummaries(summaries)
      setTotalMembers(members.length)
      
      // Cache the data
      summaryCache.set(cacheKey, {
        data: { summaries, members: members.length },
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadAnalytics(true)
  }

  // Smart migration - processes data month by month (like big companies)
  const handleMigration = async () => {
    setMigrating(true)
    setMigrationLog(['🚀 Starting smart migration (month-by-month)...'])
    
    try {
      setMigrationLog(prev => [...prev, '📡 Auto-detecting months with data...'])
      
      const response = await fetch('/api/analytics/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoDetect: true })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMigrationLog(prev => [
          ...prev, 
          `✅ ${result.message}`,
          `📊 Events: ${result.totalEvents?.toLocaleString()}`,
          `📊 Sessions: ${result.totalSessions?.toLocaleString()}`,
          `📅 Months processed: ${result.monthsProcessed}`,
          result.months?.length > 0 ? `📆 ${result.months.join(', ')}` : ''
        ].filter(Boolean))
        // Reload data after migration
        await loadAnalytics(true)
      } else {
        setMigrationLog(prev => [...prev, `❌ Error: ${result.error}`])
      }
    } catch (error) {
      setMigrationLog(prev => [...prev, `❌ Error: ${error}`])
    } finally {
      setMigrating(false)
    }
  }

  // Loading state
  if (loading) {
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

  // Debug: Log current state
  console.log('🔍 Analytics State:', {
    monthlySummaries: monthlySummaries.length,
    selectedMonth,
    selectedYear,
    selectedSummary: selectedSummary ? 'found' : 'not found',
    allTimeTotals
  })

  // No data state - show migration option
  if (monthlySummaries.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <Database className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Analytics Data Found</h2>
            <p className="text-gray-600 mb-6">
              Analytics data needs to be aggregated from raw events. This is a one-time process that will make future loads instant.
            </p>
            
            {migrating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Migrating data...</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-left max-h-48 overflow-y-auto">
                  {migrationLog.map((log, i) => (
                    <p key={i} className="text-sm text-gray-600 font-mono">{log}</p>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={handleMigration}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Zap className="w-5 h-5" />
                Aggregate Existing Data
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              {currentZone?.name} Performance Metrics
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Month/Year Selector */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11)
                    setSelectedYear(selectedYear - 1)
                  } else {
                    setSelectedMonth(selectedMonth - 1)
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0)
                    setSelectedYear(selectedYear + 1)
                  } else {
                    setSelectedMonth(selectedMonth + 1)
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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

        {/* Stats Cards - Key Monthly Report Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Total Members */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 font-semibold">All Time</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalMembers}</h3>
            <p className="text-sm text-gray-600 mt-1">Registered Members</p>
          </div>

          {/* Total Visits/Sessions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {(selectedSummary?.totalSessions || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Visits</p>
          </div>

          {/* Page Views */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {(selectedSummary?.totalPageViews || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Page Views</p>
          </div>

          {/* Total Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {(selectedSummary?.totalEvents || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Events</p>
          </div>
        </div>

        {/* Device Breakdown Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {(selectedSummary?.desktopSessions || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Desktop Visits</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {(selectedSummary?.mobileSessions || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Mobile Visits</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Tablet className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {(selectedSummary?.tabletSessions || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Tablet Visits</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sessions Trend Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Sessions Trend</h3>
              <span className="text-xs text-purple-600 font-semibold">Last 6 Months</span>
            </div>
            {sessionsChartData.length > 0 ? (
              <BarChart data={sessionsChartData} maxValue={sessionsChartMax} color="purple" />
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-gray-500">No data available</p>
              </div>
            )}
          </div>

          {/* Device Breakdown Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Device Breakdown</h3>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            <DonutChart data={deviceChartData} />
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-600">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600">Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-600">Tablet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Monthly Breakdown</h3>
            <div className="text-sm text-gray-500">
              All Time: {allTimeTotals.events.toLocaleString()} events • {allTimeTotals.sessions.toLocaleString()} sessions
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Events</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Sessions</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Page Views</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummaries.length > 0 ? (
                  monthlySummaries.slice(0, 12).map((row, index) => {
                    const isSelected = row.year === selectedYear && row.month === selectedMonth
                    const monthName = new Date(row.year, row.month).toLocaleDateString('en-US', { month: 'short' })
                    return (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-purple-50' : ''}`}
                        onClick={() => {
                          setSelectedYear(row.year)
                          setSelectedMonth(row.month)
                        }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isSelected && <div className="w-2 h-2 bg-purple-600 rounded-full"></div>}
                            <span className={`text-sm ${isSelected ? 'font-semibold text-purple-600' : 'text-gray-900'}`}>
                              {monthName} {row.year}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-gray-900">{row.totalEvents.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-sm text-gray-900">{row.totalSessions.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-sm text-gray-900">{row.totalPageViews.toLocaleString()}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                      No monthly data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Pages & Browsers with Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Pages */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Popular Pages</h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            {popularPages.length > 0 ? (
              <HorizontalBarChart 
                data={popularPages.map(p => ({ label: p.page, value: p.views }))} 
                color="purple" 
              />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No page views yet</p>
            )}
          </div>

          {/* Top Browsers */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Browsers</h3>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            {topBrowsers.length > 0 ? (
              <HorizontalBarChart 
                data={topBrowsers.map(b => ({ label: b.browser, value: b.count }))} 
                color="orange" 
              />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No browser data yet</p>
            )}
          </div>
        </div>

        {/* Geography Row with Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Countries</h3>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            {topCountries.length > 0 ? (
              <HorizontalBarChart 
                data={topCountries.map(c => ({ label: c.country, value: c.sessions }))} 
                color="blue" 
              />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No geography data yet</p>
            )}
          </div>

          {/* Top Cities */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Cities</h3>
              <span className="text-xs text-purple-600 font-semibold">This Month</span>
            </div>
            {topCities.length > 0 ? (
              <HorizontalBarChart 
                data={topCities.map(c => ({ label: c.city, value: c.sessions }))} 
                color="green" 
              />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No city data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
