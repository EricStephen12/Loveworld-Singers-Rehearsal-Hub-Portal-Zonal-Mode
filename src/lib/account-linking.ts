// Account Linking Service - Links KingsChat accounts to existing Firebase accounts
import { FirebaseDatabaseService } from './firebase-database'
import { KingsChatAuthService } from './kingschat-auth'
import { FirebaseAuthService } from './firebase-auth'
import type { UserProfile } from '@/types/supabase'

interface LinkedAccount {
  kingschatUserId?: string
  kingschatEmail?: string
  kingschatLinkedAt?: string
  authProviders: string[] // ['email', 'kingschat']
}

export class AccountLinkingService {
  /**
   * Link KingsChat account to existing Firebase user
   */
  static async linkKingsChatToFirebase(
    firebaseUserId: string,
    kingschatAccessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔗 Linking KingsChat to Firebase account...')

      // Extract KingsChat userId from token (KingsChat SDK doesn't provide profile API)
      let kingschatUserId: string | null = null
      
      try {
        // Decode JWT token to get userId
        const tokenParts = kingschatAccessToken.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          kingschatUserId = payload.sub || payload.userId || payload.user_id || payload.id
          console.log('📦 Extracted KingsChat userId from token:', kingschatUserId)
        }
      } catch (decodeError) {
        console.error('❌ Failed to decode token:', decodeError)
        return { success: false, error: 'Invalid KingsChat token' }
      }
      
      if (!kingschatUserId) {
        return { success: false, error: 'Could not extract user ID from KingsChat token' }
      }

      // Check if this KingsChat account is already linked to another user
      const existingLink = await this.findUserByKingsChatId(kingschatUserId)
      
      if (existingLink) {
        if (existingLink.id === firebaseUserId) {
          // Same user - already linked!
          console.log('ℹ️ KingsChat account is already linked to this user')
          return { 
            success: true
          }
        } else {
          // Different user - CONFLICT! Auto-unlink from old account
          console.log('⚠️ KingsChat account is linked to another account - auto-unlinking...')
          console.log('🔓 Old account ID:', existingLink.id)
          console.log('🆕 New account ID:', firebaseUserId)
          
          try {
            // Unlink from the old account
            await FirebaseDatabaseService.updateDocument('profiles', existingLink.id, {
              kingschatUserId: null,
              kingschatEmail: null,
              kingschatLinkedAt: null,
              authProviders: ['email'], // Reset to email only
              updated_at: new Date().toISOString()
            })
            
            console.log('✅ Successfully unlinked from old account')
            // Continue with linking to new account (fall through to code below)
          } catch (unlinkError) {
            console.error('❌ Failed to unlink from old account:', unlinkError)
            return { 
              success: false, 
              error: 'This KingsChat account is linked to another account, but we could not unlink it automatically. Please contact support.' 
            }
          }
        }
      }

      // Update Firebase user profile with KingsChat data
      const currentProfile = await FirebaseDatabaseService.getDocument('profiles', firebaseUserId) as UserProfile | null
      
      if (!currentProfile) {
        return { success: false, error: 'User profile not found' }
      }

      const authProviders = currentProfile.authProviders || ['email']
      if (!authProviders.includes('kingschat')) {
        authProviders.push('kingschat')
      }

      // Just save the KingsChat UID to the profile
      // NO temp email account creation - keep it simple!
      console.log('🔗 Linking KingsChat UID to existing account...')
      console.log('📧 Account email:', currentProfile.email)
      console.log('🔐 KingsChat UID:', kingschatUserId)

      // Build update data with only the userId (KingsChat doesn't provide more data)
      const updateData: any = {
        kingschatUserId: kingschatUserId,
        kingschatLinkedAt: new Date().toISOString(),
        authProviders: authProviders,
        updated_at: new Date().toISOString()
      }

      await FirebaseDatabaseService.updateDocument('profiles', firebaseUserId, updateData)

      console.log('✅ KingsChat account linked successfully')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Failed to link KingsChat account:', error)
      
