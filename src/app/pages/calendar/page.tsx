'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { useZone } from '@/contexts/ZoneContext'
import { CalendarEvent, CalendarService } from './_lib/firebase-calendar-service'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import CalendarStyles from './_components/CalendarStyles'

// Dynamically import React Big Calendar components to avoid SSR issues
const Calendar = dynamic(() => import('react-big-calendar').then(mod => mod.Calendar), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading calendar...</p>
      </div>
    </div>
  )
})

const EventModal = dynamic(() => import('./_components/EventModal'), {
  ssr: false
})

const CalendarToolbar = dynamic(() => import('./_components/CalendarToolbar'), {
  ssr: false
})

const EventDetailsModal = dynamic(() => import('./_components/EventDetailsModal'), {
  ssr: false
})

// Import moment and localizer dynamically
let momentLocalizer: any = null
let moment: any = null

export default function CalendarPage() {
  const { user } = useAuth()
  const { currentZone } = useZone()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [view, setView] = useState<any>('month')
  const [date, setDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [calendarReady, setCalendarReady] = useState(false)

  const calendarService = new CalendarService()

  // Initialize moment and localizer
  useEffect(() => {
    const initializeCalendar = async () => {
      try {
        const [momentModule, { momentLocalizer: localizerFn }] = await Promise.all([
          import('moment'),
          import('react-big-calendar')
        ])
        
        moment = momentModule.default
        momentLocalizer = localizerFn(moment)
        setCalendarReady(true)
      } catch (error) {
        console.error('Error initializing calendar:', error)
      }
    }

    initializeCalendar()
  }, [])

  // Load events
  useEffect(() => {
    if (!user || !currentZone) return

    const loadEvents = async () => {
      setLoading(true)
      try {
        const zoneEvents = await calendarService.getZoneEvents(currentZone.id)
        setEvents(zoneEvents)
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user, currentZone])

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end })
    setSelectedEvent(null)
    setShowEventModal(true)
  }

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event as CalendarEvent)
    setShowDetailsModal(true)
  }

  const handleCreateEvent = () => {
    setSelectedSlot({ start: new Date(), end: new Date(Date.now() + 60 * 60 * 1000) })
    setSelectedEvent(null)
    setShowEventModal(true)
  }

  const handleEventSaved = (event: CalendarEvent) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(prev => prev.map(e => e.id === event.id ? event : e))
    } else {
      // Add new event
      setEvents(prev => [...prev, event])
    }
    setShowEventModal(false)
    setSelectedSlot(null)
    setSelectedEvent(null)
  }

  const handleEventDeleted = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
    setShowDetailsModal(false)
    setSelectedEvent(null)
  }

  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.color || currentZone?.themeColor || '#10b981'
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '13px',
        fontWeight: '500'
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access the calendar.</p>
        </div>
      </div>
    )
  }

  if (!currentZone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Zone Selected</h2>
          <p className="text-gray-600">Please select a zone to view the calendar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarStyles />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: currentZone.themeColor || '#10b981' }}
              >
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
                <p className="text-sm text-gray-600">{currentZone.name}</p>
              </div>
            </div>
            
            <button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: currentZone.themeColor || '#10b981' }}
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {!calendarReady || loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {!calendarReady ? 'Initializing calendar...' : 'Loading events...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <Calendar
                localizer={momentLocalizer}
                events={events}
                startAccessor={(event: any) => event.start}
                endAccessor={(event: any) => event.end}
                style={{ height: 600 }}
                view={view}
                onView={(newView: any) => setView(newView)}
                date={date}
                onNavigate={setDate}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                components={{
                  toolbar: (props: any) => (
                    <CalendarToolbar 
                      {...props} 
                      themeColor={currentZone.themeColor || '#10b981'}
                    />
                  )
                }}
                formats={{
                  timeGutterFormat: 'HH:mm',
                  eventTimeRangeFormat: ({ start, end }: any) => 
                    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                  agendaTimeRangeFormat: ({ start, end }: any) =>
                    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                }}
                step={30}
                timeslots={2}
                min={new Date(2024, 0, 1, 6, 0, 0)}
                max={new Date(2024, 0, 1, 23, 0, 0)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false)
            setSelectedSlot(null)
            setSelectedEvent(null)
          }}
          onSave={handleEventSaved}
          event={selectedEvent}
          defaultStart={selectedSlot?.start}
          defaultEnd={selectedSlot?.end}
          zoneId={currentZone.id}
          themeColor={currentZone.themeColor || '#10b981'}
        />
      )}

      {/* Event Details Modal */}
      {showDetailsModal && (
        <EventDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedEvent(null)
          }}
          event={selectedEvent}
          onEdit={() => {
            setShowDetailsModal(false)
            setShowEventModal(true)
          }}
          onDelete={handleEventDeleted}
          themeColor={currentZone.themeColor || '#10b981'}
        />
      )}
    </div>
  )
}      