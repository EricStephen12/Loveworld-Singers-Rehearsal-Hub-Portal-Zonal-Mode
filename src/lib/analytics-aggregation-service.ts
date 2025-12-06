// ============================================
// ANALYTICS AGGREGATION SERVICE
// ============================================
// Big companies pre-aggregate data on write, not read.
// This service maintains monthly summaries that are updated
// when events are logged, so reading is instant.

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  increment,
  collection,
  getDocs
} from 'firebase/firestore'
import { db } from './firebase-setup'

// Monthly summary document structure
interface MonthlySummary {
  year: number
  month: number // 0-11
  totalEvents: number
  totalSessions: number
  totalPageViews: number
  uniqueUsers: number
  // Device breakdown
  desktopSessions: number
  mobileSessions: number
  tabletSessions: number
  // Top data (stored as maps for easy increment)
  pageViews: { [page: string]: number }
  countries: { [country: string]: number }
  cities: { [city: string]: number }
  browsers: { [browser: string]: number }
  // Timestamps
  updatedAt: Date
  createdAt: Date
}

export class AnalyticsAggregationService {
  
  // Get the document ID for a monthly summary
  private static getMonthlyDocId(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}`
  }

  // Get or create a monthly summary document
  static async getOrCreateMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    const docId = this.getMonthlyDocId(year, month)
    const docRef = doc(db, 'analytics_monthly', docId)
    
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as MonthlySummary
    }
    
    // Create new summary
    const newSummary: MonthlySummary = {
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
      updatedAt: new Date(),
      createdAt: new Date()
    }
    
    await setDoc(docRef, newSummary)
    return newSummary
  }

  // Increment event count (call this when logging an event)
  static async incrementEvent(timestamp: number, eventType: string, page?: string) {
    const date = new Date(timestamp)
    const docId = this.getMonthlyDocId(date.getFullYear(), date.getMonth())
    const docRef = doc(db, 'analytics_monthly', docId)
    
    try {
      const updates: any = {
        totalEvents: increment(1),
        updatedAt: new Date()
      }
      
      if (eventType === 'page_view' && page) {
        updates.totalPageViews = increment(1)
        updates[`pageViews.${page.replace(/\//g, '_')}`] = increment(1)
      }
      
      await updateDoc(docRef, updates)
    } catch (error) {
      // Document might not exist, create it first
      await this.getOrCreateMonthlySummary(date.getFullYear(), date.getMonth())
      // Retry the update
      await this.incrementEvent(timestamp, eventType, page)
    }
  }

  // Increment session count (call this when a session starts)
  static async incrementSession(
    timestamp: number, 
    deviceType?: string, 
    country?: string, 
    city?: string, 
    browser?: string
  ) {
    const date = new Date(timestamp)
    const docId = this.getMonthlyDocId(date.getFullYear(), date.getMonth())
    const docRef = doc(db, 'analytics_monthly', docId)
    
    try {
      const updates: any = {
        totalSessions: increment(1),
        updatedAt: new Date()
      }
      
      // Device type
      if (deviceType === 'desktop') updates.desktopSessions = increment(1)
      else if (deviceType === 'mobile') updates.mobileSessions = increment(1)
      else if (deviceType === 'tablet') updates.tabletSessions = increment(1)
      
      // Geography
      if (country) updates[`countries.${country.replace(/\./g, '_')}`] = increment(1)
      if (city) updates[`cities.${city.replace(/\./g, '_')}`] = increment(1)
      
      // Browser
      if (browser) updates[`browsers.${browser.replace(/\./g, '_')}`] = increment(1)
      
      await updateDoc(docRef, updates)
    } catch (error) {
      // Document might not exist, create it first
      await this.getOrCreateMonthlySummary(date.getFullYear(), date.getMonth())
      // Retry
      await this.incrementSession(timestamp, deviceType, country, city, browser)
    }
  }

  // Get all monthly summaries (for the analytics dashboard)
  static async getAllMonthlySummaries(): Promise<MonthlySummary[]> {
    try {
      // Fetch all documents without ordering (avoids index requirement)
      const snapshot = await getDocs(collection(db, 'analytics_monthly'))
      
      console.log(`📊 [Analytics] Found ${snapshot.docs.length} monthly summaries`)
      
      const summaries = snapshot.docs.map(doc => {
        const data = doc.data() as MonthlySummary
        console.log(`  📅 ${doc.id}: ${data.totalEvents} events, ${data.totalSessions} sessions`)
        return data
      })
      
      // Sort in JavaScript (newest first)
      return summaries.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
    } catch (error) {
      console.error('Error fetching monthly summaries:', error)
      return []
    }
  }

  // Get summary for a specific month
  static async getMonthlySummary(year: number, month: number): Promise<MonthlySummary | null> {
    const docId = this.getMonthlyDocId(year, month)
    const docRef = doc(db, 'analytics_monthly', docId)
    
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as MonthlySummary
    }
    
    return null
  }

  // Refresh a specific month's data via API (server-side processing)
  static async refreshMonth(year: number, month: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/analytics/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month })
      })
      
      const result = await response.json()
      return {
        success: result.success,
        message: result.message || result.error
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Full migration via API (processes all months server-side)
  static async migrateAllData(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/analytics/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoDetect: true })
      })
      
      const result = await response.json()
      return {
        success: result.success,
        message: result.message || result.error
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
