'use client'

import { ChevronLeft, ChevronRight, Menu, Search, Settings, Grid, List, Clock } from 'lucide-react'
import moment from 'moment'

interface GoogleCalendarToolbarProps {
  date: Date
  view: string
  views: string[]
  label: string
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE', date?: Date) => void
  onView: (view: string) => void
  themeColor: string
  onToggleSidebar?: () => void
}

const VIEW_ICONS = {
  month: Grid,
  week: Grid,
  day: Clock,
  agenda: List
}

const VIEW_LABELS = {
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda'
}

export default function GoogleCalendarToolbar({
  date,
  view,
  views,
  label,
  onNavigate,
  onView,
  themeColor,
  onToggleSidebar
}: GoogleCalendarToolbarProps) {
  
  const goToBack = () => {
    onNavigate('PREV')
  }

  const goToNext = () => {
    onNavigate('NEXT')
  }

  const goToCurrent = () => {
    onNavigate('TODAY')
  }

  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200 bg-white">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Menu Button (Mobile) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Logo/Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h1 className="text-lg sm:text-xl font-normal text-gray-700 hidden sm:block">Calendar</h1>
        </div>
      </div>

      {/* Center Section - Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
        <button
          onClick={goToCurrent}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:scale-95"
        >
          Today
        </button>
        
        <div className="flex items-center">
          <button
            onClick={goToBack}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          
          <button
            onClick={goToNext}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>
        
        <h2 className="text-base sm:text-xl font-normal text-gray-700 min-w-[120px] sm:min-w-[180px] text-center truncate">
          {label}
        </h2>
      </div>

      {/* Right Section - View Switcher */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search (Optional) */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95 hidden md:block">
          <Search className="w-5 h-5 text-gray-600" />
        </button>

        {/* View Dropdown */}
        <div className="relative">
          <select
            value={view}
            onChange={(e) => onView(e.target.value)}
            className="appearance-none px-2 sm:px-4 py-1.5 sm:py-2 pr-6 sm:pr-8 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95"
            style={{ 
              focusRing: themeColor,
              '--tw-ring-color': themeColor 
            } as any}
          >
            {views.map((viewName) => (
              <option key={viewName} value={viewName}>
                {VIEW_LABELS[viewName as keyof typeof VIEW_LABELS] || viewName}
              </option>
            ))}
          </select>
          <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Settings (Optional) */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95 hidden md:block">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
