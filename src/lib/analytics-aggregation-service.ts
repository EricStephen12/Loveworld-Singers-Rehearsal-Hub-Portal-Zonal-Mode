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
  totalSignups: number
  totalLogins: number
  totalFeatureEngagements: number
  uniqueUsers: number
  pageViews: { [page: string]: number }
  countries: { [country: string]: number }
  cities: { [city: string]: number }
  browsers: { [browser: string]: number }
  featureEngagements: { [feature: string]: number }
  songAccesses: { [songId: string]: number }
  updatedAt: Date
  createdAt: Date
  // Old fields that might still exist in database
  totalSessions?: number
  totalPageViews?: number
  desktopSessions?: number
  mobileSessions?: number
  tabletSessions?: number
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
      const data = docSnap.data() as any;
      
      // Migrate old data structure to new structure if needed
      const migratedSummary: MonthlySummary = {
        year: data.year,
        month: data.month,
        totalEvents: data.totalEvents || 0,
        totalSignups: data.totalSignups || 0,
        totalLogins: data.totalLogins || 0,
        totalFeatureEngagements: data.totalFeatureEngagements || 0,
        uniqueUsers: data.uniqueUsers || 0,
        pageViews: data.pageViews || {},
        countries: data.countries || {},
        cities: data.cities || {},
        browsers: data.browsers || {},
        featureEngagements: data.featureEngagements || {},
        songAccesses: data.songAccesses || {},
        updatedAt: data.updatedAt || new Date(),
        createdAt: data.createdAt || new Date(),
        // Keep old fields for compatibility
        totalSessions: data.totalSessions,
        totalPageViews: data.totalPageViews,
        desktopSessions: data.desktopSessions,
        mobileSessions: data.mobileSessions,
        tabletSessions: data.tabletSessions,
      };
      
      return migratedSummary;
    }
    
    const newSummary: MonthlySummary = {
      year,
      month,
      totalEvents: 0,
      totalSignups: 0,
      totalLogins: 0,
      totalFeatureEngagements: 0,
      uniqueUsers: 0,
      pageViews: {},
      countries: {},
      cities: {},
      browsers: {},
      featureEngagements: {},
      songAccesses: {},
      updatedAt: new Date(),
      createdAt: new Date()
    }
    
    await setDoc(docRef, newSummary)
    return newSummary
  }

  static async incrementEvent(timestamp: number, eventType: 'signup' | 'login' | 'feature_engagement', page?: string, featureName?: string, songId?: string) {
    const date = new Date(timestamp)
    const docId = this.getMonthlyDocId(date.getFullYear(), date.getMonth())
    const docRef = doc(db, 'analytics_monthly', docId)
    
    try {
      const updates: any = {
        totalEvents: increment(1),
        updatedAt: new Date()
      }
      
      switch (eventType) {
        case 'signup':
          updates.totalSignups = increment(1);
          break;
        case 'login':
          updates.totalLogins = increment(1);
          break;
        case 'feature_engagement':
          updates.totalFeatureEngagements = increment(1);
          if (page) {
            updates[`pageViews.${page.replace(/\//g, '_')}`] = increment(1)
          }
          if (featureName) {
            updates[`featureEngagements.${featureName.replace(/\//g, '_')}`] = increment(1)
          }
          if (songId) {
            updates[`songAccesses.${songId.replace(/\//g, '_')}`] = increment(1)
          }
          break;
      }
      
      await updateDoc(docRef, updates)
    } catch (error) {
      await this.getOrCreateMonthlySummary(date.getFullYear(), date.getMonth())
      await this.incrementEvent(timestamp, eventType, page, featureName, songId)
    }
  }



  static async getAllMonthlySummaries(): Promise<MonthlySummary[]> {
    try {
      const snapshot = await getDocs(collection(db, 'analytics_monthly'))
      
      const summaries = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        
        // Migrate old data structure to new structure if needed
        return {
          year: data.year,
          month: data.month,
          totalEvents: data.totalEvents || 0,
          totalSignups: data.totalSignups || 0,
          totalLogins: data.totalLogins || 0,
          totalFeatureEngagements: data.totalFeatureEngagements || 0,
          uniqueUsers: data.uniqueUsers || 0,
          pageViews: data.pageViews || {},
          countries: data.countries || {},
          cities: data.cities || {},
          browsers: data.browsers || {},
          featureEngagements: data.featureEngagements || {},
          songAccesses: data.songAccesses || {},
          updatedAt: data.updatedAt || new Date(),
          createdAt: data.createdAt || new Date(),
          // Keep old fields for compatibility
          totalSessions: data.totalSessions,
          totalPageViews: data.totalPageViews,
          desktopSessions: data.desktopSessions,
          mobileSessions: data.mobileSessions,
          tabletSessions: data.tabletSessions,
        };
      });
      
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
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data() as any;
    
    // Ensure the data has the new structure, migrate old data if needed
    const summary: MonthlySummary = {
      year: data.year,
      month: data.month,
      totalEvents: data.totalEvents || 0,
      totalSignups: data.totalSignups || 0,
      totalLogins: data.totalLogins || 0,
      totalFeatureEngagements: data.totalFeatureEngagements || 0,
      uniqueUsers: data.uniqueUsers || 0,
      pageViews: data.pageViews || {},
      countries: data.countries || {},
      cities: data.cities || {},
      browsers: data.browsers || {},
      featureEngagements: data.featureEngagements || {},
      songAccesses: data.songAccesses || {},
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
      // Ensure old fields are handled properly for compatibility
      totalSessions: data.totalSessions,
      totalPageViews: data.totalPageViews,
      desktopSessions: data.desktopSessions,
      mobileSessions: data.mobileSessions,
      tabletSessions: data.tabletSessions,
    };
    
    return summary;
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
