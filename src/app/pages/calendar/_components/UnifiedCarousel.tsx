'use client'

import { useState, useEffect } from 'react'
import { Cake, Sparkles, ChevronLeft, ChevronRight, Calendar, MapPin, Clock } from 'lucide-react'
import moment from 'moment'
import { BirthdayUser } from '../_lib/birthday-service'
import { UpcomingEvent } from '../_lib/upcoming-events-service'

interface CarouselItem {
  id: string
  type: 'birthday' | 'event'
  data: BirthdayUser | UpcomingEvent
}

interface UnifiedCarouselProps {
  birthdays: BirthdayUser[]
  events: UpcomingEvent[]
  themeColor: string
}

export default function UnifiedCarousel({ birthdays, events, themeColor }: UnifiedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Combine birthdays and events
  const carouselItems: CarouselItem[] = [
    ...birthdays.map(b => ({ id: `birthday-${b.id}`, type: 'birthday' as const, data: b })),
    ...events.map(e => ({ id: `event-${e.id}`, type: 'event' as const, data: e }))
  ]

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (carouselItems.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [carouselItems.length, isPaused])

  if (carouselItems.length === 0) return null

  const currentItem = carouselItems[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length)
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢'
      case 'event': return '🎉'
      case 'reminder': return '⏰'
      case 'meeting': return '👥'
      case 'rehearsal': return '🎵'
      default: return '📅'
    }
  }

  return (
    <div 
      className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-10 w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
        <div className="absolute top-8 right-20 w-3 h-3 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.5s' }} />
        <div className="absolute bottom-6 left-1/4 w-4 h-4 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2.2s' }} />
        <div className="absolute bottom-10 right-1/3 w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '2.8s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Navigation - Previous */}
        {carouselItems.length > 1 && (
          <button
            onClick={goToPrevious}
            className="flex-shrink-0 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all active:scale-95 backdrop-blur-sm"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 flex items-center justify-center gap-6 px-4">
          {currentItem.type === 'birthday' ? (
            // Birthday Card
            <>
              {/* Profile Section */}
              <div className="relative flex-shrink-0">
                {(currentItem.data as BirthdayUser).profile_image_url ? (
                  <img
                    src={(currentItem.data as BirthdayUser).profile_image_url}
                    alt={(currentItem.data as BirthdayUser).first_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-2xl"
                    style={{ backgroundColor: themeColor }}
                  >
                    {`${(currentItem.data as BirthdayUser).first_name?.[0] || ''}${(currentItem.data as BirthdayUser).last_name?.[0] || ''}`.toUpperCase()}
                  </div>
                )}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Cake className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Message Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide">
                    {(currentItem.data as BirthdayUser).isToday ? 'Happy Birthday!' : 'Upcoming Birthday'}
                  </h3>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mb-1 drop-shadow-lg">
                  {`${(currentItem.data as BirthdayUser).first_name} ${(currentItem.data as BirthdayUser).last_name}`.trim()}
                </p>
                <p className="text-base sm:text-lg text-white/90 font-medium">
                  {(currentItem.data as BirthdayUser).isToday 
                    ? ((currentItem.data as BirthdayUser).age ? `🎉 Celebrating ${(currentItem.data as BirthdayUser).age} amazing years! 🎉` : '🎉 Wishing you an amazing day! 🎉')
                    : `🎂 Birthday on ${moment((currentItem.data as BirthdayUser).birthday).format('MMMM D')} 🎂`
                  }
                </p>
              </div>
            </>
          ) : (
            // Event Card
            <>
              {/* Event Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white shadow-2xl flex items-center justify-center text-5xl">
                  {getEventTypeIcon((currentItem.data as UpcomingEvent).type)}
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide">
                    Upcoming Event
                  </h3>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
                  {(currentItem.data as UpcomingEvent).title}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {moment((currentItem.data as UpcomingEvent).date).format('MMM D, YYYY')}
                    </span>
                  </div>
                  {(currentItem.data as UpcomingEvent).time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {(currentItem.data as UpcomingEvent).time}
                      </span>
                    </div>
                  )}
                  {(currentItem.data as UpcomingEvent).location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {(currentItem.data as UpcomingEvent).location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation - Next */}
        {carouselItems.length > 1 && (
          <button
            onClick={goToNext}
            className="flex-shrink-0 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all active:scale-95 backdrop-blur-sm"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Dots Indicator - Very tiny */}
      {carouselItems.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all ${
                index === currentIndex
                  ? 'w-3 h-1 bg-white'
                  : 'w-1 h-1 bg-white/50 hover:bg-white/70'
              } rounded-full`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
