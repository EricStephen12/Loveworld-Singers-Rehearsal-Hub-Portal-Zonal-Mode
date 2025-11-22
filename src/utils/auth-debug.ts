// Auth Debug Utility - Like Instagram's debugging
export class AuthDebug {
  static logAuthState() {
    if (typeof window === 'undefined') return;
    
    const authState = {
      userAuthenticated: localStorage.getItem('userAuthenticated'),
      hasCompletedProfile: localStorage.getItem('hasCompletedProfile'),
      bypassLogin: localStorage.getItem('bypassLogin'),
      lastAuthTime: localStorage.getItem('lastAuthTime'),
      timeSinceAuth: localStorage.getItem('lastAuthTime') ? 
        Date.now() - parseInt(localStorage.getItem('lastAuthTime')!) : 'N/A'
    };
    
    console.log('🔍 Auth Debug State:', authState);
    return authState;
  }
  
  static clearAuthFlags() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('userAuthenticated');
    localStorage.removeItem('hasCompletedProfile');
    localStorage.removeItem('bypassLogin');
    localStorage.removeItem('lastAuthTime');
    
    console.log('🧹 Auth flags cleared');
  }
  
  static setAuthFlags() {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('userAuthenticated', 'true');
    localStorage.setItem('hasCompletedProfile', 'true');
    localStorage.setItem('bypassLogin', 'true');
    localStorage.setItem('lastAuthTime', Date.now().toString());
    
    console.log('✅ Auth flags set');
  }
}

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  (window as any).AuthDebug = AuthDebug;
}
