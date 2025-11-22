// Analytics tracking utility
import { FirebaseDatabaseService } from '@/lib/firebase-database';

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'session_start' | 'session_end' | 'click' | 'scroll' | 'download';
  page: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  userAgent: string;
  referrer?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  country?: string;
  city?: string;
  duration?: number; // for session_end events
  metadata?: Record<string, any>;
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  pageViews: number;
  pages: string[];
  duration?: number;
  userId?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  country?: string;
  city?: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private startTime: number;
  private pageViews: number = 0;
  private pages: string[] = [];
  private isTracking: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private async getLocation(): Promise<{ country?: string; city?: string }> {
    try {
      // Using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city
      };
    } catch (error) {
      console.warn('Could not fetch location data:', error);
      return {};
    }
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;
    
    this.isTracking = true;
    // Track session start immediately
    this.trackEvent('session_start', {
      page: window.location.pathname,
      referrer: document.referrer
    });
    // Store session start in Firebase immediately
    this.storeSessionStart();
    this.trackPageView();
    this.setupEventListeners();
    this.setupSessionEnd();
  }

  private async storeSessionStart(): Promise<void> {
    try {
      const location = await this.getLocation();
      const sessionData: Partial<SessionData> = {
        sessionId: this.sessionId,
        startTime: this.startTime,
        pageViews: 0,
        pages: [],
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        ...location
      };
      // Store initial session data
      await FirebaseDatabaseService.createDocument('analytics_sessions', this.sessionId, sessionData as any);
    } catch (error) {
      console.warn('Failed to store session start in Firebase:', error);
    }
  }

  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackSessionEnd();
      }
    });

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        const metadata: Record<string, any> = {
          element: target.tagName,
          text: target.textContent?.slice(0, 50) || ''
        };
        
        // Only add href if it exists (for anchor tags)
        if (target.tagName === 'A' && (target as HTMLAnchorElement).href) {
          metadata.href = (target as HTMLAnchorElement).href;
        }
        
        this.trackEvent('click', metadata);
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.trackEvent('scroll', { depth: scrollDepth });
      }
    });
  }

  private setupSessionEnd(): void {
    // Track session end after 30 minutes of inactivity
    let inactivityTimer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.trackSessionEnd();
      }, 30 * 60 * 1000); // 30 minutes
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();
  }

  public trackPageView(page?: string): void {
    if (!this.isTracking) {
      // Re-initialize if tracking stopped
      this.initializeTracking();
      return;
    }

    const currentPage = page || window.location.pathname;
    this.pageViews++;
    this.pages.push(currentPage);

    this.trackEvent('page_view', {
      page: currentPage,
      title: document.title,
      referrer: document.referrer
    });

    // Update session page views in Firebase
    this.updateSessionPageViews();
  }

  private async updateSessionPageViews(): Promise<void> {
    try {
      await FirebaseDatabaseService.updateDocument('analytics_sessions', this.sessionId, {
        pageViews: this.pageViews,
        pages: [...new Set(this.pages)]
      } as any);
    } catch (error) {
      // Silently fail - session might not exist yet
    }
  }

  public trackEvent(type: AnalyticsEvent['type'], metadata?: Record<string, any>): void {
    if (!this.isTracking) return;

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      page: window.location.pathname,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      metadata
    };

    this.sendEvent(event);
  }

  public async trackSessionEnd(): Promise<void> {
    if (!this.isTracking) return;

    const duration = Date.now() - this.startTime;
    const location = await this.getLocation();

    const sessionData: SessionData = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: Date.now(),
      pageViews: this.pageViews,
      pages: [...new Set(this.pages)], // unique pages
      duration,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      ...location
    };

    this.trackEvent('session_end', {
      duration,
      pageViews: this.pageViews,
      uniquePages: sessionData.pages.length,
      ...location
    });

    // Update existing session data in Firebase (not create new)
    await this.updateSessionDataInFirebase(sessionData);
    
    this.isTracking = false;
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store event in Firebase
      await this.storeEventInFirebase(event);
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  private async storeEventInFirebase(event: AnalyticsEvent): Promise<void> {
    try {
      await FirebaseDatabaseService.createDocument('analytics_events', event.id, event as any);
    } catch (error) {
      console.warn('Failed to store analytics event in Firebase:', error);
    }
  }

  private async updateSessionDataInFirebase(sessionData: SessionData): Promise<void> {
    try {
      // Update existing session instead of creating new one
      await FirebaseDatabaseService.updateDocument('analytics_sessions', sessionData.sessionId, sessionData as any);
    } catch (error) {
      // If update fails, try to create (in case session start wasn't stored)
      try {
        await FirebaseDatabaseService.createDocument('analytics_sessions', sessionData.sessionId, sessionData as any);
      } catch (createError) {
        console.warn('Failed to update/create session data in Firebase:', createError);
      }
    }
  }

  public async getStoredEvents(): Promise<AnalyticsEvent[]> {
    try {
      const events = await FirebaseDatabaseService.getCollection('analytics_events');
      return (events as any) || [];
    } catch (error) {
      console.warn('Failed to get stored events from Firebase:', error);
      return [];
    }
  }

  public async getStoredSessions(): Promise<SessionData[]> {
    try {
      const sessions = await FirebaseDatabaseService.getCollection('analytics_sessions');
      return (sessions as any) || [];
    } catch (error) {
      console.warn('Failed to get stored sessions from Firebase:', error);
      return [];
    }
  }

  public async clearStoredData(): Promise<void> {
    try {
      // Note: This would require implementing a delete collection method in FirebaseDatabaseService
      console.warn('Clear data functionality needs to be implemented in FirebaseDatabaseService');
    } catch (error) {
      console.warn('Failed to clear stored data:', error);
    }
  }

  // Public method to get analytics data for the dashboard
  public async getAnalyticsData(dateRange: string = '7d'): Promise<any> {
    const events = await this.getStoredEvents();
    const sessions = await this.getStoredSessions();
    
    const now = Date.now();
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const cutoffTime = now - (daysBack * 24 * 60 * 60 * 1000);
    
    const filteredEvents = events.filter(event => event.timestamp >= cutoffTime);
    const filteredSessions = sessions.filter(session => session.startTime >= cutoffTime);
    
    // Calculate metrics
    const totalVisits = filteredSessions.length;
    const uniqueVisitors = new Set(filteredSessions.map(s => s.sessionId)).size;
    const pageViews = filteredEvents.filter(e => e.type === 'page_view').length;
    
    const totalDuration = filteredSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const averageSessionDuration = totalVisits > 0 ? totalDuration / totalVisits : 0;
    
    // Top pages
    const pageViewsByPage = filteredEvents
      .filter(e => e.type === 'page_view')
      .reduce((acc, event) => {
        acc[event.page] = (acc[event.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topPages = Object.entries(pageViewsByPage)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // Device types
    const deviceCounts = filteredSessions.reduce((acc, session) => {
      acc[session.deviceType] = (acc[session.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalDevices = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0);
    const deviceTypes = Object.entries(deviceCounts).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: totalDevices > 0 ? (count / totalDevices) * 100 : 0
    }));
    
    // Browser stats
    const browserCounts = filteredSessions.reduce((acc, session) => {
      acc[session.browser] = (acc[session.browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalBrowsers = Object.values(browserCounts).reduce((sum, count) => sum + count, 0);
    const browserStats = Object.entries(browserCounts).map(([browser, count]) => ({
      browser,
      count,
      percentage: totalBrowsers > 0 ? (count / totalBrowsers) * 100 : 0
    }));
    
    // Daily visits
    const dailyVisitsMap = new Map<string, { visits: number; uniqueVisitors: Set<string> }>();
    filteredSessions.forEach(session => {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      if (!dailyVisitsMap.has(date)) {
        dailyVisitsMap.set(date, { visits: 0, uniqueVisitors: new Set() });
      }
      const dayData = dailyVisitsMap.get(date)!;
      dayData.visits++;
      dayData.uniqueVisitors.add(session.sessionId);
    });
    
    const dailyVisits = Array.from(dailyVisitsMap.entries())
      .map(([date, data]) => ({
        date,
        visits: data.visits,
        uniqueVisitors: data.uniqueVisitors.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Hourly visits
    const hourlyVisitsMap = new Map<number, number>();
    filteredSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourlyVisitsMap.set(hour, (hourlyVisitsMap.get(hour) || 0) + 1);
    });
    
    const hourlyVisits = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      visits: hourlyVisitsMap.get(hour) || 0
    }));
    
    // Referrers
    const referrerCounts = filteredSessions.reduce((acc, session) => {
    const referrer = (session as any).referrer || 'Direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalReferrers = Object.values(referrerCounts).reduce((sum, count) => sum + count, 0);
    const referrers = Object.entries(referrerCounts).map(([source, count]) => ({
      source,
      count,
      percentage: totalReferrers > 0 ? (count / totalReferrers) * 100 : 0
    }));
    
    // Countries
    const countryCounts = filteredSessions.reduce((acc, session) => {
      const country = session.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalCountries = Object.values(countryCounts).reduce((sum, count) => sum + count, 0);
    const countries = Object.entries(countryCounts).map(([country, count]) => ({
      country,
      count,
      percentage: totalCountries > 0 ? (count / totalCountries) * 100 : 0
    }));
    
    return {
      totalVisits,
      uniqueVisitors,
      pageViews,
      averageSessionDuration: Math.round(averageSessionDuration / 1000), // Convert to seconds
      bounceRate: 0, // Would need more complex logic to calculate
      topPages,
      deviceTypes,
      browserStats,
      dailyVisits,
      hourlyVisits,
      referrers,
      countries
    };
  }
}

// Create singleton instance
export const analyticsTracker = new AnalyticsTracker();

// Export for use in components
export const trackPageView = (page?: string) => analyticsTracker.trackPageView(page);
export const trackEvent = (type: AnalyticsEvent['type'], metadata?: Record<string, any>) => 
  analyticsTracker.trackEvent(type, metadata);
export const getAnalyticsData = (dateRange?: string) => analyticsTracker.getAnalyticsData(dateRange);
export const clearAnalyticsData = () => analyticsTracker.clearStoredData();
