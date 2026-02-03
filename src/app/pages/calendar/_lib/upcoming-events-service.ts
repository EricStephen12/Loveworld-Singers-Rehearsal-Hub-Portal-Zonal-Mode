import { FirebaseDatabaseService } from '@/lib/firebase-database'
import moment from 'moment'
import { isHQGroup } from '@/config/zones'

export interface UpcomingEvent {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  image?: string // Ecard/banner image URL
  type: 'announcement' | 'event' | 'reminder' | 'meeting' | 'rehearsal'
  showInCarousel: boolean
  isGlobal?: boolean // Whether the event is visible to all zones
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// OPTIMIZED: Cache events for 30 minutes
const EVENTS_CACHE_KEY = 'lwsrh-upcoming-events-cache'
const EVENTS_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

interface EventsCache {
  data: UpcomingEvent[]
  timestamp: number
}

function getEventsCache(cacheKey: string): EventsCache | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null
    const data: EventsCache = JSON.parse(cached)
    if (Date.now() - data.timestamp > EVENTS_CACHE_TTL) {
      return null
    }
    return data
  } catch {
    return null
  }
}

function setEventsCache(cacheKey: string, data: UpcomingEvent[]) {
  if (typeof window === 'undefined') return
  try {
    const cache: EventsCache = { data, timestamp: Date.now() }
    localStorage.setItem(cacheKey, JSON.stringify(cache))
  } catch {
    // Ignore storage errors
  }
}

export class UpcomingEventsService {
  private static COLLECTION = 'upcoming_events'

  /**
   * Get all upcoming events (next 30 days) for a specific zone
   * Includes global events automatically
   */
  static async getUpcomingEvents(zoneId: string): Promise<UpcomingEvent[]> {
    try {
      if (!zoneId) return []

      // Check cache first
      const cacheKey = `${EVENTS_CACHE_KEY}_${zoneId}`
      const cached = getEventsCache(cacheKey)
      if (cached) {
        const today = moment()
        const next30Days = moment().add(30, 'days')
        return cached.data.filter(event => {
          const eventDate = moment(event.date)
          return eventDate.isBetween(today, next30Days, 'day', '[]')
        }).sort((a, b) => moment(a.date).diff(moment(b.date)))
      }

      // Fetch ALL events (events are relatively few, so fetching all is safe and simplifies "OR" logic)
      // Alternatively, we could do two queries, but this is cleaner for now.
      const allEvents = await FirebaseDatabaseService.getCollection(this.COLLECTION, 1000) as unknown as UpcomingEvent[]

      if (!allEvents || allEvents.length === 0) {
        return []
      }

      // Filter for zone-specific OR global events
      // ENHANCED: If user is in an HQ group, they also see all other HQ group events automatically
      const filteredForZone = (allEvents as any[]).filter(event => {
        const isTargetZone = event.zoneId === zoneId
        const isGlobal = event.isGlobal === true
        const isBothHQ = isHQGroup(zoneId) && isHQGroup(event.zoneId)

        return isTargetZone || isGlobal || isBothHQ
      })

      // Cache the results for this zone
      setEventsCache(cacheKey, filteredForZone)

      const today = moment()
      const next30Days = moment().add(30, 'days')

      // Filter for upcoming events only
      const upcomingEvents = filteredForZone.filter(event => {
        const eventDate = moment(event.date)
        return eventDate.isBetween(today, next30Days, 'day', '[]')
      })

      // Sort by date
      return upcomingEvents.sort((a, b) => {
        return moment(a.date).diff(moment(b.date))
      })
    } catch (error) {
      console.error(`Error fetching upcoming events for zone ${zoneId}:`, error)
      return []
    }
  }

  /**
   * Get events for carousel (showInCarousel = true)
   */
  static async getCarouselEvents(zoneId: string): Promise<UpcomingEvent[]> {
    const allEvents = await this.getUpcomingEvents(zoneId)
    // If an event is not explicitly hidden, show it in carousel
    return allEvents.filter(event => event.showInCarousel !== false)
  }

  /**
   * Create a new upcoming event
   */
  static async createEvent(eventData: Omit<UpcomingEvent, 'id' | 'createdAt' | 'updatedAt'> & { zoneId: string }): Promise<UpcomingEvent> {
    try {
      const cleanedData: Record<string, any> = {
        title: eventData.title,
        date: eventData.date,
        type: eventData.type,
        showInCarousel: eventData.showInCarousel,
        isGlobal: eventData.isGlobal || false,
        zoneId: eventData.zoneId,
        id: `upcoming-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (eventData.description) cleanedData.description = eventData.description
      if (eventData.time) cleanedData.time = eventData.time
      if (eventData.location) cleanedData.location = eventData.location
      if (eventData.image) cleanedData.image = eventData.image
      if (eventData.createdBy) cleanedData.createdBy = eventData.createdBy

      await FirebaseDatabaseService.createDocument(this.COLLECTION, cleanedData.id, cleanedData)

      // Invalidate cache
      localStorage.removeItem(`${EVENTS_CACHE_KEY}_${eventData.zoneId}`)

      return cleanedData as UpcomingEvent
    } catch (error) {
      console.error('Error creating upcoming event:', error)
      throw error
    }
  }

  /**
   * Update an existing upcoming event
   */
  static async updateEvent(eventId: string, eventData: Partial<UpcomingEvent>, zoneId: string): Promise<void> {
    try {
      const updateData = {
        ...eventData,
        updatedAt: new Date().toISOString()
      }

      await FirebaseDatabaseService.updateDocument(this.COLLECTION, eventId, updateData)
      localStorage.removeItem(`${EVENTS_CACHE_KEY}_${zoneId}`)
    } catch (error) {
      console.error('Error updating upcoming event:', error)
      throw error
    }
  }

  /**
   * Delete an upcoming event
   */
  static async deleteEvent(eventId: string, zoneId: string): Promise<void> {
    try {
      await FirebaseDatabaseService.deleteDocument(this.COLLECTION, eventId)
      localStorage.removeItem(`${EVENTS_CACHE_KEY}_${zoneId}`)
    } catch (error) {
      console.error('Error deleting upcoming event:', error)
      throw error
    }
  }

  /**
   * Get all events (for admin management)
   * Includes global events if they belong to this zone or are global
   */
  static async getAllEvents(zoneId: string): Promise<UpcomingEvent[]> {
    try {
      if (!zoneId) return []

      const allEvents = await FirebaseDatabaseService.getCollection(this.COLLECTION, 1000) as unknown as UpcomingEvent[]

      // If HQ or Boss, show EVERYTHING for management.
      // Otherwise, show ONLY zone-specific events (Management Section).
      const filtered = isHQGroup(zoneId)
        ? (allEvents || [])
        : (allEvents || []).filter(v => (v as any).zoneId === zoneId)

      return filtered.sort((a, b) => {
        return moment(b.date).diff(moment(a.date))
      })
    } catch (error) {
      console.error(`Error fetching all events for zone ${zoneId}:`, error)
      return []
    }
  }
}
