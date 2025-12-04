// Utility to check Firebase auth persistence status
export function checkAuthPersistence() {
  if (typeof window === 'undefined') return null
  
  const checks = {
    localStorage: {} as Record<string, any>,
    sessionStorage: {} as Record<string, any>,
    indexedDB: [] as string[],
  }
  
  // Check localStorage for Firebase keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.includes('firebase')) {
      try {
        checks.localStorage[key] = localStorage.getItem(key)?.substring(0, 50) + '...'
      } catch (e) {
        checks.localStorage[key] = 'Error reading'
      }
    }
  }
  
  // Check sessionStorage for Firebase keys
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && key.includes('firebase')) {
      try {
        checks.sessionStorage[key] = sessionStorage.getItem(key)?.substring(0, 50) + '...'
      } catch (e) {
        checks.sessionStorage[key] = 'Error reading'
      }
    }
  }
  
  console.log('🔍 Firebase Auth Persistence Check:', checks)
  return checks
}

// Call this on app startup to debug
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      checkAuthPersistence()
    }, 1000)
  })
}
