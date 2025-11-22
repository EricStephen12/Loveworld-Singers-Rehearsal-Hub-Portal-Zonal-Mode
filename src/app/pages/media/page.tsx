'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useMedia } from './_context/MediaContext'
import { Play, Info, Film } from 'lucide-react'
import MediaNav from './_components/MediaNav'
import SliderContainer from './_components/SliderContainer'

export default function MediaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { allMedia, featuredMedia, isLoading } = useMedia()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to access media content</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const heroMedia = featuredMedia[0] || allMedia[0]

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Navigation */}
      <MediaNav isScrolled={isScrolled} />

      {/* Hero Section */}
      <div className="relative h-[70vh] mt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroMedia?.backdropImage || heroMedia?.thumbnail || '/movie/default-hero.jpeg'}
            alt="Hero"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(40%)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-end p-8 md:p-16">
          <div className="max-w-2xl space-y-4">
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {heroMedia?.title || 'LoveWorld Singers'}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-300 line-clamp-3">
              {heroMedia?.description || 
                'Experience the power of worship with LoveWorld Singers. Watch sermons, praise nights, and worship sessions.'}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => heroMedia && router.push(`/pages/media/player/${heroMedia.id}`)}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Play
              </button>
              <button className="flex items-center gap-2 px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30">
                <Info className="w-5 h-5" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Sliders */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <SliderContainer media={allMedia} />
      )}
    </div>
  )
}
