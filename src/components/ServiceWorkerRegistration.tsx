'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return
    }

    const registerSW = async () => {
      try {
        
        const registration = await navigator.serviceWorker.register('/sw-big-company.js', {
          scope: '/',
          updateViaCache: 'none'
        })
        

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          }
        })

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
      }
    }

    // Register with small delay
    const timeoutId = setTimeout(registerSW, 1000)
    return () => clearTimeout(timeoutId)
  }, [])

  return null
}
