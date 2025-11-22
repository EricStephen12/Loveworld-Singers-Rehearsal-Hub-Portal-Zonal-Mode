import { supabase } from './supabase-client'
import type { ProfileCompletionData } from '@/types/supabase'

export class AuthService {
  // Simple session management - no complex caching
  static getCachedSession() {
    // Don't use localStorage for sessions - always check with Supabase
    return null
  }

  static async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  // Get user profile
  static async getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  // Sign in with email
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  // Sign up with email
  static async signUpWithEmail(email: string, password: string, userData: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  // Sign up (for compatibility)
  static async signUp(data: any) {
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

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Complete profile
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
      return true
    } catch (error) {
      console.error('Profile completion error:', error)
      throw error
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return true
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  // Listen for auth changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
