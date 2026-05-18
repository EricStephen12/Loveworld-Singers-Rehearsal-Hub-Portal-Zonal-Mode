// Session Management Service - Concurrent Login Prevention
import { signOut, User } from 'firebase/auth' // Static import
import { auth } from './firebase-setup' // Static import
import { serverTimestamp } from 'firebase/firestore'
import { FirebaseDatabaseService } from './firebase-database'
import { BackendAPI } from './api-client'

interface SessionData {
  sessionId: string
  deviceId: string
  deviceInfo: string
  deviceModel: string
  browserInfo: string
  osInfo: string
  loginTime: any
  lastActivity: any
  isActive: boolean
  screen?: string
  timezone?: string
  cores?: number
}

interface UserSessionDoc {
  userId: string
  sessions: { [sessionId: string]: SessionData }
  lastUpdated: any
}

export class SessionManager {
  private static deviceId: string = ''
  private static sessionId: string = ''
  private static sessionListener: (() => void) | null = null
  private static isExempt: boolean = false // Set once on login; exempt users are NEVER kicked out

  // Emails and zones that are permanently exempt from kickout
  private static readonly EXEMPT_EMAILS = ['takeshopstores@gmail.com']
  private static readonly EXEMPT_ZONES = ['zone-president', 'zone-president-2', 'zone-oftp', 'zone-sa-1', 'zone-sa-2', 'zone-sa-3', 'zone-sa-4', 'zone-sa-5']

  // Generate unique device ID (Persist in SessionStorage to survive reloads)
  static generateDeviceId(forceNew: boolean = false): string {
    // Try to recover from local storage first (unless forcing new)
    if (!forceNew && typeof window !== 'undefined') {
      const storedId = localStorage.getItem('lwsrh_device_id')
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
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const cores = navigator.hardwareConcurrency || 0
    
    // Entropy removed to make device ID deterministic across tabs/reloads on same device
    // const entropy = Date.now().toString(36) + Math.random().toString(36).substring(2)
    
    // Create unique ID
    this.deviceId = btoa(`${fingerprint}-${userAgent}-${screen}-${timezone}-${cores}`).slice(0, 32)

    // Persist
    if (typeof window !== 'undefined') {
      localStorage.setItem('lwsrh_device_id', this.deviceId)
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
    // ALWAYS ALLOW LOGIN
    return { canLogin: true }
  }

  // Create new session for user (never terminates existing sessions)
  static async createSession(user: User): Promise<void> {
    try {
      await this.checkAndSetExemption(user.uid)

      const deviceId = this.generateDeviceId(false)
      this.sessionId = this.generateSessionId()
      const deviceInfo = this.getDeviceInfo()
      const deviceModel = this.getDeviceModel(navigator.userAgent) || 'Unknown'
      const browserInfo = this.getBrowserInfo()
      const osInfo = this.getOSInfo()

      const newSession: SessionData = {
        sessionId: this.sessionId,
        deviceId,
        deviceInfo,
        deviceModel,
        browserInfo,
        osInfo,
        loginTime: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isActive: true,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cores: navigator.hardwareConcurrency || 0
      }

      const existingDoc = await FirebaseDatabaseService.getDocument('user_sessions', user.uid) as UserSessionDoc || { userId: user.uid, sessions: {}, lastUpdated: serverTimestamp() };
      
      let sessions = existingDoc.sessions || {};
      
      // NEVER clear previous sessions. Just add/update our current session ID in the map.
      sessions[this.sessionId] = newSession;

      await FirebaseDatabaseService.updateDocument('user_sessions', user.uid, {
        userId: user.uid,
        sessions,
        lastUpdated: serverTimestamp()
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem('lwsrh_session_id', this.sessionId)
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  // Terminate existing session - Legacy (not needed with overwrite strategy but kept for admin)
  static async terminateExistingSession(userId: string, currentDeviceId: string): Promise<void> {
    // No-op
  }

  static async updateActivity(userId: string): Promise<void> {
    // No-op to prevent unnecessary Firestore writes and permission traps
    return;
  }

  // Fetch profile once and set the isExempt flag permanently for this session
  static async checkAndSetExemption(userId: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('lwsrh_is_exempt')
        if (cached === 'true') {
          SessionManager.isExempt = true
        }
      }

      const profile = await FirebaseDatabaseService.getDocument('profiles', userId)
      if (profile) {
        const email = (profile.email || '').toLowerCase()
        
        const isExemptByEmail = SessionManager.EXEMPT_EMAILS.includes(email)
        const isExemptByZone = profile.zone && SessionManager.EXEMPT_ZONES.includes(profile.zone)
        const isExemptByRole = ['super_admin', 'boss', 'hq_admin', 'admin'].includes(profile.role)
        
        const { isHQAdminEmail } = await import('@/config/roles')
        const isExemptByHQEmail = isHQAdminEmail(email)

        SessionManager.isExempt = isExemptByEmail || !!isExemptByZone || isExemptByRole || isExemptByHQEmail

        if (SessionManager.isExempt) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('lwsrh_is_exempt', 'true')
          }
        } else {
          if (typeof window !== 'undefined') {
            localStorage.setItem('lwsrh_is_exempt', 'false')
          }
        }
      }
    } catch (e) {
      console.error('[Session] checkAndSetExemption failed:', e)
    }
  }

  // Start tracking user session validity
  static async startActivityTracking(userId: string): Promise<void> {
    // KICKOUT SYSTEM PERMANENTLY DISABLED TO PREVENT ACCIDENTAL LOGOUTS ("WAHALA" PROTECTION)
    return;
  }

  // Handle session termination (user logged in elsewhere)
  static async handleSessionTermination(): Promise<void> {
    // KICKOUT SYSTEM PERMANENTLY DISABLED: NEVER force logout or redirect to /auth
    return;
  }

  // End session
  static async endSession(userId: string): Promise<void> {
    try {
      await FirebaseDatabaseService.deleteDocument('user_sessions', userId)

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
      await FirebaseDatabaseService.updateDocument('user_sessions', userId, {
        isActive: false,
        terminatedAt: new Date().toISOString(),
        terminatedReason: 'admin_force_logout'
      })
    } catch (error) {
      console.error('Error force logging out user:', error)
    }
  }

  // Clear all local session state
  static clearSessionState(): void {
    if (typeof window !== 'undefined') {
      const isExplicitLogout = localStorage.getItem('isLoggingOut') === 'true' || localStorage.getItem('logging_out') === 'true';
      if (isExplicitLogout) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('lwsrh_has_user')
        localStorage.removeItem('lwsrh_is_exempt')
        localStorage.removeItem('lwsrh_session_id')
        localStorage.removeItem('lwsrh_device_id')
      }
    }
    this.sessionId = ''
    this.isExempt = false
  }
}
