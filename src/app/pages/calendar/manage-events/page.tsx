'use client'

import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ManageUpcomingEvents from '../_components/ManageUpcomingEvents'
import { ArrowLeft } from 'lucide-react'

export default function ManageEventsPage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const { currentZone, isLoading: zoneLoading } = useZone()
  const router = useRouter()

  // Check if user is coordinator or admin
  const isAuthorized = profile?.role === 'admin' || 
                       profile?.role === 'boss' || 
                       profile?.administration === 'Coordinator' ||
                       profile?.administration === 'Assistant Coordinator'

  // Only redirect if definitely not authorized
  // Don't wait for authLoading - use cached profile for instant access
  useEffect(() => {
    // If we have profile data (cached or fresh), check authorization immediately
    if (profile && !isAuthorized) {
      router.push('/pages/calendar')
    }
    // Only redirect to auth if we're certain there's no user AND no cached profile
    if (!authLoading && !user && !profile) {
      router.push('/auth')
    }
  }, [user, profile, isAuthorized, router, authLoading])

  // Show content immediately if we have cached profile
  // Only show loading if we truly have no profile data
  if (!profile && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is done loading and no user, show access denied (redirect will happen)
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (profile && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => router.push('/pages/calendar')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Event Management</h1>
              <p className="text-xs text-gray-500">Calendar Administration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <ManageUpcomingEvents themeColor={currentZone?.themeColor || '#10b981'} />
      </div>
    </div>
  )
}
