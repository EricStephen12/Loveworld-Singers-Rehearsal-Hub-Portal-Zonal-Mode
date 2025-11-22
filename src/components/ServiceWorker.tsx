'use client'

import { useEffect } from 'react'

export default function ServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker for instant caching
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('🚀 Service Worker registered successfully:', registration.scope)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
