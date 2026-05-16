import { FirebaseDatabaseService } from './firebase-database';

interface SimplifiedAnalyticsRecord {
  id: string;
  year: number;
  month: number;
  totalSignups: number;
  totalLogins: number;
  totalFeatureEngagements: number;
  totalSongMinistries: number; // For the new ministry tracking
  uniqueUsers: number;
  pageViews: { [page: string]: number };
  countries: { [country: string]: number };
  cities: { [city: string]: number };
  browsers: { [browser: string]: number };
  featureEngagements: { [feature: string]: number };
  songMinistries: { [songId: string]: number };
  updatedAt: any;
  createdAt: any;
}

export class SimplifiedAnalyticsService {
  
  private static getMonthlyDocId(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }

  static async incrementSignups(count: number = 1) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const docId = this.getMonthlyDocId(year, month);
    
    const updateData = {
      totalSignups: ((await this.getMonthlySummary(year, month))?.totalSignups || 0) + count,
      updatedAt: new Date().toISOString()
    };
    
    try {
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, updateData);
    } catch (error) {
      // If document doesn't exist, create it
      const newRecord: SimplifiedAnalyticsRecord = {
        id: docId,
        year,
        month,
        totalSignups: count,
        totalLogins: 0,
        totalFeatureEngagements: 0,
        totalSongMinistries: 0,
        uniqueUsers: 0,
        pageViews: {},
        countries: {},
        cities: {},
        browsers: {},
        featureEngagements: {},
        songMinistries: {},
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, newRecord);
    }
  }

  static async incrementLogins(count: number = 1) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const docId = this.getMonthlyDocId(year, month);
    
    const updateData = {
      totalLogins: ((await this.getMonthlySummary(year, month))?.totalLogins || 0) + count,
      updatedAt: new Date().toISOString()
    };
    
    try {
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, updateData);
    } catch (error) {
      // If document doesn't exist, create it
      const newRecord: SimplifiedAnalyticsRecord = {
        id: docId,
        year,
        month,
        totalSignups: 0,
        totalLogins: count,
        totalFeatureEngagements: 0,
        totalSongMinistries: 0,
        uniqueUsers: 0,
        pageViews: {},
        countries: {},
        cities: {},
        browsers: {},
        featureEngagements: {},
        songMinistries: {},
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, newRecord);
    }
  }

  static async incrementFeatureEngagements(featureName: string, count: number = 1) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const docId = this.getMonthlyDocId(year, month);
    
    const current = await this.getMonthlySummary(year, month);
    const updateData: any = {
      totalFeatureEngagements: (current?.totalFeatureEngagements || 0) + count,
      [`featureEngagements.${featureName.replace(/\./g, '_')}`]: (current?.featureEngagements?.[featureName.replace(/\./g, '_')] || 0) + count,
      updatedAt: new Date().toISOString()
    };
    
    try {
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, updateData);
    } catch (error) {
      // If document doesn't exist, create it
      const newRecord: SimplifiedAnalyticsRecord = {
        id: docId,
        year,
        month,
        totalSignups: 0,
        totalLogins: 0,
        totalFeatureEngagements: count,
        totalSongMinistries: 0,
        uniqueUsers: 0,
        pageViews: {},
        countries: {},
        cities: {},
        browsers: {},
        featureEngagements: { [featureName.replace(/\./g, '_')]: count },
        songMinistries: {},
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, newRecord);
    }
  }

  static async incrementSongMinistries(songId: string, songTitle: string, count: number = 1) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const docId = this.getMonthlyDocId(year, month);
    
    const current = await this.getMonthlySummary(year, month);
    const updateData: any = {
      totalSongMinistries: (current?.totalSongMinistries || 0) + count,
      [`songMinistries.${songId.replace(/\./g, '_')}`]: (current?.songMinistries?.[songId.replace(/\./g, '_')] || 0) + count,
      updatedAt: new Date().toISOString()
    };
    
    try {
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, updateData);
    } catch (error) {
      // If document doesn't exist, create it
      const newRecord: SimplifiedAnalyticsRecord = {
        id: docId,
        year,
        month,
        totalSignups: 0,
        totalLogins: 0,
        totalFeatureEngagements: 0,
        totalSongMinistries: count,
        uniqueUsers: 0,
        pageViews: {},
        countries: {},
        cities: {},
        browsers: {},
        featureEngagements: {},
        songMinistries: { [songId.replace(/\./g, '_')]: count },
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, newRecord);
    }
  }

  static async trackLocation(country: string, city: string) {
    if (!country) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const docId = this.getMonthlyDocId(year, month);
    
    const safeCountry = country.replace(/[.\/]/g, '_');
    const safeCity = city ? city.replace(/[.\/]/g, '_') : 'Unknown';

    const current = await this.getMonthlySummary(year, month);
    const updateData: any = {
      [`countries.${safeCountry}`]: (current?.countries?.[safeCountry] || 0) + 1,
      [`cities.${safeCity}`]: (current?.cities?.[safeCity] || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    
    try {
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, updateData);
    } catch (error) {
      // If document doesn't exist, create it
      const newRecord: SimplifiedAnalyticsRecord = {
        id: docId,
        year,
        month,
        totalSignups: 0,
        totalLogins: 0,
        totalFeatureEngagements: 0,
        totalSongMinistries: 0,
        uniqueUsers: 0,
        pageViews: {},
        countries: { [safeCountry]: 1 },
        cities: { [safeCity]: 1 },
        browsers: {},
        featureEngagements: {},
        songMinistries: {},
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await FirebaseDatabaseService.updateDocument('simplified_analytics', docId, newRecord);
    }
  }

  // Get user's location using IP geolocation API
  static async getUserLocation(): Promise<{ country: string; city: string } | null> {
    try {
      // Using ip-api.com (free, no API key needed, 45 requests/minute limit)
      const response = await fetch('http://ip-api.com/json/?fields=country,city');
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown'
      };
    } catch (error) {
 console.error('Error getting user location:', error);
      return null;
    }
  }

  // Track location on login/signup
  static async trackUserLocation() {
    try {
      const location = await this.getUserLocation();
      if (location) {
        await this.trackLocation(location.country, location.city);
      }
    } catch (error) {
 console.error('Error tracking user location:', error);
    }
  }

  static async getMonthlySummary(year: number, month: number): Promise<SimplifiedAnalyticsRecord | null> {
    const docId = this.getMonthlyDocId(year, month);
    const docSnap = await FirebaseDatabaseService.getDocument('simplified_analytics', docId);
    
    if (!docSnap) return null;
    
    const data = docSnap;
    return {
      id: docId,
      year: data.year,
      month: data.month,
      totalSignups: data.totalSignups || 0,
      totalLogins: data.totalLogins || 0,
      totalFeatureEngagements: data.totalFeatureEngagements || 0,
      totalSongMinistries: data.totalSongMinistries || 0,
      uniqueUsers: data.uniqueUsers || 0,
      pageViews: data.pageViews || {},
      countries: data.countries || {},
      cities: data.cities || {},
      browsers: data.browsers || {},
      featureEngagements: data.featureEngagements || {},
      songMinistries: data.songMinistries || {},
      updatedAt: data.updatedAt,
      createdAt: data.createdAt
    };
  }

  static async getAllMonthlySummaries(): Promise<SimplifiedAnalyticsRecord[]> {
    try {
      const snapshot = await FirebaseDatabaseService.getCollection('simplified_analytics');
      
      const records = snapshot.map((data: any) => {
        return {
          id: data.id,
          year: data.year,
          month: data.month,
          totalSignups: data.totalSignups || 0,
          totalLogins: data.totalLogins || 0,
          totalFeatureEngagements: data.totalFeatureEngagements || 0,
          totalSongMinistries: data.totalSongMinistries || 0,
          uniqueUsers: data.uniqueUsers || 0,
          pageViews: data.pageViews || {},
          countries: data.countries || {},
          cities: data.cities || {},
          browsers: data.browsers || {},
          featureEngagements: data.featureEngagements || {},
          songMinistries: data.songMinistries || {},
          updatedAt: data.updatedAt,
          createdAt: data.createdAt
        };
      });
      
      return records.sort((a: any, b: any) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    } catch (error) {
 console.error('Error fetching monthly summaries:', error);
      return [];
    }
  }
}