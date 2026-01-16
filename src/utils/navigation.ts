export class NavigationManager {
  private static navigationHistory: string[] = []
  private static isInitialized = false
  private static LAST_PATH_KEY = 'lwsrh_last_path'

  static init() {
    if (typeof window === 'undefined' || this.isInitialized) return

    this.isInitialized = true

    // Track navigation history
    this.navigationHistory.push(window.location.pathname)

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

  private static trackNavigation() {
    const currentPath = window.location.pathname
    const lastPath = this.navigationHistory[this.navigationHistory.length - 1]

    if (currentPath !== lastPath) {
      this.navigationHistory.push(currentPath)

      // Persist to localStorage, excluding auth/splash routes
      if (!currentPath.includes('/auth') && currentPath !== '/' && currentPath !== '/splash') {
        localStorage.setItem(this.LAST_PATH_KEY, currentPath)
      }

      if (this.navigationHistory.length > 10) {
        this.navigationHistory = this.navigationHistory.slice(-10)
      }
    }
  }

  static getLastPath(): string {
    if (typeof window === 'undefined') return '/home'
    return localStorage.getItem(this.LAST_PATH_KEY) || '/home'
  }

  static getPreviousPage(): string | null {
    if (this.navigationHistory.length < 2) return null

    const previousPage = this.navigationHistory[this.navigationHistory.length - 2]

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
      router.push(previousPage)
    } else {
      router.push(this.getSafeFallback())
    }
  }

  static getNavigationHistory(): string[] {
    return [...this.navigationHistory]
  }
}
