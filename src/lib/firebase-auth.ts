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
  static async signIn(email: string, password: string) {
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
      
      // Set persistence to LOCAL (keeps user signed in across browser sessions)
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
      
      return { user: result.user, error: null }
    } catch (error: any) {
      const friendlyError = ErrorHandler.getErrorMessage(error, 'auth')
      return { user: null, error: friendlyError, userFriendly: true }
    }
  }
  
  // Sign up with email and password
  static async signUp(email: string, password: string, userData: any) {
    try {
      // Set persistence to LOCAL (keeps user signed in across browser sessions)
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

  // Sign out
  static async signOut() {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        // End session first
        await SessionManager.endSession(currentUser.uid)
      }
      
      await signOut(auth)
      return { error: null }
    } catch (error: any) {
      const friendlyError = ErrorHandler.getErrorMessage(error, 'auth')
      return { error: friendlyError }
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
      await setPersistence(auth, browserLocalPersistence)
      console.log('✅ Auth persistence set to LOCAL - users will stay signed in')
      
      // Additional persistence checks
      const currentUser = auth.currentUser
      if (currentUser) {
        console.log('✅ User is already signed in:', currentUser.email)
        console.log('✅ Auth persistence working - user will stay signed in across sessions')
        console.log('✅ User UID:', currentUser.uid)
        console.log('✅ Auth state:', currentUser ? 'AUTHENTICATED' : 'NOT AUTHENTICATED')
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
      // Set persistence to LOCAL (keeps user signed in across browser sessions)
      await setPersistence(auth, browserLocalPersistence)
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
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
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign in with email and password (alias for signIn)
  static async signInWithEmailAndPassword(email: string, password: string) {
    return this.signIn(email, password)
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
      // Set persistence to LOCAL (keeps user signed in across browser sessions)
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
