'use client'

import { useState, useEffect } from 'react'

interface MobileInfo {
  isMobile: boolean
  isSmallScreen: boolean
  hasSafeArea: boolean
  screenHeight: number
  screenWidth: number
  orientation: 'portrait' | 'landscape'
}

export function useMobileDetection(): MobileInfo {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isSmallScreen: false,
    hasSafeArea: false,
    screenHeight: 0,
    screenWidth: 0,
    orientation: 'portrait'
  })

  useEffect(() => {
    const updateMobileInfo = () => {
      const userAgent = navigator.userAgent
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth < 768
      const hasSafeArea = CSS.supports('padding: env(safe-area-inset-top)')
      const screenHeight = window.innerHeight
      const screenWidth = window.innerWidth
      const orientation = screenHeight > screenWidth ? 'portrait' : 'landscape'

      setMobileInfo({
        isMobile: isMobileDevice || isSmallScreen,
        isSmallScreen,
        hasSafeArea,
        screenHeight,
        screenWidth,
        orientation
      })
    }

    updateMobileInfo()

    window.addEventListener('resize', updateMobileInfo)
    window.addEventListener('orientationchange', updateMobileInfo)

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateMobileInfo)
    }

    return () => {
      window.removeEventListener('resize', updateMobileInfo)
      window.removeEventListener('orientationchange', updateMobileInfo)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateMobileInfo)
      }
    }
  }, [])

  return mobileInfo
}
