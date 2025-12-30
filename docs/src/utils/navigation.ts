// Navigation Utilities for Better Back Navigation
export class NavigationManager {
  private static navigationHistory: string[] = []
  private static isInitialized = false

  static init() {
    if (typeof window === 'undefined' || this.isInitialized) return
    
    this.isInitialized = true
    
    // Track navigation history
    this.navigationHistory.push(window.location.pathname)
    
    // Listen for navigation changes
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      NavigationManager.trackNavigation()
    }
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      NavigationManager.trackNavigation()
    }
    
    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
      NavigationManager.trackNavigation()
    })
    
    console.log('🧭 Navigation manager initialized')
  }

  private static trackNavigation() {
    const currentPath = window.location.pathname
    const lastPath = this.navigationHistory[this.navigationHistory.length - 1]
    
    // Only add if it's different from the last path
    if (currentPath !== lastPath) {
      this.navigationHistory.push(currentPath)
      
      // Keep only last 10 entries to prevent memory issues
      if (this.navigationHistory.length > 10) {
        this.navigationHistory = this.navigationHistory.slice(-10)
      }
    }
  }

  static getPreviousPage(): string | null {
    if (this.navigationHistory.length < 2) return null
    
    const previousPage = this.navigationHistory[this.navigationHistory.length - 2]
    
    // Don't go back to auth pages
    if (previousPage === '/auth' || previousPage.startsWith('/auth/')) {
      return this.getSafeFallback()
    }
    
    return previousPage
  }

  static getSafeFallback(): string {
    // Check if user is admin
    const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminAuthenticated') === 'true'
    
    if (isAdmin) {
      return '/admin'
    }
    
    // Check if user is authenticated - be more lenient
    const isAuthenticated = typeof window !== 'undefined' && (
      localStorage.getItem('userAuthenticated') === 'true' ||
      localStorage.getItem('hasCompletedProfile') === 'true' ||
      localStorage.getItem('bypassLogin') === 'true'
    )
    
    if (isAuthenticated) {
      return '/home'
    }
    
    return '/auth'
  }

  static safeBack(router: any) {
    const previousPage = this.getPreviousPage()
    
    if (previousPage) {
      console.log('🧭 Navigating back to:', previousPage)
      router.push(previousPage)
    } else {
      console.log('🧭 No safe back page, using fallback')
      router.push(this.getSafeFallback())
    }
  }

  static getNavigationHistory(): string[] {
    return [...this.navigationHistory]
  }
}
