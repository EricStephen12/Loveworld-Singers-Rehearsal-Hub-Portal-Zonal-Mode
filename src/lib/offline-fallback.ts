// Offline fallback utilities for when Supabase is unavailable
export class OfflineFallback {
  // Check if we're online
  static isOnline(): boolean {
    if (typeof window === 'undefined') return true
    return navigator.onLine
  }

  // Get cached session as fallback
  static getCachedSession() {
    try {
      if (typeof window === 'undefined') return null

      const storageKey = 'loveworld-singers-auth-token'
      const item = localStorage.getItem(storageKey)

      if (!item) return null

      const data = JSON.parse(item)

      // Check if session exists and is not expired
      if (data?.currentSession?.access_token && data?.currentSession?.expires_at) {
        const expiresAt = data.currentSession.expires_at
        const now = Math.floor(Date.now() / 1000)

        // If session is still valid (not expired)
        if (expiresAt > now) {
          return data.currentSession
        }
      }

      return null
    } catch (error) {
      console.error('Get cached session error:', error)
      return null
    }
  }

  // Get cached profile as fallback
  static getCachedProfile() {
    try {
      if (typeof window === 'undefined') return null

      const cached = localStorage.getItem('cached_user_profile')
      if (cached) {
        return JSON.parse(cached)
      }

      return null
    } catch (error) {
      console.error('Get cached profile error:', error)
      return null
    }
  }

  // Show offline message to user
  static showOfflineMessage() {
    console.log('📱 App is running in offline mode')
    // You could show a toast notification here
  }

  // Check if we should proceed with offline data (Instagram-style)
  static shouldProceedOffline(): boolean {
    // If we have cached session, proceed
    const cachedSession = this.getCachedSession()
    if (cachedSession) {
      console.log('📱 Using cached session for offline mode')
      return true
    }

    // Check if user has auth indicators (like Instagram)
    const hasAuthIndicators = typeof window !== 'undefined' && (
      localStorage.getItem('userAuthenticated') === 'true' ||
      localStorage.getItem('hasCompletedProfile') === 'true' ||
      localStorage.getItem('bypassLogin') === 'true'
    )

    if (hasAuthIndicators) {
      console.log('📱 Auth indicators found, proceeding offline')
      return true
    }

    // If no cached session and no auth indicators, proceed anyway (user will be redirected to auth)
    console.log('📱 No cached session or auth indicators, proceeding to auth')
    return true
  }

  // Create a mock user session for offline mode (Instagram-style)
  static createOfflineUser(): any {
    if (typeof window === 'undefined') return null

    const cachedProfile = this.getCachedProfile()
    if (cachedProfile) {
      return {
        uid: cachedProfile.id || 'offline-user',
        email: cachedProfile.email || 'offline@example.com',
        displayName: `${cachedProfile.first_name || ''} ${cachedProfile.last_name || ''}`.trim() || 'Offline User',
        photoURL: cachedProfile.profile_image_url || null,
        isOffline: true
      }
    }

    return {
      uid: 'offline-user',
      email: 'offline@example.com',
      displayName: 'Offline User',
      photoURL: null,
      isOffline: true
    }
  }
}
