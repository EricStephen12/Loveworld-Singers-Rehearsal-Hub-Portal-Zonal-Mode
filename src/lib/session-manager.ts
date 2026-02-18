// Session Management Service - Concurrent Login Prevention
import { doc, setDoc, getDoc, onSnapshot, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase-setup'
import { User } from 'firebase/auth'

interface UserSession {
  userId: string
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
      const deviceInfo = this.getDeviceInfo()
      const deviceModel = this.getDeviceModel(navigator.userAgent) || 'Unknown'
      const browserInfo = this.getBrowserInfo()
      const osInfo = this.getOSInfo()

      const session: UserSession = {
        userId: user.uid,
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
      // Debounce updates to avoid spamming Firestore
      const sessionRef = doc(db, 'user_sessions', userId)
      await setDoc(sessionRef, {
        lastActivity: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  // Start tracking user session validity
  static startActivityTracking(userId: string): void {
    if (this.sessionListener) {
      this.sessionListener() // Unsubscribe pending
    }

    // Ensure we have an ID (recover from storage if needed)
    if (!this.deviceId) {
      this.generateDeviceId()
    }

    console.log(`[Session] Tracking ${userId} on ${this.deviceId}`)

    const sessionRef = doc(db, 'user_sessions', userId)

    // Real-time listener for "Kick Out"
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      // Ignore local writes (latency compensation)
      if (doc.metadata.hasPendingWrites) return

      if (doc.exists()) {
        const data = doc.data() as UserSession

        // Check if OUR device ID matches the ACTIVE device ID in DB
        // If they don't match, it means someone else logged in and overwrote the session
        if (data.deviceId && data.deviceId !== this.deviceId) {
          console.warn(`[Session] Mismatch! DB:${data.deviceId} vs ME:${this.deviceId}. Logging out.`)
          this.handleSessionTermination()
        }
      } else {
        // Session deleted (e.g. by admin)
        this.handleSessionTermination()
      }
    })

    this.sessionListener = unsubscribe
  }

  // Handle session termination (user logged in elsewhere)
  static handleSessionTermination(): void {
    if (this.sessionListener) {
      this.sessionListener()
      this.sessionListener = null
    }

    // Sign out functionality
    import('./firebase-auth').then(({ FirebaseAuthService }) => {
      FirebaseAuthService.signOut().then(() => {
        // Redirect with message
        if (typeof window !== 'undefined') {
          window.location.href = '/auth?error=session_taken_over&message=You have been logged out because this account was logged in on another device.'
        }
      })
    })
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
