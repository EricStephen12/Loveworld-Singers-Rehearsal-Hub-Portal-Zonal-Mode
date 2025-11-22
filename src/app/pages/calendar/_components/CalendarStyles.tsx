'use client'

import { useEffect } from 'react'

export default function CalendarStyles() {
  useEffect(() => {
    // Dynamically import CSS
    import('react-big-calendar/lib/css/react-big-calendar.css')
    import('../calendar.css')
  }, [])

  return null
}