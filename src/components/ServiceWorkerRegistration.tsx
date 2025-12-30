'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported')
      return
    }

    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Skipping Service Worker in development')
      return
    }

    const registerSW = async () => {
      try {
        console.log('🔄 Registering service worker...')
        
        const registration = await navigator.serviceWorker.register('/sw-big-company.js', {
          scope: '/',
          updateViaCache: 'none'
        })
        
        console.log('✅ Service Worker registered:', registration.scope)

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New version available, updating...')
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          }
        })

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker updated, reloading...')
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