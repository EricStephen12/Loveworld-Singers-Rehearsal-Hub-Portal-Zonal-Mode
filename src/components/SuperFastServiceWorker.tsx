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
          console.log('🚀 Registering SUPER FAST Service Worker...')
          
          const registration = await navigator.serviceWorker.register('/sw-super-fast.js', {
            scope: '/'
          })

          console.log('✅ SUPER FAST Service Worker registered:', registration)

          // Handle updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found')
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New Service Worker installed, reloading...')
                  window.location.reload()
                }
              })
            }
          })

          // Handle controller change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker controller changed')
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

