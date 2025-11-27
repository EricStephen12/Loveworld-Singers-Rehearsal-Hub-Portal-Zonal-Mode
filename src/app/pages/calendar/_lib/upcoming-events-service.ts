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

export class UpcomingEventsService {
  private static COLLECTION = 'upcoming_events'

  /**
   * Get all upcoming events (next 30 days)
   */
  static async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    try {
      const allEvents = await FirebaseDatabaseService.getCollection(this.COLLECTION) as unknown as UpcomingEvent[]
      
      if (!allEvents || allEvents.length === 0) {
        return []
      }

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
