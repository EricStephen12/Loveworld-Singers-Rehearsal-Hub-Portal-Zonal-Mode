// Compatibility hook for Zustand auth store
// This allows existing code using useAuth() to work without changes
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const user = useAuthStore(state => state.user)
  const profile = useAuthStore(state => state.profile)
  const isLoading = useAuthStore(state => state.isLoading)
  const signOut = useAuthStore(state => state.signOut)
  const refreshProfile = useAuthStore(state => state.refreshProfile)

  return {
    user,
    profile,
    isLoading,
    signOut,
    refreshProfile
  }
}
