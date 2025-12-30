'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function PushNotificationListener() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission)
      })
    }

    // Listen for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('Service Worker ready for push notifications')
      })
    }
  }, [user])

  return null
}
