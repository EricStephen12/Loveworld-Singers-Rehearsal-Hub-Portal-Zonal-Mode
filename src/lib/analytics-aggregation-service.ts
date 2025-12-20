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
  updatedAt: Date
  createdAt: Date
}

export class AnalyticsAggregationService {
  
  private static getMonthlyDocId(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}`
  }

  static async getOrCreateMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    const docId = this.getMonthlyDocId(year, month)
    const docRef = doc(db, 'analytics_monthly', docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as MonthlySummary
    }
    
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
      await this.getOrCreateMonthlySummary(date.getFullYear(), date.getMonth())
      await this.incrementEvent(timestamp, eventType, page)
    }
  }

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
      
      if (deviceType === 'desktop') updates.desktopSessions = increment(1)
      else if (deviceType === 'mobile') updates.mobileSessions = increment(1)
      else if (deviceType === 'tablet') updates.tabletSessions = increment(1)
      
      if (country) updates[`countries.${country.replace(/\./g, '_')}`] = increment(1)
      if (city) updates[`cities.${city.replace(/\./g, '_')}`] = increment(1)
      if (browser) updates[`browsers.${browser.replace(/\./g, '_')}`] = increment(1)
      
      await updateDoc(docRef, updates)
    } catch (error) {
      await this.getOrCreateMonthlySummary(date.getFullYear(), date.getMonth())
      await this.incrementSession(timestamp, deviceType, country, city, browser)
    }
  }

  static async getAllMonthlySummaries(): Promise<MonthlySummary[]> {
    try {
      const snapshot = await getDocs(collection(db, 'analytics_monthly'))
      
      const summaries = snapshot.docs.map(doc => doc.data() as MonthlySummary)
      
      return summaries.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
    } catch (error) {
      console.error('Error fetching monthly summaries:', error)
      return []
    }
  }

  static async getMonthlySummary(year: number, month: number): Promise<MonthlySummary | null> {
    const docId = this.getMonthlyDocId(year, month)
    const docRef = doc(db, 'analytics_monthly', docId)
    const docSnap = await getDoc(docRef)
    
    return docSnap.exists() ? docSnap.data() as MonthlySummary : null
  }

  static async refreshMonth(year: number, month: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/analytics/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month })
      })
      
      const result = await response.json()
      return { success: result.success, message: result.message || result.error }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async migrateAllData(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/analytics/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoDetect: true })
      })
      
      const result = await response.json()
      return { success: result.success, message: result.message || result.error }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}
