'use client'

import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import moment from 'moment'

interface CalendarSidebarProps {
  date: Date
  onDateSelect: (date: Date) => void
  onCreateEvent: () => void
  themeColor: string
  zoneName: string
  upcomingEvents?: Array<{
    id: string
    title: string
    start: Date
    end: Date
    color?: string
  }>
}

export default function CalendarSidebar({
  date,
  onDateSelect,
  onCreateEvent,
  themeColor,
  zoneName,
  upcomingEvents = []
}: CalendarSidebarProps) {
  // Get upcoming events (next 7 days) - ONLY regular events, no birthdays
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcoming = upcomingEvents
    .filter(event => event.start >= today && event.start <= nextWeek)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5)

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-2xl lg:shadow-none">
      {/* Create Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateEvent}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Today's Date */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white"
            style={{ backgroundColor: themeColor }}
          >
            <span className="text-xs font-medium uppercase">{moment(date).format('MMM')}</span>
            <span className="text-lg font-bold">{moment(date).format('D')}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{moment(date).format('dddd')}</p>
            <p className="text-xs text-gray-500">{moment(date).format('MMMM D, YYYY')}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Upcoming Events List - ONLY regular events */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Upcoming Events
          </h3>
          {upcoming.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">No upcoming events</p>
              <p className="text-xs text-gray-500">Create your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((event) => (
                <div
                  key={event.id}
                  className="group p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 h-full rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color || themeColor, minHeight: '40px' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {moment(event.start).format('MMM D, h:mm A')}
                        </p>
                      </div>
                      {event.end && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Events Section */}
        {upcomingEvents.length > 5 && (
          <div className="px-4 pb-4">
            <button 
              className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              View all events ({upcomingEvents.length})
            </button>
          </div>
        )}
      </div>

      {/* Zone Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          />
          <span className="text-sm text-gray-600 truncate font-medium">{zoneName}</span>
        </div>
      </div>
    </div>
  )
}
