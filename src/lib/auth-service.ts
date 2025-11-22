import { supabase } from './supabase-client'
import type { SignUpData, ProfileCompletionData, UserProfile } from '@/types/supabase'

export class AuthService {
  // Sign up with email and password
  static async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          }
        }
      })

      if (authError) throw authError

      // Check if user needs email confirmation
      if (authData.user && !authData.session) {
        // User created but needs email confirmation
        // DISABLED: Skip email confirmation for development
        return { 
          user: authData.user, 
          session: null, 
          needsEmailConfirmation: false 
        }
      }

      // Update the profile with additional information if user is confirmed
      if (authData.user && authData.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
          })
          .eq('id', authData.user.id)

        if (profileError) {
          console.error('Profile update error:', profileError)
        }
      }

      return { 
        user: authData.user, 
        session: authData.session,
        needsEmailConfirmation: false 
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Signin error:', error)
      throw error
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Google signin error:', error)
      throw error
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Signout error:', error)
      throw error
    }
  }

  // Get current user profile
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      // Add timeout protection to prevent hanging
      const userPromise = supabase.auth.getUser()
      const userTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('User check timeout'))
        }, 3000) // 3 second timeout
      })

      const userResult = await Promise.race([userPromise, userTimeoutPromise]) as any
      const { data: { user } } = userResult

      if (!user) return null

      // Add timeout protection for profile fetch
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const profileTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Profile fetch timeout'))
        }, 3000) // 3 second timeout
      })

      const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]) as any
      const { data: profile, error } = profileResult

      if (error) {
        console.error('Profile fetch error:', error)
        return null
      }

      // Cache the profile for instant loading next time
      if (profile && typeof window !== 'undefined') {
        localStorage.setItem('cached_user_profile', JSON.stringify(profile))
      }

      return profile
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  // Complete user profile
  static async completeProfile(data: ProfileCompletionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('No authenticated user')

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          middle_name: data.middleName,
          gender: data.gender,
          birthday: data.birthday,
          phone_number: data.phoneNumber,
          region: data.region,
          zone: data.zone,
          church: data.church,
          designation: data.designation,
          administration: data.administration,
          profile_completed: true,
        })
        .eq('id', user.id)

      if (error) throw error

      // Add welcome achievements
      await this.addAchievement(user.id, 'Profile Complete', 'Completed your profile information')

      // Clear cached profile to force fresh load
      localStorage.removeItem('cached_user_profile')
      
      // Refresh and cache the updated profile
      await this.getCurrentUserProfile()

      return true
    } catch (error) {
      console.error('Profile completion error:', error)
      throw error
    }
  }

  // Add achievement to user
  static async addAchievement(userId: string, name: string, description?: string) {
    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: userId,
          achievement_name: name,
          achievement_description: description,
        })

      if (error) throw error
    } catch (error) {
      console.error('Add achievement error:', error)
    }
  }

  // Get user achievements
  static async getUserAchievements(userId: string) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_date', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Get achievements error:', error)
      return []
    }
  }

  // Get user attendance
  static async getUserAttendance(userId: string) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false })
        .limit(10)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Get attendance error:', error)
      return []
    }
  }

  // Check if user profile is complete
  static async isProfileComplete(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile()
      console.log('Profile data:', profile)
      console.log('Profile completed flag:', profile?.profile_completed)
      return profile?.profile_completed || false
    } catch (error) {
      console.error('Profile check error:', error)
      return false
    }
  }

  // Get current session with timeout protection
  static async getCurrentSession() {
    try {
      // Add timeout protection to prevent hanging
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Session check timeout'))
        }, 4000) // 4 second timeout
      })

      const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any
      const { data: { session } } = sessionResult
      console.log('📡 getCurrentSession result:', session ? 'Session found' : 'No session')
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }

  // Alias for getCurrentSession (for compatibility)
  static async getSession() {
    return this.getCurrentSession()
  }

  // Get cached session from localStorage (instant, synchronous)
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

  // Resend email confirmation
  static async resendEmailConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Resend email error:', error)
      throw error
    }
  }

  // Check if user is confirmed
  static async isUserConfirmed(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user?.email_confirmed_at != null
    } catch (error) {
      console.error('Check confirmation error:', error)
      return false
    }
  }

  // Get current user info including confirmation status
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Update password error:', error)
      throw error
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}