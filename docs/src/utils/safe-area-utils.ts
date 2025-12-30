// Safe Area Utilities for PWA
export class SafeAreaUtils {
  private static isInitialized = false

  static init() {
    if (typeof window === 'undefined' || this.isInitialized) return
    
    this.isInitialized = true
    
    // Set CSS custom properties for safe areas
    const updateSafeAreas = () => {
      const safeAreaTop = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-top') || '0px'
      const safeAreaBottom = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-bottom') || '0px'
      const safeAreaLeft = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-left') || '0px'
      const safeAreaRight = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-right') || '0px'

      // Set enhanced safe area values with minimum padding
      const enhancedBottom = Math.max(
        parseInt(safeAreaBottom) || 0,
        window.innerHeight < 600 ? 24 : 20 // More padding on smaller screens
      )
      
      document.documentElement.style.setProperty('--enhanced-safe-area-bottom', `${enhancedBottom}px`)
      
      console.log('📱 Safe areas updated:', {
        top: safeAreaTop,
        bottom: safeAreaBottom,
        left: safeAreaLeft,
        right: safeAreaRight,
        enhancedBottom
      })
    }

    // Set initial values
    updateSafeAreas()

    // Update on resize
    window.addEventListener('resize', updateSafeAreas)
    
    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSafeAreas, 100)
    })

    // Update when visual viewport changes (mobile browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateSafeAreas)
    }

    // Handle app resume from background
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(updateSafeAreas, 100)
      }
    })

    console.log('📱 Safe area utils initialized')
  }

  static getSafeAreaBottom() {
    if (typeof window === 'undefined') return '20px'
    
    const enhancedBottom = document.documentElement.style.getPropertyValue('--enhanced-safe-area-bottom')
    return enhancedBottom || '20px'
  }

  static isSmallScreen() {
    if (typeof window === 'undefined') return false
    return window.innerHeight < 600
  }

  static isVerySmallScreen() {
    if (typeof window === 'undefined') return false
    return window.innerHeight < 500
  }

  static getRecommendedBottomPadding() {
    if (this.isVerySmallScreen()) return '32px'
    if (this.isSmallScreen()) return '28px'
    return '24px'
  }
}
