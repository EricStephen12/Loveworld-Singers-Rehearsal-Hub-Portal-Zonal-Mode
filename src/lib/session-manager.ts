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
  
  // Generate unique device ID
  static generateDeviceId(): string {
    if (this.deviceId) return this.deviceId
    
    // Create unique device fingerprint
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx!.textBaseline = 'top'
    ctx!.font = '14px Arial'
    ctx!.fillText('Device fingerprint', 2, 2)
    
    const fingerprint = canvas.toDataURL()
    const userAgent = navigator.userAgent
    const screen = `${window.screen.width}x${window.screen.height}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    this.deviceId = btoa(`${fingerprint}-${userAgent}-${screen}-${timezone}`).slice(0, 32)
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
    try {
      const currentDeviceId = this.generateDeviceId()
      const sessionRef = doc(db, 'user_sessions', userId)
      const sessionDoc = await getDoc(sessionRef)

      if (!sessionDoc.exists()) {
        return { canLogin: true }
      }

      const session = sessionDoc.data() as UserSession
      if (session.isActive && session.deviceId && session.deviceId !== currentDeviceId) {
        return { canLogin: false, activeDevice: session.deviceInfo || 'another device' }
      }

      return { canLogin: true }
    } catch (_e) {
    return { canLogin: true }
    }
  }
  
  // Create new session for user (terminates existing sessions)
  static async createSession(user: User): Promise<void> {
    try {
      const deviceId = this.generateDeviceId()
      const deviceInfo = this.getDeviceInfo()
      const deviceModel = this.getDeviceModel(navigator.userAgent) || 'Unknown'
      const browserInfo = this.getBrowserInfo()
      const osInfo = this.getOSInfo()
      
      // Terminate any existing session for this user
      await this.terminateExistingSession(user.uid, deviceId)
      
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
      
      // Start activity tracking
      this.startActivityTracking(user.uid)
      
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }
  
  // Terminate existing session for user (Facebook-style)
  static async terminateExistingSession(userId: string, currentDeviceId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'user_sessions', userId)
      const sessionDoc = await getDoc(sessionRef)
      
      if (sessionDoc.exists()) {
        const session = sessionDoc.data() as UserSession
        
        // If existing session is on a different device, notify it
        if (session.deviceId !== currentDeviceId) {
                    await setDoc(sessionRef, {
            ...session,
            isActive: false,
            terminatedAt: serverTimestamp(),
            terminatedByDeviceId: currentDeviceId
          }, { merge: true })
        }
      }
    } catch (error) {
      console.error('Error terminating existing session:', error)
    }
  }
  
    static async updateActivity(userId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'user_sessions', userId)
      await setDoc(sessionRef, {
        lastActivity: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }
  
  // Start tracking user activity
  static startActivityTracking(userId: string): void {
    // DISABLED - Session tracking causes page reloads
    // Just log the activity without forcing logouts
  }
  
  // Handle session termination (user logged in elsewhere)
  static handleSessionTermination(): void {
    // DISABLED - No more forced reloads
    // Just clear the session silently, let React handle the UI
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
