// ============================================
// ANALYTICS MIGRATION API - BIG DATA APPROACH
// ============================================
// Like big companies: fetch raw data in TIME-BOUNDED CHUNKS
// Process one month at a time, not everything at once
// This prevents memory issues and allows incremental processing

import { NextRequest, NextResponse } from 'next/server'
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

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
  userIds: { [userId: string]: boolean } // Track unique user IDs
  updatedAt: Date
  createdAt: Date
}

function getMonthlyDocId(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function createEmptySummary(year: number, month: number): MonthlySummary {
  return {
    year,
    month,
    totalEvents: 0,
    totalSessions: 0,
    totalPageViews: 0,
    uniqueUsers: 0,
    desktopSessions: 0,
    mobileSessions: 0,
    tabletSessions: 0,
    pageViews: {},
    countries: {},
    cities: {},
    browsers: {},
    userIds: {}, // Track unique users
    updatedAt: new Date(),
    createdAt: new Date()
  }
}

// Get month boundaries for a specific year/month
function getMonthBoundaries(year: number, month: number) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return {
    start: startDate.getTime(),
    end: endDate.getTime()
  }
}

// Process a single month's data - THE BIG COMPANY WAY
async function processMonth(year: number, month: number): Promise<{
  events: number
  sessions: number
  summary: MonthlySummary
}> {
  const docId = getMonthlyDocId(year, month)
  const docRef = doc(db, 'analytics_monthly', docId)
  const { start, end } = getMonthBoundaries(year, month)
  
  // Get existing summary or create new
  const existingDoc = await getDoc(docRef)
  const summary: MonthlySummary = existingDoc.exists() 
    ? existingDoc.data() as MonthlySummary
    : createEmptySummary(year, month)
  
  let eventsProcessed = 0
  let sessionsProcessed = 0
  const BATCH_SIZE = 500
  
  // Reset counts for fresh aggregation of this month
  summary.totalEvents = 0
  summary.totalSessions = 0
  summary.totalPageViews = 0
  summary.uniqueUsers = 0
  summary.desktopSessions = 0
  summary.mobileSessions = 0
  summary.tabletSessions = 0
  summary.pageViews = {}
  summary.countries = {}
  summary.cities = {}
  summary.browsers = {}
  summary.userIds = {} // Reset unique users tracking
  
  // Process EVENTS for this month only (time-bounded query)
  let lastEventDoc: any = null
  let hasMoreEvents = true
  
  while (hasMoreEvents) {
    let eventsQuery = lastEventDoc
      ? query(
          collection(db, 'analytics_events'),
          where('timestamp', '>=', start),
          where('timestamp', '<=', end),
          orderBy('timestamp', 'asc'),
          startAfter(lastEventDoc),
          limit(BATCH_SIZE)
        )
      : query(
          collection(db, 'analytics_events'),
          where('timestamp', '>=', start),
          where('timestamp', '<=', end),
          orderBy('timestamp', 'asc'),
          limit(BATCH_SIZE)
        )
    
    const eventsSnapshot = await getDocs(eventsQuery)
    
    if (eventsSnapshot.docs.length === 0) {
      hasMoreEvents = false
      break
    }
    
    for (const docSnap of eventsSnapshot.docs) {
      const event = docSnap.data()
      summary.totalEvents++
      eventsProcessed++
      
      if (event.type === 'page_view' && event.page) {
        summary.totalPageViews++
        const pageKey = String(event.page).replace(/\//g, '_').replace(/\./g, '_')
        summary.pageViews[pageKey] = (summary.pageViews[pageKey] || 0) + 1
      }
    }
    
    lastEventDoc = eventsSnapshot.docs[eventsSnapshot.docs.length - 1]
    if (eventsSnapshot.docs.length < BATCH_SIZE) hasMoreEvents = false
  }
  
  // Process SESSIONS for this month only (time-bounded query)
  let lastSessionDoc: any = null
  let hasMoreSessions = true
  
  while (hasMoreSessions) {
    let sessionsQuery = lastSessionDoc
      ? query(
          collection(db, 'analytics_sessions'),
          where('startTime', '>=', start),
          where('startTime', '<=', end),
          orderBy('startTime', 'asc'),
          startAfter(lastSessionDoc),
          limit(BATCH_SIZE)
        )
      : query(
          collection(db, 'analytics_sessions'),
          where('startTime', '>=', start),
          where('startTime', '<=', end),
          orderBy('startTime', 'asc'),
          limit(BATCH_SIZE)
        )
    
    const sessionsSnapshot = await getDocs(sessionsQuery)
    
    if (sessionsSnapshot.docs.length === 0) {
      hasMoreSessions = false
      break
    }
    
    for (const docSnap of sessionsSnapshot.docs) {
      const session = docSnap.data()
      summary.totalSessions++
      sessionsProcessed++
      
      // Track unique users by visitorId or visitorFingerprint or sessionId
      const visitorId = session.visitorId || session.visitorFingerprint || session.userId || docSnap.id
      if (visitorId && !summary.userIds[visitorId]) {
        summary.userIds[visitorId] = true
      }
      
      // Device type
      const deviceType = String(session.deviceType || '').toLowerCase()
      if (deviceType === 'desktop') summary.desktopSessions++
      else if (deviceType === 'mobile') summary.mobileSessions++
      else if (deviceType === 'tablet') summary.tabletSessions++
      
      // Geography
      if (session.country) {
        const countryKey = String(session.country).replace(/\./g, '_').replace(/\//g, '_')
        summary.countries[countryKey] = (summary.countries[countryKey] || 0) + 1
      }
      if (session.city) {
        const cityKey = String(session.city).replace(/\./g, '_').replace(/\//g, '_')
        summary.cities[cityKey] = (summary.cities[cityKey] || 0) + 1
      }
      
      // Browser
      if (session.browser) {
        const browserKey = String(session.browser).replace(/\./g, '_').replace(/\//g, '_')
        summary.browsers[browserKey] = (summary.browsers[browserKey] || 0) + 1
      }
    }
    
    lastSessionDoc = sessionsSnapshot.docs[sessionsSnapshot.docs.length - 1]
    if (sessionsSnapshot.docs.length < BATCH_SIZE) hasMoreSessions = false
  }
  
  // Calculate unique users count from the userIds map
  summary.uniqueUsers = Object.keys(summary.userIds).length
  
  // Update timestamps
  summary.updatedAt = new Date()
  
  // Save the monthly summary (don't save the full userIds map to save space, just the count)
  const summaryToSave = {
    ...summary,
    userIds: {} // Clear the map, we only need the count
  }
  await setDoc(docRef, summaryToSave)
  
  return { events: eventsProcessed, sessions: sessionsProcessed, summary }
}

// POST: Process a specific month OR auto-detect months to process
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { year, month, autoDetect } = body
    
    // If specific month provided, process just that month
    if (typeof year === 'number' && typeof month === 'number') {
      console.log(`📊 Processing ${year}-${month + 1}...`)
      const result = await processMonth(year, month)
      
      return NextResponse.json({
        success: true,
        message: `Processed ${getMonthlyDocId(year, month)}`,
        totalEvents: result.events,
        totalSessions: result.sessions,
        monthsProcessed: 1
      })
    }
    
    // Auto-detect: find all months with data and process them
    if (autoDetect) {
      console.log('📊 Auto-detecting months with data...')
      
      // Get date range from raw data (sample first and last docs)
      const oldestEventQuery = query(
        collection(db, 'analytics_events'),
        orderBy('timestamp', 'asc'),
        limit(1)
      )
      const newestEventQuery = query(
        collection(db, 'analytics_events'),
        orderBy('timestamp', 'desc'),
        limit(1)
      )
      
      const [oldestSnap, newestSnap] = await Promise.all([
        getDocs(oldestEventQuery),
        getDocs(newestEventQuery)
      ])
      
      if (oldestSnap.empty || newestSnap.empty) {
        return NextResponse.json({
          success: true,
          message: 'No analytics data found to process',
          totalEvents: 0,
          totalSessions: 0,
          monthsProcessed: 0
        })
      }
      
      const oldestTimestamp = oldestSnap.docs[0].data().timestamp
      const newestTimestamp = newestSnap.docs[0].data().timestamp
      
      const startDate = new Date(oldestTimestamp)
      const endDate = new Date(newestTimestamp)
      
      // Generate list of months to process
      const monthsToProcess: { year: number; month: number }[] = []
      let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      
      while (current <= endDate) {
        monthsToProcess.push({ year: current.getFullYear(), month: current.getMonth() })
        current.setMonth(current.getMonth() + 1)
      }
      
      console.log(`📊 Found ${monthsToProcess.length} months to process`)
      
      // Process each month sequentially (prevents memory overload)
      let totalEvents = 0
      let totalSessions = 0
      const processedMonths: string[] = []
      
      for (const { year: y, month: m } of monthsToProcess) {
        console.log(`📊 Processing ${y}-${m + 1}...`)
        const result = await processMonth(y, m)
        totalEvents += result.events
        totalSessions += result.sessions
        processedMonths.push(getMonthlyDocId(y, m))
      }
      
      return NextResponse.json({
        success: true,
        message: `Processed ${monthsToProcess.length} months`,
        totalEvents,
        totalSessions,
        monthsProcessed: monthsToProcess.length,
        months: processedMonths
      })
    }
    
    // Default: process current month only
    const now = new Date()
    const result = await processMonth(now.getFullYear(), now.getMonth())
    
    return NextResponse.json({
      success: true,
      message: `Processed current month`,
      totalEvents: result.events,
      totalSessions: result.sessions,
      monthsProcessed: 1
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET: Check migration status and available summaries
export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'analytics_monthly'))
    const summaries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      count: summaries.length,
      summaries: summaries.map(s => ({
        id: s.id,
        totalEvents: (s as any).totalEvents,
        totalSessions: (s as any).totalSessions,
        updatedAt: (s as any).updatedAt
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
