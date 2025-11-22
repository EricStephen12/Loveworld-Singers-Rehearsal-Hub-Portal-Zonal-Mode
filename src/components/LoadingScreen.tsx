'use client'

import React from 'react'
import { Music, Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = "Loading LoveWorld Singers..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
      <div className="text-center text-white">
        {/* Logo */}
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Music className="w-10 h-10" />
        </div>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        
        {/* Message */}
        <h1 className="text-xl font-semibold mb-2">{message}</h1>
        <p className="text-purple-200 text-sm">
          Preparing your rehearsal hub...
        </p>
        
        {/* Loading Dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
