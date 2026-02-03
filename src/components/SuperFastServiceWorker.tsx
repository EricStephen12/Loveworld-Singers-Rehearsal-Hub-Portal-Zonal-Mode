'use client'

import { useEffect } from 'react'

const isProduction = process.env.NODE_ENV === 'production'

export default function SuperFastServiceWorker() {
  useEffect(() => {
    if (!isProduction) {
      return
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {

          const registration = await navigator.serviceWorker.register('/sw-super-fast.js', {
            scope: '/'
          })


          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Silent update: The new version is ready and will be used on next page load.
                  // We do NOT force reload here to avoid interrupting the user.
                  console.log('✅ New version installed in background. Will apply on next launch.')
                }
              })
            }
          })

          // Handle controller change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // New service worker has taken control. 
            console.log('✅ Service Worker updated successfully.')
          })

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error)
        }
      }

      registerSW()
    }
  }, [])

  return null
}

