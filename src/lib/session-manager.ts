// Session Management Service - Concurrent Login Prevention
import { doc, setDoc, getDoc, onSnapshot, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { signOut, User } from 'firebase/auth' // Static import
import { db, auth } from './firebase-setup' // Static import

interface UserSession {
  userId: string
  sessionId: string // NEW: Unique ID for this specific login instance
  deviceId: string
  deviceInfo: string
  deviceModel: string
  browserInfo: string
  osInfo: string
  loginTime: any
  lastActivity: any
  isActive: boolean
  terminatedAt?: any
  terminatedByDeviceId?: string
  terminatedReason?: string
}

export class SessionManager {
  private static deviceId: string = ''
  private static sessionId: string = '' // NEW
  private static sessionListener: (() => void) | null = null

  // Generate unique device ID (Persist in SessionStorage to survive reloads)
  static generateDeviceId(forceNew: boolean = false): string {
    // Try to recover from session storage first (unless forcing new)
    if (!forceNew && typeof window !== 'undefined') {
      const storedId = sessionStorage.getItem('lwsrh_device_id')
      if (storedId) {
        this.deviceId = storedId
        return storedId
      }
    }

    // If active instance exists and not forcing new, return it
    if (!forceNew && this.deviceId) return this.deviceId

    // Generate NEW unique fingerprint
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx!.textBaseline = 'top'
    ctx!.font = '14px Arial'
    ctx!.fillText('Device fingerprint', 2, 2)

    const fingerprint = canvas.toDataURL()
    const userAgent = navigator.userAgent
    const screen = `${window.screen.width}x${window.screen.height}`
    // Add randomness to ensure TAB separation and prevent collisions
    const entropy = Date.now().toString(36) + Math.random().toString(36).substring(2)

    // Create unique ID
    this.deviceId = btoa(`${fingerprint}-${userAgent}-${screen}-${entropy}`).slice(0, 32)

    // Persist
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lwsrh_device_id', this.deviceId)
    }

    return this.deviceId
  }

  // Generate Session ID (UUID) - Ephemeral, one per login
  static generateSessionId(): string {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  // Get device info for display
  static getDeviceInfo(): string {
    const userAgent = navigator.userAgent
    let deviceInfo = 'Unknown Device'

    if (/iPhone|iPad|iPod/.test(userAgent)) {
      deviceInfo = 'iPhone/iPad'
    } else if (/Android/.test(userAgent)) {
      deviceInfo = 'Android Device'
    } else if (/Windows/.test(userAgent)) {
      deviceInfo = 'Windows PC'
    } else if (/Mac/.test(userAgent)) {
      deviceInfo = 'Mac'
    } else if (/Linux/.test(userAgent)) {
      deviceInfo = 'Linux PC'
    }

    // Add browser info
    if (/Chrome/.test(userAgent)) deviceInfo += ' (Chrome)'
    else if (/Firefox/.test(userAgent)) deviceInfo += ' (Firefox)'
    else if (/Safari/.test(userAgent)) deviceInfo += ' (Safari)'
    else if (/Edge/.test(userAgent)) deviceInfo += ' (Edge)'

    // Add specific device model if available
    const deviceModel = this.getDeviceModel(userAgent)
    if (deviceModel) {
      deviceInfo = deviceModel + ' ' + deviceInfo
    }

    return deviceInfo
  }

  // Get specific device model
  static getDeviceModel(userAgent: string): string | null {
    // Samsung devices
    const samsungMatch = userAgent.match(/SM-[A-Z0-9]+/)
    if (samsungMatch) {
      return `Samsung ${samsungMatch[0]}`
    }

    // Itel devices
    const itelMatch = userAgent.match(/itel[ _][A-Z0-9]+/i)
    if (itelMatch) {
      return itelMatch[0].replace(/_/g, ' ')
    }

    // Other Android devices
    const androidMatch = userAgent.match(/Android.*?([A-Za-z0-9 ]+?)(?:Build|;)/)
    if (androidMatch) {
      return androidMatch[1].trim()
    }

    return null
  }

  // Get browser information
  static getBrowserInfo(): string {
    const userAgent = navigator.userAgent
    if (/Chrome/.test(userAgent)) return 'Chrome'
    if (/Firefox/.test(userAgent)) return 'Firefox'
    if (/Safari/.test(userAgent)) return 'Safari'
    if (/Edge/.test(userAgent)) return 'Edge'
    return 'Unknown Browser'
  }

  // Get OS information
  static getOSInfo(): string {
    const userAgent = navigator.userAgent
    if (/Windows/.test(userAgent)) return 'Windows'
    if (/Mac/.test(userAgent)) return 'macOS'
    if (/Linux/.test(userAgent)) return 'Linux'
    if (/Android/.test(userAgent)) return 'Android'
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
    return 'Unknown OS'
  }

  static async canUserLogin(userId: string): Promise<{ canLogin: boolean; activeDevice?: string }> {
    // ALWAYS ALLOW LOGIN - "Kick out" strategy
    return { canLogin: true }
  }

  // Create new session for user (terminates existing sessions by overwriting)
  static async createSession(user: User): Promise<void> {
    try {
      // FORCE NEW ID on login
      const deviceId = this.generateDeviceId(true)
      this.sessionId = this.generateSessionId() // Generate new Session ID
      const deviceInfo = this.getDeviceInfo()
      const deviceModel = this.getDeviceModel(navigator.userAgent) || 'Unknown'
      const browserInfo = this.getBrowserInfo()
      const osInfo = this.getOSInfo()

      const session: UserSession = {
        userId: user.uid,
        sessionId: this.sessionId, // Store it
        deviceId,
        deviceInfo,
        deviceModel,
        browserInfo,
        osInfo,
        loginTime: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isActive: true
      }

      const sessionRef = doc(db, 'user_sessions', user.uid)
      await setDoc(sessionRef, session)

      // Store Session ID locally for validity checks
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lwsrh_session_id', this.sessionId)
      }

      // Start tracking immediately
      this.startActivityTracking(user.uid)

    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  // Terminate existing session - Legacy (not needed with overwrite strategy but kept for admin)
  static async terminateExistingSession(userId: string, currentDeviceId: string): Promise<void> {
    // No-op in "Last Login Wins" model (overwrite handles it)
  }

  static async updateActivity(userId: string): Promise<void> {
    try {
      // Retrieve local session ID
      const storedSessionId = typeof window !== 'undefined' ? sessionStorage.getItem('lwsrh_session_id') : this.sessionId

      // Safety check: If we don't have a session ID, we might be in a bad state
      if (!storedSessionId) return

      // Attempt update
      const sessionRef = doc(db, 'user_sessions', userId)

      // We perform a "Pre-condition check" implicitly via Security Rules (to be added)
      // OR we just try to write. if it fails with permission denied, we know we are dead.
      await setDoc(sessionRef, {
        lastActivity: serverTimestamp()
      }, { merge: true })

    } catch (error: any) {
      // TRAP: If write fails (Permission Denied implies our Session ID is old), we die.
      if (error.code === 'permission-denied') {
        console.warn('[Session] 💀 Activity update blocked! Session invalid. Logging out.')
        this.handleSessionTermination()
      } else {
        console.error('Error updating activity:', error)
      }
    }
  }

  // Start tracking user session validity (Cost: 0 reads while idle, 1 read ONLY when conflict happens)
  static startActivityTracking(userId: string): void {
    if (this.sessionListener) {
      this.sessionListener() // Unsubscribe pending
    }

    // Ensure we have an ID
    if (!this.deviceId) {
      this.generateDeviceId()
    }
    if (!this.sessionId && typeof window !== 'undefined') {
      this.sessionId = sessionStorage.getItem('lwsrh_session_id') || ''
    }

    console.log(`[Session] 🟢 Tracking. SessID: ${this.sessionId}`)

    const sessionRef = doc(db, 'user_sessions', userId)

    // Real-time listener (Push Model - Industry Standard)
    // This is NOT polling. It waits for the server to say "Change happened".
    const unsubscribe = onSnapshot(sessionRef, { includeMetadataChanges: true }, (doc) => {
      // Ignore local writes (latency compensation)
      if (doc.metadata.hasPendingWrites) return

      if (doc.exists()) {
        const data = doc.data() as UserSession

        // The "Highlander" Check (UUID Version - stronger than DeviceID)
        // If the DB says "Session is X" and I am "Session Y", I am dead.
        if (data.sessionId && data.sessionId !== this.sessionId) {
          console.warn(`[Session] ❌ Session ID Mismatch! Active=${data.sessionId} vs Me=${this.sessionId}`)
          this.handleSessionTermination()
        }
      } else {
        console.warn(`[Session] ❌ Session deleted.`)
        this.handleSessionTermination()
      }
    }, (error: any) => {
      console.error('[Session] ⚠️ Listener error:', error)
    })

    this.sessionListener = unsubscribe
  }

  // Handle session termination (user logged in elsewhere)
  static async handleSessionTermination(): Promise<void> {
    // 1. Stop listening immediately to prevent loops
    if (this.sessionListener) {
      this.sessionListener()
      this.sessionListener = null
    }

    console.warn('⚡ SESSION TERMINATED ⚡')
    const currentPath = window.location.pathname

    // Don't kick if already on auth page
    if (currentPath.includes('/auth')) return

    try {
      await signOut(auth)

      // Force redirect to login with message
      if (typeof window !== 'undefined') {
        // Clear local storage
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('lwsrh_has_user') // Clear cache flag

        window.location.href = '/auth?error=session_taken_over&message=You were logged out because this account was used on another device.'
      }
    } catch (e) {
      console.error('Logout failed', e)
      // Failsafe redirect
      window.location.href = '/auth'
    }
  }

  // End session
  static async endSession(userId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'user_sessions', userId)
      await deleteDoc(sessionRef)

      if (this.sessionListener) {
        this.sessionListener()
        this.sessionListener = null
      }
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  // Force logout user from all devices (admin function)
  static async forceLogoutUser(userId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'user_sessions', userId)
      await setDoc(sessionRef, {
        isActive: false,
        terminatedAt: serverTimestamp(),
        terminatedReason: 'admin_force_logout'
      }, { merge: true })
    } catch (error) {
      console.error('Error force logging out user:', error)
    }
  }
}
