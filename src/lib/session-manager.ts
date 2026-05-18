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
    // ALWAYS ALLOW LOGIN - "Kick out" strategy
    return { canLogin: true }
  }

  // Create new session for user (terminates existing sessions by overwriting)
  static async createSession(user: User): Promise<void> {
    try {
      // Check exemption FIRST to decide if we should kick others
      await this.checkAndSetExemption(user.uid)

      // REUSE existing device ID if available to prevent kicking other tabs on same device
      const deviceId = this.generateDeviceId(false)
      this.sessionId = this.generateSessionId() // Generate new Session ID
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

      // Get existing doc to check for device conflicts
      const existingDoc = await FirebaseDatabaseService.getDocument('user_sessions', user.uid) as UserSessionDoc || { userId: user.uid, sessions: {}, lastUpdated: serverTimestamp() };
      
      let sessions = existingDoc.sessions || {};
      const activeSessions = Object.values(sessions);
      
      // Determine if this is a "New Physical Device" or "Same Device, New Browser/Tab"
      // Fuzzy Match: If we find ANY session with same OS + Timezone + Cores, we consider it the same physical machine.
      const isSamePhysicalDevice = activeSessions.some(s => 
        s.osInfo === osInfo && 
        s.timezone === Intl.DateTimeFormat().resolvedOptions().timeZone && 
        s.cores === (navigator.hardwareConcurrency || 0)
      );

      if (!isSamePhysicalDevice && activeSessions.length > 0 && !SessionManager.isExempt) {
        console.log('[Session] Different physical device detected. Clearing all previous sessions (Kickout).');
        sessions = {}; // KICKOUT: Clear all sessions from other physical devices
      }

      // Add our new session to the map (which might be empty now if we kicked others)
      sessions[this.sessionId] = newSession;

      await FirebaseDatabaseService.updateDocument('user_sessions', user.uid, {
        userId: user.uid,
        sessions,
        lastUpdated: serverTimestamp()
      })

      // Store Session ID locally for validity checks
      if (typeof window !== 'undefined') {
        localStorage.setItem('lwsrh_session_id', this.sessionId)
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
      const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem('lwsrh_session_id') : this.sessionId

      // Safety check: If we don't have a session ID, we might be in a bad state
      if (!storedSessionId) return

      // Attempt update
      // Update only our specific session's lastActivity to avoid overwriting other tabs
      const updatePath = `sessions.${this.sessionId}.lastActivity`
      await FirebaseDatabaseService.updateDocument('user_sessions', userId, {
        [updatePath]: serverTimestamp(),
        lastUpdated: serverTimestamp()
      })

    } catch (error: any) {
      // TRAP: If write fails (Permission Denied implies our Session ID is old), we die.
      if (error.code === 'permission-denied') {
 console.warn('[Session]  Activity update blocked! Session invalid. Logging out.')
        this.handleSessionTermination()
      } else {
 console.error('Error updating activity:', error)
      }
    }
  }

  // Fetch profile once and set the isExempt flag permanently for this session
  static async checkAndSetExemption(userId: string): Promise<void> {
    try {
      // Synchronous check: if we already have it in localStorage, set it immediately
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('lwsrh_is_exempt')
        if (cached === 'true') {
          SessionManager.isExempt = true
        }
      }

      const profile = await FirebaseDatabaseService.getDocument('profiles', userId)
      if (profile) {
        const email = (profile.email || '').toLowerCase()
        
        // 1. Explicit Email/Zone Exemption (Legacy)
        const isExemptByEmail = SessionManager.EXEMPT_EMAILS.includes(email)
        const isExemptByZone = profile.zone && SessionManager.EXEMPT_ZONES.includes(profile.zone)
        
        // 2. Role-Based Exemption (Admins, HQ Admins, Bosses)
        const isExemptByRole = ['super_admin', 'boss', 'hq_admin', 'admin'].includes(profile.role)
        
        // 3. HQ Email-Based Exemption (Single Source of Truth)
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


    const unsubscribe = FirebaseDatabaseService.subscribeToDocument('user_sessions', userId, async (docData) => {
      const docSnap = docData as UserSessionDoc
      
      // 0. Exempt Guard
      if (SessionManager.isExempt) return

      // 1. Offline Guard
      if (typeof navigator !== 'undefined' && !navigator.onLine) return

      if (docSnap && docSnap.sessions) {
        const sessions = docSnap.sessions
        
        // Adopt session if we have none locally but Firestore has one for this device
        if (!this.sessionId && typeof window !== 'undefined') {
          const myDeviceId = localStorage.getItem('lwsrh_device_id')
          const matchedSession = Object.values(sessions).find(s => s.deviceId === myDeviceId)
          if (matchedSession) {
            this.sessionId = matchedSession.sessionId
            localStorage.setItem('lwsrh_session_id', this.sessionId)
            console.log(`[Session] Adopted existing session for this device: ${this.sessionId}`)
            return
          }
        }

        // The "Highlander" Check - Now allowing multi-session, so we check if OUR session is still valid
        const mySession = sessions[this.sessionId]
        
        if (!mySession) {
          // If our session is missing from the map, we might need to be kicked
          // UNLESS it's a fuzzy device match for another active session
          const myDeviceId = typeof window !== 'undefined' ? localStorage.getItem('lwsrh_device_id') : this.deviceId
          const myScreen = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : ''
          const myTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const myCores = navigator.hardwareConcurrency || 0;
          const myOS = this.getOSInfo();

          const isFuzzyMatch = Object.values(sessions).some(s => 
            s.deviceId === myDeviceId || 
            (s.screen === myScreen && s.osInfo === myOS && s.timezone === myTimezone && s.cores === myCores)
          )

          if (isFuzzyMatch) {
            // Adopt the first matching session we find
            const firstMatch = Object.values(sessions).find(s => 
              s.deviceId === myDeviceId || 
              (s.screen === myScreen && s.osInfo === myOS && s.timezone === myTimezone && s.cores === myCores)
            )!
            console.log(`[Session] Session missing but FUZZY MATCH found. Adopting: ${firstMatch.sessionId}`)
            this.sessionId = firstMatch.sessionId
            if (typeof window !== 'undefined') localStorage.setItem('lwsrh_session_id', this.sessionId)
            return
          }

          // If no fuzzy match and no direct session, wait for Nigeria network grace period
          setTimeout(async () => {
             // Re-verify after grace period
             const latestDoc = await FirebaseDatabaseService.getDocument('user_sessions', userId) as UserSessionDoc
             if (!latestDoc?.sessions?.[this.sessionId]) {
                // Double fuzzy check
                const stillFuzzy = Object.values(latestDoc?.sessions || {}).some(s => 
                  s.deviceId === myDeviceId || 
                  (s.screen === myScreen && s.osInfo === myOS && s.timezone === myTimezone && s.cores === myCores)
                )
                if (!stillFuzzy) {
                  console.warn(`[Session] Session ${this.sessionId} terminated. No valid device match found.`);
                  this.handleSessionTermination()
                }
             }
          }, 30000)
        }
      } else {
        // ... (existing grace period for missing doc)
        // 5. Extended Grace Period for Session Deletion (Nigeria Network Protection)
        // If the doc appears gone, wait 60 seconds and re-verify with a direct GET and active ping.
        // This prevents false kicks if the network is "Zombie" (onLine but stalled) for minutes.
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          
          setTimeout(async () => {
            // Active Connectivity Check: Try to ping the backend to see if we're REALLY online
            let isReallyOnline = false;
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);
              const response = await fetch('/api/songs?limit=1', { signal: controller.signal });
              clearTimeout(timeoutId);
              isReallyOnline = response.ok;
            } catch (e) {
              isReallyOnline = false;
            }

            // If we are NOT really online, ignore the "doc missing" signal (it's likely a sync error)
            if (!isReallyOnline) {
              console.log(`[Session] Active ping failed. Ignoring session deletion signal due to uncertain connectivity.`);
              return;
            }

            // If we ARE really online, do a final direct GET re-verification
            const latestData = await FirebaseDatabaseService.getDocument('user_sessions', userId);
            if (!latestData && typeof navigator !== 'undefined' && navigator.onLine) {
              console.warn(`[Session] Session deletion confirmed after 60s grace period and active ping. Logging out.`);
              this.handleSessionTermination();
            }
          }, 60000); // 1 minute grace period
        }
      }
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

 console.warn(' SESSION TERMINATED ')
    const currentPath = window.location.pathname

    // Don't kick if already on auth page
    if (currentPath.includes('/auth')) return

    try {
      await signOut(auth)
      SessionManager.clearSessionState()
      
      // Force redirect to login with message
      if (typeof window !== 'undefined') {
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
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('lwsrh_has_user')
      localStorage.removeItem('lwsrh_is_exempt')
      localStorage.removeItem('lwsrh_session_id')
      localStorage.removeItem('lwsrh_device_id')
    }
    this.sessionId = ''
    this.isExempt = false
  }
}
