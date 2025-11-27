'use client'

import { useEffect, useRef } from 'react'
import { Cake, Sparkles } from 'lucide-react'
import moment from 'moment'

interface BirthdayCardProps {
  user: {
    id: string
    first_name: string
    last_name: string
    birthday: string
    profile_image_url?: string
    age?: number
  }
  themeColor: string
}

export default function BirthdayCard({ user, themeColor }: BirthdayCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Auto-scroll animation effect
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [])

  const fullName = `${user.first_name} ${user.last_name}`.trim()
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-2 border-pink-200 shadow-lg animate-pulse-slow"
    >
      {/* Confetti Background Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-4 right-6 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute bottom-4 left-8 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        <div className="absolute bottom-6 right-4 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Profile Image or Initials */}
        <div className="relative flex-shrink-0">
          {user.profile_image_url ? (
            <img
              src={user.profile_image_url}
              alt={fullName}
              className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg border-3 border-white shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              {initials}
            </div>
          )}
          {/* Birthday Icon Badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-md">
            <Cake className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Birthday Message */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">
              Happy Birthday!
            </p>
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">
            {fullName}
          </p>
          <p className="text-xs text-gray-600">
            {user.age ? `Turning ${user.age} today! 🎉` : 'Celebrating today! 🎉'}
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-2xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-300 to-pink-300 rounded-full blur-xl opacity-30" />
    </div>
  )
}
