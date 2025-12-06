'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase-setup'
import { FirebaseAuthService } from '@/lib/firebase-auth'


interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔐 Auth state:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user')
      setUser(firebaseUser)
      setLoading(false) // Done checking - we now know the real state
    })

    return unsubscribe
  }, []) // Run ONCE on mount

  const handleSignOut = async () => {
    try {
      await FirebaseAuthService.signOut()
      // Firebase will automatically trigger onAuthStateChanged with null
      // which will update our state
      
      // Clear any app-specific storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Redirect to auth
      window.location.replace('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect even on error
      window.location.replace('/auth')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
