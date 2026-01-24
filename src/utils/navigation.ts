export class NavigationManager {
  private static navigationHistory: string[] = []
  private static isInitialized = false
  private static LAST_PATH_KEY = 'lwsrh_last_path'
  private static HISTORY_KEY = 'lwsrh_nav_history'

  static init() {
    if (typeof window === 'undefined' || this.isInitialized) return

    this.isInitialized = true

    // Load history from localStorage if available
    const savedHistory = localStorage.getItem(this.HISTORY_KEY)
    if (savedHistory) {
      try {
        this.navigationHistory = JSON.parse(savedHistory)
      } catch (e) {
        console.warn('Failed to parse saved navigation history', e)
        this.navigationHistory = []
      }
    }

    // Add current path if history is empty or last item is different
    const currentPath = window.location.pathname
    if (this.navigationHistory.length === 0 || this.navigationHistory[this.navigationHistory.length - 1] !== currentPath) {
      this.navigationHistory.push(currentPath)
      this.saveHistory()
    }

    // Listen for navigation changes
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(history, args)
      NavigationManager.trackNavigation()
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args)
      NavigationManager.trackNavigation()
    }

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
      NavigationManager.trackNavigation()
    })
  }

  private static saveHistory() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.navigationHistory))
    }
  }

  private static trackNavigation() {
    const currentPath = window.location.pathname
    const lastPath = this.navigationHistory[this.navigationHistory.length - 1]

    if (currentPath !== lastPath) {
      this.navigationHistory.push(currentPath)

      // Persist to localStorage, excluding auth/splash routes
      if (!currentPath.includes('/auth') && currentPath !== '/' && currentPath !== '/splash') {
        localStorage.setItem(this.LAST_PATH_KEY, currentPath)
      }

      if (this.navigationHistory.length > 15) {
        this.navigationHistory = this.navigationHistory.slice(-15)
      }

      this.saveHistory()
    }
  }

  static getLastPath(): string {
    if (typeof window === 'undefined') return '/home'
    return localStorage.getItem(this.LAST_PATH_KEY) || '/home'
  }

  static getPreviousPage(): string | null {
    if (this.navigationHistory.length < 2) return null

    const previousPage = this.navigationHistory[this.navigationHistory.length - 2]

    // Skip auth pages in history
    if (previousPage === '/auth' || previousPage.startsWith('/auth/')) {
      return this.getSafeFallback()
    }

    return previousPage
  }

  static getSafeFallback(): string {
    const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminAuthenticated') === 'true'

    if (isAdmin) {
      return '/admin'
    }

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
      // Remove current page from history before going back
      this.navigationHistory.pop()
      this.saveHistory()
      router.push(previousPage)
    } else {
      // If no history, try to go to a logical parent or home
      const currentPath = window.location.pathname
      const parts = currentPath.split('/').filter(Boolean)

      if (parts.length > 1) {
        const parentPath = '/' + parts.slice(0, -1).join('/')
        router.push(parentPath)
      } else {
        router.push(this.getSafeFallback())
      }
    }
  }

  /**
   * Robust Back Navigation
   * 1. Checks valid browser history first
   * 2. Fallbacks to explicit path if provided
   * 3. Fallbacks to logical parent path
   * 4. Safe fallback to Home/Admin based on auth
   */
  static handleBack(router: any, fallbackUrl?: string) {
    // Robust Back Navigation Strategy:
    // User reported router.back() fails ("stops working") when app is closed and returned.
    // This happens because browser history is reset but we want to resume flow.
    // Solution: Use our persistent internal history (localstorage) which survives "close and return".
    // 1. Check internal history for a previous page.
    // 2. If exists, PUSH to it (Reliable "Direct navigation").
    // 3. If no internal history, use fallbackUrl.
    // 4. If no fallback, use logical parent / safe fallback.

    const previousPage = this.getPreviousPage()

    if (previousPage) {
      // Use internal history which is persistent and reliable
      // We manually pop the current page so we don't grow the stack infinitely with duplicates
      this.navigationHistory.pop()
      this.saveHistory()
      router.push(previousPage)
    } else if (fallbackUrl) {
      // No history, use specific fallback
      router.push(fallbackUrl)
    } else {
      // No specific fallback, try logical parent
      const currentPath = window.location.pathname
      const parts = currentPath.split('/').filter(Boolean)

      if (parts.length > 1) {
        // Try going up one level e.g. /pages/media/player -> /pages/media
        const parentPath = '/' + parts.slice(0, -1).join('/')
        router.push(parentPath)
      } else {
        router.push(this.getSafeFallback())
      }
    }
  }

  static getNavigationHistory(): string[] {
    return [...this.navigationHistory]
  }
}
