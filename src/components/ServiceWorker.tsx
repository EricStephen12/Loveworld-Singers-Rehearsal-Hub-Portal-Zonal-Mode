'use client'

import { useEffect } from 'react'

export default function ServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker for instant caching
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
        })
        .catch((error) => {
        })
    }
  }, [])

  return null
}
