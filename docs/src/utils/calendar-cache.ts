// Calendar events caching utility
import { CalendarEvent } from '@/app/pages/calendar/_lib/firebase-calendar-service'

const CACHE_PREFIX = 'calendar-cache-'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CachedData<T> {
  data: T
  timestamp: number
  zoneId: string
}

export class CalendarCache {
  private static getCacheKey(zoneId: string): string {
    return `${CACHE_PREFIX}${zoneId}`
  }

  // Save events to localStorage
  static saveEvents(zoneId: string, events: CalendarEvent[]): void {
    try {
      const cached: CachedData<CalendarEvent[]> = {
        data: events,
        timestamp: Date.now(),
        zoneId
      }
      localStorage.setItem(this.getCacheKey(zoneId), JSON.stringify(cached))
      console.log(`💾 Cached ${events.length} calendar events for zone ${zoneId}`)
    } catch (error) {
      console.error('Failed to cache calendar events:', error)
    }
  }

  // Load events from localStorage
  static loadEvents(zoneId: string): CalendarEvent[] | null {
    try {
      const cached = localStorage.getItem(this.getCacheKey(zoneId))
      if (!cached) {
        console.log('📭 No cached calendar events found')
        return null
      }

      const parsed: CachedData<CalendarEvent[]> = JSON.parse(cached)
      
      // Check if cache is still valid
      const age = Date.now() - parsed.timestamp
      if (age > CACHE_DURATION) {
        console.log('⏰ Cached calendar events expired')
        this.clearEvents(zoneId)
        return null
      }

      // Check if cache is for the correct zone
      if (parsed.zoneId !== zoneId) {
        console.log('🏢 Cached events are for different zone')
        this.clearEvents(zoneId)
        return null
      }

      console.log(`⚡ Cache hit: ${parsed.data.length} calendar events loaded instantly`)
      return parsed.data
    } catch (error) {
      console.error('Failed to load cached calendar events:', error)
      return null
    }
  }

  // Clear cached events
  static clearEvents(zoneId: string): void {
    try {
      localStorage.removeItem(this.getCacheKey(zoneId))
      console.log('🗑️ Cleared cached calendar events')
    } catch (error) {
      console.error('Failed to clear cached calendar events:', error)
    }
  }

  // Clear all calendar caches
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      console.log('🗑️ Cleared all calendar caches')
    } catch (error) {
      console.error('Failed to clear all calendar caches:', error)
    }
  }
}
