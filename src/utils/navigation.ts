import { persistentStorage } from './persistent-storage'

export class NavigationManager {
  private static isInitialized = false
  private static LAST_PATH_KEY = 'lwsrh_last_path'

  static async init() {
    if (typeof window === 'undefined' || this.isInitialized) return
    this.isInitialized = true

    // We strictly use browser history now, but we can keep track of the "last path" 
    // for simple state restoration if needed.
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname + window.location.search
      // Don't overwrite useful history with the root path or auth path
      if (currentUrl !== '/' && !currentUrl.startsWith('/auth')) {
        localStorage.setItem(this.LAST_PATH_KEY, currentUrl)
      }
    }

    // Listen for visibility changes to update last path
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const currentUrl = window.location.pathname + window.location.search
        if (currentUrl !== '/' && !currentUrl.startsWith('/auth')) {
          localStorage.setItem(this.LAST_PATH_KEY, currentUrl)
        }
      }
    })
  }

  static getLastPath(): string {
    if (typeof window === 'undefined') return '/home'
    return localStorage.getItem(this.LAST_PATH_KEY) || '/home'
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

  /**
   * legacy safeBack - now redirected to robust handleBack
   */
  static safeBack(router: any) {
    this.handleBack(router)
  }

  /**
   * Robust Native Back Navigation
   * 1. Trusts window.history.length > 1 means we can go back.
   * 2. If history is empty (length <= 1), we fallback safely to avoid App Exit.
   * 3. Handles modal closing (query params) effectively.
   */
  static handleBack(router: any, fallbackUrl?: string) {
    if (typeof window === 'undefined') return;

    const hasHistory = window.history.length > 1;
    const hasQueryParams = window.location.search.length > 0;

    // 1. Standard Back: If we have history, let browser handle it.
    if (hasHistory) {
      router.back();
      return;
    }

    // 2. Empty History Edge Cases (Deep Links / Refresh):

    // Case A: We are in a "modal" state (driven by query params like ?song=...)
    // Action: Stay on page, but strip params to "close" the modal.
    if (hasQueryParams) {
      const currentPath = window.location.pathname;
      router.replace(currentPath);
      return;
    }

    // Case B: We are on a main page with no history.
    // Action: Go to explicit fallback or logical parent.
    if (fallbackUrl) {
      router.replace(fallbackUrl);
    } else {
      // Logical parent fallback logic
      const currentPath = window.location.pathname;
      const parts = currentPath.split('/').filter(Boolean);

      if (parts.length > 1) {
        // e.g. /pages/praise-night -> /pages
        const parentPath = '/' + parts.slice(0, -1).join('/');
        router.replace(parentPath);
      } else {
        // Root or single level -> Go Home/Safe Fallback
        router.replace(this.getSafeFallback());
      }
    }
  }
}
