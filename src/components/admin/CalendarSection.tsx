'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Edit2, Trash2, Search, Clock, MapPin, X, Eye, EyeOff, Image, FolderOpen } from 'lucide-react'
import { useZone } from '@/hooks/useZone'
import { UpcomingEvent, UpcomingEventsService } from '@/app/pages/calendar/_lib/upcoming-events-service'
import MediaSelectionModal from '../MediaSelectionModal'
import moment from 'moment'

const EVENT_TYPES = [
  { id: 'event', label: 'Event' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'rehearsal', label: 'Rehearsal' },
  { id: 'reminder', label: 'Reminder' },
]

export default function CalendarSection() {
  const { currentZone } = useZone()
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<UpcomingEvent | null>(null)
  const [saving, setSaving] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    image: '',
    type: 'event' as UpcomingEvent['type'],
    showInCarousel: true
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const allEvents = await UpcomingEventsService.getAllEvents()
      setEvents(allEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (event?: UpcomingEvent) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        date: event.date,
        time: event.time || '',
        image: event.image || '',
        type: event.type,
        showInCarousel: event.showInCarousel
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        location: '',
        date: moment().format('YYYY-MM-DD'),
        time: '',
        image: '',
        type: 'event',
        showInCarousel: true
      })
    }
    setShowModal(true)
  }

  const handleSaveEvent = async () => {
    console.log('handleSaveEvent called', formData)
    
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }
    
    if (!formData.date) {
      alert('Please select a date')
      return
    }

    setSaving(true)
    try {
      const eventData: any = {
        title: formData.title.trim(),
        date: formData.date,
        type: formData.type,
        showInCarousel: formData.showInCarousel
      }
      
      // Only add optional fields if they have values
      if (formData.description.trim()) eventData.description = formData.description.trim()
      if (formData.location.trim()) eventData.location = formData.location.trim()
      if (formData.time) eventData.time = formData.time
      if (formData.image) eventData.image = formData.image

      console.log('Saving event data:', eventData)

      if (editingEvent) {
        await UpcomingEventsService.updateEvent(editingEvent.id, eventData)
        console.log('Event updated successfully')
      } else {
        const result = await UpcomingEventsService.createEvent(eventData)
        console.log('Event created successfully:', result)
      }

      // Clear cache to refresh data
      localStorage.removeItem('lwsrh-upcoming-events-cache')
      
      setShowModal(false)
      setEditingEvent(null)
      await loadEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return

    try {
      await UpcomingEventsService.deleteEvent(eventToDelete.id)
      // Clear cache
      localStorage.removeItem('lwsrh-upcoming-events-cache')
      setShowDeleteDialog(false)
      setEventToDelete(null)
      loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const toggleCarouselVisibility = async (event: UpcomingEvent) => {
    try {
      await UpcomingEventsService.updateEvent(event.id, {
        showInCarousel: !event.showInCarousel
      })
      localStorage.removeItem('lwsrh-upcoming-events-cache')
      loadEvents()
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const themeColor = currentZone?.themeColor || '#10b981'
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return '#8b5cf6'
      case 'announcement': return '#f59e0b'
      case 'meeting': return '#3b82f6'
      case 'rehearsal': return '#10b981'
      case 'reminder': return '#ef4444'
      default: return themeColor
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Calendar Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage ministry events and schedules</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-all"
            style={{ backgroundColor: themeColor }}
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">Create your first event to get started</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 text-white rounded-lg font-medium"
              style={{ backgroundColor: themeColor }}
            >
              Add Event
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-1 rounded-full self-stretch"
                      style={{ backgroundColor: getTypeColor(event.type), minHeight: '60px' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                      <span 
                        className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: getTypeColor(event.type) }}
                      >
                        {event.type}
                      </span>
                      {event.showInCarousel && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          In Carousel
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{moment(event.date).format('MMM D, YYYY')}{event.time ? ` at ${event.time}` : ''}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCarouselVisibility(event)}
                      className={`p-2 rounded-lg transition-colors ${
                        event.showInCarousel 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={event.showInCarousel ? 'Hide from carousel' : 'Show in carousel'}
                    >
                      {event.showInCarousel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenModal(event)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEventToDelete(event)
                        setShowDeleteDialog(true)
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Event description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as UpcomingEvent['type'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Event location"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {/* Image/Ecard from Media Library */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Ecard/Image</label>
                {formData.image ? (
                  <div className="relative">
                    <img 
                      src={formData.image} 
                      alt="Event ecard" 
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMediaLibrary(true)}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                      >
                        <FolderOpen className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMediaLibrary(true)}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
                  >
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Select from Media Library</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showInCarousel"
                  checked={formData.showInCarousel}
                  onChange={(e) => setFormData({ ...formData, showInCarousel: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                  style={{ accentColor: themeColor }}
                />
                <label htmlFor="showInCarousel" className="text-sm text-gray-700">Show in calendar carousel</label>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={saving || !formData.title.trim() || !formData.date}
                className="flex-1 px-4 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: themeColor }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingEvent ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Event</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false)
                  setEventToDelete(null)
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaSelectionModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onFileSelect={(file) => {
          console.log('📸 Selected image from library:', file.url)
          setFormData({ ...formData, image: file.url })
          setShowMediaLibrary(false)
        }}
        allowedTypes={['image']}
        title="Select Event Image"
      />
    </div>
  )
}
