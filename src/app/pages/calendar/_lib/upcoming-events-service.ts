import { FirebaseDatabaseService } from '@/lib/firebase-database'
import moment from 'moment'

export interface UpcomingEvent {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  type: 'announcement' | 'event' | 'reminder' | 'meeting' | 'rehearsal'
  showInCarousel: boolean
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

function getEventsCache(): EventsCache | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(EVENTS_CACHE_KEY)
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

function setEventsCache(data: UpcomingEvent[]) {
  if (typeof window === 'undefined') return
  try {
    const cache: EventsCache = { data, timestamp: Date.now() }
    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore storage errors
  }
}

export class UpcomingEventsService {
  private static COLLECTION = 'upcoming_events'

  /**
   * Get all upcoming events (next 30 days)
   * OPTIMIZED: Uses caching to reduce Firebase reads
   */
  static async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    try {
      // Check cache first
      const cached = getEventsCache()
      if (cached) {
        // Filter cached data for upcoming events
        const today = moment()
        const next30Days = moment().add(30, 'days')
        return cached.data.filter(event => {
          const eventDate = moment(event.date)
          return eventDate.isBetween(today, next30Days, 'day', '[]')
        }).sort((a, b) => moment(a.date).diff(moment(b.date)))
      }

      const allEvents = await FirebaseDatabaseService.getCollection(this.COLLECTION, 200) as unknown as UpcomingEvent[]
      
      if (!allEvents || allEvents.length === 0) {
        return []
      }
      
      // Cache all events
      setEventsCache(allEvents)

      const today = moment()
      const next30Days = moment().add(30, 'days')
      
      // Filter for upcoming events only
      const upcomingEvents = allEvents.filter(event => {
        const eventDate = moment(event.date)
        return eventDate.isBetween(today, next30Days, 'day', '[]')
      })

      // Sort by date
      return upcomingEvents.sort((a, b) => {
        return moment(a.date).diff(moment(b.date))
      })
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      return []
    }
  }

  /**
   * Get events for carousel (showInCarousel = true)
   */
  static async getCarouselEvents(): Promise<UpcomingEvent[]> {
    const allEvents = await this.getUpcomingEvents()
    return allEvents.filter(event => event.showInCarousel)
  }

  /**
   * Create a new upcoming event
   */
  static async createEvent(eventData: Omit<UpcomingEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<UpcomingEvent> {
    try {
      const newEvent: UpcomingEvent = {
        ...eventData,
        id: `upcoming-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await FirebaseDatabaseService.createDocument(this.COLLECTION, newEvent.id, newEvent)
      return newEvent
    } catch (error) {
      console.error('Error creating upcoming event:', error)
      throw error
    }
  }

  /**
   * Update an existing upcoming event
   */
  static async updateEvent(eventId: string, eventData: Partial<UpcomingEvent>): Promise<void> {
    try {
      const updateData = {
        ...eventData,
        updatedAt: new Date().toISOString()
      }

      await FirebaseDatabaseService.updateDocument(this.COLLECTION, eventId, updateData)
    } catch (error) {
      console.error('Error updating upcoming event:', error)
      throw error
    }
  }

  /**
   * Delete an upcoming event
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      await FirebaseDatabaseService.deleteDocument(this.COLLECTION, eventId)
    } catch (error) {
      console.error('Error deleting upcoming event:', error)
      throw error
    }
  }

  /**
   * Get all events (for admin management)
   */
  static async getAllEvents(): Promise<UpcomingEvent[]> {
    try {
      const allEvents = await FirebaseDatabaseService.getCollection(this.COLLECTION) as unknown as UpcomingEvent[]
      
      // Sort by date (newest first)
      return (allEvents || []).sort((a, b) => {
        return moment(b.date).diff(moment(a.date))
      })
    } catch (error) {
      console.error('Error fetching all events:', error)
      return []
    }
  }
}
