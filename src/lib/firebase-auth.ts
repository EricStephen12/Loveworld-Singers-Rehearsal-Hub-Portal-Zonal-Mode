// Firebase Authentication Service - Ultra Fast
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { auth, db } from './firebase-setup'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { SessionManager } from './session-manager'
import { ErrorHandler } from './error-handler'

export class FirebaseAuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string, rememberMe: boolean = true) {
    try {
      // Validate inputs
      const emailError = ErrorHandler.validateEmail(email)
      if (emailError) {
        return { user: null, error: emailError, userFriendly: true }
      }
      
      const passwordError = ErrorHandler.validatePassword(password)
      if (passwordError) {
        return { user: null, error: passwordError, userFriendly: true }
      }
      
      // Use LOCAL persistence - keeps user logged in across browser sessions
      // This is what Instagram, Twitter, Facebook use
      await setPersistence(auth, browserLocalPersistence)
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // Enforce single-device: block login if another device is active
      const sessionCheck = await SessionManager.canUserLogin(result.user.uid)
      if (!sessionCheck.canLogin) {
        // Sign out immediately
        await signOut(auth)
        return { 
          user: null, 
          error: `This account is already logged in on ${sessionCheck.activeDevice}. Please ask the account owner to log out from that device first, or sign up for your own account instead.`,
          userFriendly: true 
        }
      }
      
      // Create new session
      await SessionManager.createSession(result.user)
      
      // Store auth token in localStorage for auto-login on return
      if (rememberMe && typeof window !== 'undefined') {
        const token = await result.user.getIdToken()
        localStorage.setItem('authToken', token)
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userId', result.user.uid)
        localStorage.setItem('lastLoginTime', Date.now().toString())
        console.log('✅ Auth token saved for auto-login')
      }
      
      return { user: result.user, error: null }
    } catch (error: any) {
      const friendlyError = ErrorHandler.getErrorMessage(error, 'auth')
      return { user: null, error: friendlyError, userFriendly: true }
    }
  }
  
  // Sign up with email and password
  static async signUp(email: string, password: string, userData: any) {
    try {
      // Use LOCAL persistence
      await setPersistence(auth, browserLocalPersistence)
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'profiles', result.user.uid), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign out - Firebase handles everything automatically
  static async signOut() {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        await SessionManager.endSession(currentUser.uid)
      }
      
      // Firebase clears localStorage automatically with browserLocalPersistence
      await signOut(auth)
      
      return { error: null, success: true }
    } catch (error: any) {
      const friendlyError = ErrorHandler.getErrorMessage(error, 'auth')
      return { error: friendlyError, success: false }
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  // Ensure auth persistence is set (call this on app startup)
  static async ensurePersistence() {
    try {
      // Use LOCAL persistence - keeps user logged in like Instagram/Twitter
      await setPersistence(auth, browserLocalPersistence)
      console.log('✅ Auth persistence set to LOCAL - user stays logged in')
      
      // Additional persistence checks
      const currentUser = auth.currentUser
      if (currentUser) {
        console.log('✅ User is already signed in:', currentUser.email)
        console.log('✅ User UID:', currentUser.uid)
      } else {
        console.log('ℹ️ No user currently signed in')
      }
      
      // Force auth state check
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('🔐 Auth state check on startup:', user ? `User: ${user.email}` : 'No user')
          unsubscribe()
          resolve(user)
        })
      })
    } catch (error) {
      console.error('❌ Failed to set auth persistence:', error)
    }
  }

  // Enhanced persistence check
  static async checkPersistenceStatus() {
    try {
      const currentUser = auth.currentUser
      return {
        hasUser: !!currentUser,
        userEmail: currentUser?.email || null,
        persistenceSet: true,
        message: currentUser ? 'User will stay signed in' : 'No user signed in'
      }
    } catch (error) {
      return {
        hasUser: false,
        userEmail: null,
        persistenceSet: false,
        message: 'Error checking persistence'
      }
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const docRef = doc(db, 'profiles', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        return null
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Test connection
  static async testConnection() {
    try {
      // Test if Firebase is initialized
      if (!auth) {
        return { status: 'error', message: 'Firebase Auth not initialized' }
      }
      
      // Test if we can access the auth object
      const currentUser = auth.currentUser
      return { 
        status: 'success', 
        message: 'Firebase Auth connected successfully',
        currentUser: currentUser ? 'User logged in' : 'No user logged in'
      }
    } catch (error: any) {
      return { status: 'error', message: error.message }
    }
  }

  // Create user with email and password (alias for signUp)
  static async createUserWithEmailAndPassword(email: string, password: string, userData?: any) {
    try {
      // Use LOCAL persistence
      await setPersistence(auth, browserLocalPersistence)
      
      const result = await createUserWithEmailAndPassword(auth, email, password)

      try {
        // Only create profile if userData is provided (not empty object)
        // This prevents creating duplicate profiles when linking KingsChat
        if (userData && Object.keys(userData).length > 0) {
          // Create user profile in Firestore with profile_completed: true (no completion page needed)
          const profileData = {
            id: result.user.uid,
            email: result.user.email, // Default to Firebase Auth email
            profile_completed: true, // Mark as completed since we have basic info
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Include user data if provided (this can override email with real email)
            ...userData
          }
          
          console.log('💾 Saving profile to Firestore:', {
            ...profileData,
            kingschatPassword: profileData.kingschatPassword ? '***hidden***' : undefined
          })
          
          await setDoc(doc(db, 'profiles', result.user.uid), profileData)
        } else {
          console.log('ℹ️ Skipping profile creation (linking mode - profile already exists)')
        }
  
        return { user: result.user, error: null }
      } catch (profileError: any) {
        // If profile creation fails (e.g. network issue), clean up the auth user
        // so we don't end up with an account that has no profile data.
        try {
          console.error('❌ Failed to create profile, deleting auth user to avoid partial signup:', profileError)
          await deleteUser(result.user)
        } catch (cleanupError) {
          console.error('⚠️ Failed to delete auth user after profile error:', cleanupError)
        }
        return { user: null, error: profileError?.message || 'Failed to complete signup. Please check your connection and try again.' }
      }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign in with email and password (alias for signIn)
  static async signInWithEmailAndPassword(email: string, password: string, rememberMe: boolean = true) {
    return this.signIn(email, password, rememberMe)
  }

  // Auto-login using stored token
  static async autoLogin(): Promise<{ user: User | null, error: string | null }> {
    try {
      if (typeof window === 'undefined') {
        return { user: null, error: 'Not in browser' }
      }

      // CRITICAL: Check if user is logging out - prevent auto-login
      const isLoggingOut = localStorage.getItem('isLoggingOut') === 'true' || 
                          localStorage.getItem('logging_out') === 'true'
      
      // Also check URL for logout flag
      const urlParams = new URLSearchParams(window.location.search)
      const logoutFromUrl = urlParams.get('logout') === 'true'
      
      if (isLoggingOut || logoutFromUrl) {
        console.log('🚫 Auto-login blocked - logout in progress')
        return { user: null, error: 'Logout in progress' }
      }

      const authToken = localStorage.getItem('authToken')
      const userId = localStorage.getItem('userId')
      const lastLoginTime = localStorage.getItem('lastLoginTime')

      if (!authToken || !userId || !lastLoginTime) {
        console.log('ℹ️ No stored auth token found')
        return { user: null, error: 'No stored credentials' }
      }

      // Check if token is too old (7 days)
      const tokenAge = Date.now() - parseInt(lastLoginTime)
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
      if (tokenAge > maxAge) {
        console.log('⚠️ Stored token expired')
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('lastLoginTime')
        return { user: null, error: 'Token expired' }
      }

      console.log('🔄 Attempting auto-login with stored token...')

      // Try to get current user from Firebase session
      const currentUser = auth.currentUser
      if (currentUser && currentUser.uid === userId) {
        console.log('✅ Auto-login successful (Firebase session exists)')
        return { user: currentUser, error: null }
      }

      // No Firebase session - user needs to login again
      console.log('ℹ️ No Firebase session - user needs to login again')
      return { user: null, error: 'Session expired - please login again' }

    } catch (error: any) {
      console.error('❌ Auto-login failed:', error)
      return { user: null, error: error.message }
    }
  }

  // Reset password - sends email with in-app redirect
  static async resetPassword(email: string) {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth')
      // Prefer in-app handling if possible
      const actionCodeSettings = (typeof window !== 'undefined') ? {
        // Redirect back to our reset page where we handle the oobCode
        url: `${window.location.origin}/auth/reset-password`,
        handleCodeInApp: true
      } : undefined as any

      await sendPasswordResetEmail(auth, email, actionCodeSettings)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Verify password reset code (oobCode from email link)
  static async verifyPasswordResetCode(oobCode: string) {
    try {
      const { verifyPasswordResetCode } = await import('firebase/auth')
      const email = await verifyPasswordResetCode(auth, oobCode)
      return { email, error: null }
    } catch (error: any) {
      return { email: null, error: error.message }
    }
  }

  // Confirm password reset with new password
  static async confirmPasswordReset(oobCode: string, newPassword: string) {
    try {
      const { confirmPasswordReset } = await import('firebase/auth')
      await confirmPasswordReset(auth, oobCode, newPassword)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { updatePassword } = await import('firebase/auth')
      const user = auth.currentUser
      if (!user) throw new Error('No user logged in')
      
      await updatePassword(user, newPassword)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      // Use LOCAL persistence
      await setPersistence(auth, browserLocalPersistence)
      
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Check if user profile exists, if not create one
      const userProfile = await this.getUserProfile(result.user.uid)
      if (!userProfile) {
        const displayName = result.user.displayName || ''
        const nameParts = displayName.split(' ')
        await setDoc(doc(db, 'profiles', result.user.uid), {
          id: result.user.uid,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: result.user.email,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Delete user account
  static async deleteUser() {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No user logged in')
      }
      
      await deleteUser(user)
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

}