      // Convert Firebase errors to user-friendly messages
      let userMessage = 'Unable to link KingsChat account. Please try again.'
      
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        userMessage = 'Permission denied. Please make sure you are logged in.'
      } else if (error.code === 'not-found' || error.message?.includes('not found')) {
        userMessage = 'Account not found. Please sign in first.'
      } else if (error.code === 'network-request-failed') {
        userMessage = 'Network error. Please check your connection and try again.'
      }
      
      return { success: false, error: userMessage }
    }
  }

  /**
   * Unlink KingsChat account from Firebase user
   */
  static async unlinkKingsChatFromFirebase(
    firebaseUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔓 Unlinking KingsChat account...')

      const currentProfile = await FirebaseDatabaseService.getDocument('profiles', firebaseUserId)
      
      if (!currentProfile) {
        return { success: false, error: 'User profile not found' }
      }

      // Remove KingsChat data from profile
      await FirebaseDatabaseService.updateDocument('profiles', firebaseUserId, {
        kingschatUserId: null,
        kingschatEmail: null,
        kingschatLinkedAt: null,
        authProviders: ['email'], // Keep only email
        updated_at: new Date().toISOString()
      })

      // Clear KingsChat tokens
      KingsChatAuthService.clearTokens()

      console.log('✅ KingsChat account unlinked successfully')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Failed to unlink KingsChat account:', error)
      return { success: false, error: error.message || 'Failed to unlink account' }
    }
  }

  /**
   * Find Firebase user by KingsChat user ID
   */
  static async findUserByKingsChatId(kingschatUserId: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 Searching Firestore for kingschatUserId:', kingschatUserId)
      const users = await FirebaseDatabaseService.getCollectionWhere(
        'profiles',
        'kingschatUserId',
        '==',
        kingschatUserId
      )
      
      console.log('🔍 Query returned:', users?.length || 0, 'results')
      if (users && users.length > 0) {
        const user = users[0] as UserProfile
        console.log('✅ Found user:', {
          id: user.id,
          email: user.email,
          hasKingschatPassword: !!user.kingschatPassword
        })
        return user
      }
      
      console.log('❌ No user found with kingschatUserId:', kingschatUserId)
      return null
    } catch (error) {
      console.error('❌ Error finding user by KingsChat ID:', error)
      return null
    }
  }

  /**
   * Find Firebase user by KingsChat email
   */
  static async findUserByKingsChatEmail(email: string): Promise<string | null> {
    try {
      // Query Firestore for user with this email
      const users = await FirebaseDatabaseService.getCollectionWhere(
        'profiles',
        'email',
        '==',
        email
      )

      if (users && users.length > 0) {
        return users[0].id
      }

      return null
    } catch (error) {
      console.error('❌ Failed to find user by email:', error)
      return null
    }
  }

  /**
   * Check if user has KingsChat linked
   */
  static async isKingsChatLinked(firebaseUserId: string): Promise<boolean> {
    try {
      const profile = await FirebaseDatabaseService.getDocument('profiles', firebaseUserId) as UserProfile | null
      return !!(profile?.kingschatUserId)
    } catch (error) {
      console.error('❌ Failed to check KingsChat link status:', error)
      return false
    }
  }

  /**
   * Handle KingsChat login - either link to existing account or create new one
   */
  static async handleKingsChatLogin(
    kingschatAccessToken: string
  ): Promise<{ 
    success: boolean
    userId?: string | null
    email?: string | null
    isNewUser?: boolean
    needsLinking?: boolean
    needsFirebaseSignIn?: boolean
    kingschatUserId?: string
    error?: string 
  }> {
    try {
      console.log('🔐 Handling KingsChat login...')

      // Extract KingsChat userId from token (KingsChat SDK doesn't provide profile API)
      let kingschatUserId: string | null = null
      
      try {
        // Decode JWT token to get userId
        const tokenParts = kingschatAccessToken.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          kingschatUserId = payload.sub || payload.userId || payload.user_id || payload.id
          console.log('📦 Extracted KingsChat userId from token:', kingschatUserId)
        }
      } catch (decodeError) {
        console.error('❌ Failed to decode token:', decodeError)
        return { success: false, error: 'Invalid KingsChat token' }
      }
      
      if (!kingschatUserId) {
        return { success: false, error: 'Could not extract user ID from KingsChat token' }
      }

      // Simple approach: Try to sign in with temp email
      // If it works = existing user, if it fails = new user
      const tempEmail = `${kingschatUserId}@kingschat.temp`
      console.log('🔍 Trying to sign in with temp email:', tempEmail)
      
      try {
        // Try to get the user's stored password from Firestore
        const profiles = await FirebaseDatabaseService.getCollectionWhere(
          'profiles',
          'kingschatUserId',
          '==',
          kingschatUserId
        ) as UserProfile[]
        
        if (profiles && profiles.length > 0 && profiles[0].kingschatPassword) {
          // Found profile with password - try to sign in
          console.log('✅ Found profile with stored password')
          const storedPassword = profiles[0].kingschatPassword
          
          const signInResult = await FirebaseAuthService.signInWithEmailAndPassword(
            tempEmail,
            storedPassword
          )
          
          if (!signInResult.error) {
            // Success! Existing user signed in
            console.log('✅ Successfully signed in existing user!')
            return { 
              success: true, 
              userId: profiles[0].id,
              email: profiles[0].email || 'KingsChat',
              isNewUser: false,
              kingschatUserId: kingschatUserId
            }
          }
        }
        
        // If we get here, either no profile found or sign-in failed
        // This means it's a new user
        console.log('🆕 New user - no existing account found')
      } catch (error) {
        console.log('🆕 New user - error checking for existing account:', error)
      }

      // New user - redirect to profile completion
      console.log('📝 KingsChat UID:', kingschatUserId)
      
      // Return success with the KingsChat UID
      // The auth page will redirect them to profile completion
      // where they'll fill in their email, name, etc.
      return { 
        success: true, 
        userId: null, // No Firebase UID yet - will be created after profile completion
        email: null, // No email yet - will be filled in profile completion
        isNewUser: true,
        kingschatUserId: kingschatUserId // Save this to use when creating profile
      }

    } catch (error: any) {
      console.error('❌ Failed to handle KingsChat login:', error)
      
      // Convert Firebase errors to user-friendly messages
      let userMessage = 'Unable to complete KingsChat login. Please try again.'
      
      if (error.code === 'auth/email-already-in-use' || error.message?.includes('email-already-in-use')) {
        userMessage = 'This KingsChat account is already registered. Please sign in instead.'
      } else if (error.code === 'auth/network-request-failed') {
        userMessage = 'Network error. Please check your connection and try again.'
      } else if (error.code === 'auth/too-many-requests') {
        userMessage = 'Too many attempts. Please wait a moment and try again.'
      }
      
      return { success: false, error: userMessage }
    }
  }
}
