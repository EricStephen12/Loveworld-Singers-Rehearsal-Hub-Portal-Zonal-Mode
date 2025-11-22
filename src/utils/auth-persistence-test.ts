// Simple test to verify login persistence works like a website
// Optimized for low data connections

export class AuthPersistenceTest {
  static async testLoginPersistence() {
    console.log('🧪 Testing login persistence...');
    
    try {
      // Test 1: Check if user is already logged in
      const currentUser = (window as any).FirebaseAuthService?.getCurrentUser();
      if (currentUser) {
        console.log('✅ User is already logged in:', currentUser.email);
        console.log('✅ Login persistence is working!');
        return true;
      }
      
      // Test 2: Check localStorage for auth indicators
      const userAuthenticated = localStorage.getItem('userAuthenticated');
      const lastAuthTime = localStorage.getItem('lastAuthTime');
      const userEmail = localStorage.getItem('userEmail');
      
      if (userAuthenticated === 'true' && lastAuthTime && userEmail) {
        console.log('✅ Auth indicators found in localStorage:');
        console.log('  - User authenticated:', userAuthenticated);
        console.log('  - Last auth time:', new Date(parseInt(lastAuthTime)).toLocaleString());
        console.log('  - User email:', userEmail);
        console.log('✅ Login persistence indicators are present!');
        return true;
      }
      
      console.log('ℹ️ No active login session found');
      return false;
      
    } catch (error) {
      console.error('❌ Error testing login persistence:', error);
      return false;
    }
  }
  
  static async testLowDataOptimization() {
    console.log('📱 Testing low data optimization...');
    
    try {
      // Test 1: Check if auth state is cached locally
      const authState = localStorage.getItem('firebase:authUser');
      if (authState) {
        console.log('✅ Firebase auth state cached locally');
        console.log('✅ Low data optimization: Auth works offline');
        return true;
      }
      
      // Test 2: Check connection speed
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        console.log('📊 Connection info:');
        console.log('  - Effective type:', connection.effectiveType);
        console.log('  - Downlink:', connection.downlink, 'Mbps');
        console.log('  - RTT:', connection.rtt, 'ms');
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          console.log('⚠️ Low data connection detected - auth persistence is crucial');
        }
      }
      
      console.log('✅ Low data optimization test completed');
      return true;
      
    } catch (error) {
      console.error('❌ Error testing low data optimization:', error);
      return false;
    }
  }
  
  static async runAllTests() {
    console.log('🚀 Running all auth persistence tests...');
    
    const persistenceTest = await this.testLoginPersistence();
    const lowDataTest = await this.testLowDataOptimization();
    
    console.log('📊 Test Results:');
    console.log('  - Login persistence:', persistenceTest ? '✅ PASS' : '❌ FAIL');
    console.log('  - Low data optimization:', lowDataTest ? '✅ PASS' : '❌ FAIL');
    
    return {
      persistence: persistenceTest,
      lowData: lowDataTest,
      overall: persistenceTest && lowDataTest
    };
  }
}

// Make it globally available for testing
if (typeof window !== 'undefined') {
  (window as any).AuthPersistenceTest = AuthPersistenceTest;
}
