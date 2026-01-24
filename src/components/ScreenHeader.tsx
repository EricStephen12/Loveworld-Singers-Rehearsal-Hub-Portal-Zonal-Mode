'use client'

import React, { useEffect, useState } from 'react'
import { Menu, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NavigationManager } from '@/utils/navigation'
// Removed auth context dependency for admin check

type ScreenHeaderProps = {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  rightImageSrc?: string
  showDivider?: boolean
  rightButtons?: React.ReactNode
  leftButtons?: React.ReactNode
  onTitleClick?: () => void
  timer?: React.ReactNode
  showMenuButton?: boolean
  showBackButton?: boolean
  backPath?: string
  onBackClick?: () => void
  darkMode?: boolean
}

export function ScreenHeader({
  title,
  subtitle,
  onMenuClick,
  rightImageSrc = '/logo.png',
  showDivider = true,
  rightButtons,
  leftButtons,
  onTitleClick,
  timer,
  showMenuButton = false,
  showBackButton = false,
  backPath,
  onBackClick,
  darkMode = false
}: ScreenHeaderProps) {

  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  // Check admin status from localStorage
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminAuthenticated') === 'true'

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 200)
    return () => window.clearTimeout(id)
  }, [])

  const handleLogoClick = () => {
    if (isAdmin) {
      router.push('/admin')
    } else {
      router.push('/home')
    }
  }

  const bgColor = darkMode ? 'bg-[#0f0f0f]' : 'bg-white/80 backdrop-blur-xl'
  const borderColor = darkMode ? 'border-gray-800' : 'border-gray-100/50'
  const textColor = darkMode ? 'text-white' : 'text-gray-800'
  const subtextColor = darkMode ? 'text-gray-400' : 'text-gray-600'
  const iconColor = darkMode ? 'text-gray-300' : 'text-gray-600'
  const hoverBg = darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'

  return (
    <div className={`sticky top-0 z-50 ${bgColor} ${showDivider ? `border-b ${borderColor}` : ''}`}>
      <div className="flex items-center justify-between p-2 sm:p-3 relative min-h-[60px] sm:min-h-[70px]">
        {/* Left side - Menu button and left buttons */}
        <div className="flex items-center space-x-2">
          {showBackButton && (
            <button
              onClick={() => {
                if (onBackClick) {
                  onBackClick()
                } else if (backPath) {
                  router.push(backPath)
                } else {
                  NavigationManager.safeBack(router)
                }
              }}

              className={`flex items-center p-2 rounded-lg transition-all duration-1000 ease-out focus:outline-none focus:ring-0 focus:border-0 ${hoverBg} ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-75'}`}
              aria-label="Go back"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              <ArrowLeft className={`w-5 h-5 ${iconColor}`} />
            </button>
          )}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className={`flex items-center p-2 rounded-lg transition-all duration-1000 ease-out focus:outline-none focus:ring-0 focus:border-0 ${hoverBg} ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-75'}`}
              aria-label="Open menu"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              <Menu className={`w-5 h-5 ${iconColor}`} />
            </button>
          )}
          {leftButtons && (
            <div className={`transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-75'}`}>
              {leftButtons}
            </div>
          )}
        </div>

        {/* Center - Title and Timer (centered on all screen sizes) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <button
            onClick={onTitleClick}
            className={`text-base sm:text-lg font-outfit-semibold ${textColor} transition-all duration-1000 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-90'} ${onTitleClick ? (darkMode ? 'hover:text-white' : 'hover:text-gray-900') + ' active:scale-95' : 'cursor-default'}`}
            disabled={!onTitleClick}
          >
            {title}
          </button>
          {subtitle && (
            <div className={`text-xs sm:text-sm ${subtextColor} font-medium transition-all duration-1000 ease-out delay-250 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              {subtitle}
            </div>
          )}
          {timer && (
            <div className={`mt-0.5 transition-all duration-1000 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              {timer}
            </div>
          )}
        </div>

        {/* Right side - Buttons and Logo */}
        <div className={`flex items-center space-x-2 transition-all duration-1000 ease-out delay-400 ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-75'}`}>
          {rightButtons}
          <button
            onClick={handleLogoClick}
            className="hover:scale-105 active:scale-95 transition-transform duration-200"
            aria-label="Go to home"
          >
            <img
              src={rightImageSrc}
              alt="Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScreenHeader


