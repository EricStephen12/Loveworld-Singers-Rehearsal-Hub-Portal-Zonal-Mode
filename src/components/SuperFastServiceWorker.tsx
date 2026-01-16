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
                  window.location.reload()
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

      registerSW()
    }
  }, [])

  return null
}

