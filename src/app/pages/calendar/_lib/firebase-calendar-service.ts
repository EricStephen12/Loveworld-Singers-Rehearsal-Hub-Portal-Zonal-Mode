import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'
import { isHQGroup } from '@/config/zones'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay: boolean
  color?: string
  location?: string
  attendees?: string[]
  createdBy: string
  createdByName: string
  zoneId: string
  isGlobal?: boolean // Whether the event is visible to all zones
  type: 'rehearsal' | 'performance' | 'meeting' | 'other'
  isRecurring?: boolean
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: Date
  }
  reminders?: {
    type: 'email' | 'notification'
    minutes: number
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface EventAttendee {
  userId: string
  userName: string
  email: string
  status: 'pending' | 'accepted' | 'declined'
  respondedAt?: Date
}

export class CalendarService {
  private eventsCollection = collection(db, 'calendar_events')
  private attendeesCollection = collection(db, 'event_attendees')

  // Create a new event
  async createEvent(eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.eventsCollection, {
        ...eventData,
        start: Timestamp.fromDate(eventData.start),
        end: Timestamp.fromDate(eventData.end),
        recurringPattern: eventData.recurringPattern ? {
          ...eventData.recurringPattern,
          endDate: eventData.recurringPattern.endDate ? Timestamp.fromDate(eventData.recurringPattern.endDate) : null
        } : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return docRef.id
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    try {
      const eventRef = doc(this.eventsCollection, eventId)
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      // Convert dates to Timestamps
      if (updates.start) {
        updateData.start = Timestamp.fromDate(updates.start)
      }
      if (updates.end) {
        updateData.end = Timestamp.fromDate(updates.end)
      }
      if (updates.recurringPattern?.endDate) {
        updateData.recurringPattern = {
          ...updates.recurringPattern,
          endDate: Timestamp.fromDate(updates.recurringPattern.endDate)
        }
      }

      await updateDoc(eventRef, updateData)
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  // Delete an event
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const eventRef = doc(this.eventsCollection, eventId)
      await deleteDoc(eventRef)

      // Also delete associated attendees
      const attendeesQuery = query(
        this.attendeesCollection,
        where('eventId', '==', eventId)
      )
      const attendeesSnapshot = await getDocs(attendeesQuery)

      const deletePromises = attendeesSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  }

  // Get events for a specific zone (Includes global events)
  async getZoneEvents(zoneId: string, userId?: string, userRole?: string): Promise<CalendarEvent[]> {
    try {
      // Fetch all events
      const querySnapshot = await getDocs(this.eventsCollection)
      const allEvents = querySnapshot.docs.map(doc => this.convertFirestoreEvent(doc.id, doc.data()))

      // If Boss account, show everything for full administration
      if (userRole === 'boss') {
        return allEvents.sort((a, b) => a.start.getTime() - b.start.getTime())
      }

      // Filter logic:
      // 1. Event is in the current zone
      // 2. OR Event is marked as Global
      // 3. OR Event was created by the current user (Private events)
      return allEvents.filter(event =>
        event.zoneId === zoneId ||
        event.isGlobal === true ||
        (userId && event.createdBy === userId)
      ).sort((a, b) => a.start.getTime() - b.start.getTime())
    } catch (error) {
      console.error('Error fetching zone events:', error)
      throw error
    }
  }

  // Get events for a specific date range
  async getEventsInRange(zoneId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('zoneId', '==', zoneId),
        where('start', '>=', Timestamp.fromDate(startDate)),
        where('start', '<=', Timestamp.fromDate(endDate)),
        orderBy('start', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => this.convertFirestoreEvent(doc.id, doc.data()))
    } catch (error) {
      console.error('Error fetching events in range:', error)
      throw error
    }
  }

  // Get events created by a specific user
  async getUserEvents(userId: string, zoneId: string): Promise<CalendarEvent[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('zoneId', '==', zoneId),
        where('createdBy', '==', userId),
        orderBy('start', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => this.convertFirestoreEvent(doc.id, doc.data()))
    } catch (error) {
      console.error('Error fetching user events:', error)
      throw error
    }
  }

  // Subscribe to real-time events for a zone (Includes global events)
  subscribeToZoneEvents(zoneId: string, callback: (events: CalendarEvent[]) => void, userId?: string, userRole?: string): () => void {
    // We subscribe to everything and filter client-side for simplicity with OR logic
    const q = query(
      this.eventsCollection,
      orderBy('start', 'asc'),
      limit(200) // Slightly higher limit since we're fetching everything
    )

    return onSnapshot(q, (snapshot) => {
      const allEvents = snapshot.docs.map(doc => this.convertFirestoreEvent(doc.id, doc.data()))

      const filtered = allEvents.filter(event => {
        // If Boss account, show everything
        if (userRole === 'boss') return true

        // Filter logic:
        // 1. Event is in the current zone
        // 2. OR Event is marked as Global
        // 3. OR Event was created by the current user (Private events)
        return event.zoneId === zoneId ||
          event.isGlobal === true ||
          (userId && event.createdBy === userId)
      })
      callback(filtered)
    }, (error) => {
      console.error('Error in events subscription:', error)
    })
  }

  // Add attendee to event
  async addAttendee(eventId: string, attendee: Omit<EventAttendee, 'respondedAt'>): Promise<void> {
    try {
      await addDoc(this.attendeesCollection, {
        eventId,
        ...attendee,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error adding attendee:', error)
      throw error
    }
  }

  async updateAttendeeStatus(eventId: string, userId: string, status: EventAttendee['status']): Promise<void> {
    try {
      const q = query(
        this.attendeesCollection,
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const attendeeRef = snapshot.docs[0].ref
        await updateDoc(attendeeRef, {
          status,
          respondedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error updating attendee status:', error)
      throw error
    }
  }

  // Get attendees for an event
  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    try {
      const q = query(
        this.attendeesCollection,
        where('eventId', '==', eventId)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          respondedAt: data.respondedAt?.toDate()
        } as EventAttendee
      })
    } catch (error) {
      console.error('Error fetching event attendees:', error)
      throw error
    }
  }

  // Helper method to convert Firestore document to CalendarEvent
  private convertFirestoreEvent(id: string, data: any): CalendarEvent {
    return {
      id,
      title: data.title,
      description: data.description,
      start: data.start.toDate(),
      end: data.end.toDate(),
      allDay: data.allDay || false,
      color: data.color,
      location: data.location,
      attendees: data.attendees || [],
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      zoneId: data.zoneId,
      isGlobal: data.isGlobal || false,
      type: data.type,
      isRecurring: data.isRecurring || false,
      recurringPattern: data.recurringPattern ? {
        ...data.recurringPattern,
        endDate: data.recurringPattern.endDate?.toDate()
      } : undefined,
      reminders: data.reminders || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  }

  // Generate recurring events
  generateRecurringEvents(baseEvent: CalendarEvent, endDate: Date): CalendarEvent[] {
    if (!baseEvent.isRecurring || !baseEvent.recurringPattern) {
      return [baseEvent]
    }

    const events: CalendarEvent[] = []
    const { frequency, interval } = baseEvent.recurringPattern
    const patternEndDate = baseEvent.recurringPattern.endDate || endDate

    let currentStart = new Date(baseEvent.start)
    let currentEnd = new Date(baseEvent.end)
    let eventCount = 0
    const maxEvents = 100 // Prevent infinite loops

    while (currentStart <= patternEndDate && eventCount < maxEvents) {
      events.push({
        ...baseEvent,
        id: `${baseEvent.id}_${eventCount}`,
        start: new Date(currentStart),
        end: new Date(currentEnd)
      })

      // Calculate next occurrence
      switch (frequency) {
        case 'daily':
          currentStart.setDate(currentStart.getDate() + interval)
          currentEnd.setDate(currentEnd.getDate() + interval)
          break
        case 'weekly':
          currentStart.setDate(currentStart.getDate() + (7 * interval))
          currentEnd.setDate(currentEnd.getDate() + (7 * interval))
          break
        case 'monthly':
          currentStart.setMonth(currentStart.getMonth() + interval)
          currentEnd.setMonth(currentEnd.getMonth() + interval)
          break
      }

      eventCount++
    }

    return events
  }
}