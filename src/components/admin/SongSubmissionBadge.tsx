'use client'

import React, { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { getUnreadNotifications } from '@/lib/song-submission-service'
import { useRouter } from 'next/navigation'

export default function SongSubmissionBadge() {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUnreadCount()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const notifications = await getUnreadNotifications()
      setUnreadCount(notifications.length)
    } catch (error) {
      console.error('Error loading unread count:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  if (unreadCount === 0) return null

  return (
    <button
      onClick={() => router.push('/pages/admin/submitted-songs')}
      className="relative inline-flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      <span className="font-medium">New Song Submissions</span>
      <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </button>
  )
}











