// Utility function for refreshing app data while preserving auth
export const handleAppRefresh = async () => {
  try {
    console.log('🔄 Refreshing app data...');
    console.log('🔐 Preserving authentication data...');
    
    // Show user feedback
    if (typeof window !== 'undefined') {
      // Create a simple loading indicator
      const loadingDiv = document.createElement('div');
      loadingDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            background: white;
            color: #333;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          ">
            <div style="
              width: 24px;
              height: 24px;
              border: 2px solid #e5e7eb;
              border-top: 2px solid #8b5cf6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 12px;
            "></div>
            <div style="font-weight: 600; margin-bottom: 4px;">Refreshing App</div>
            <div style="font-size: 14px; color: #6b7280;">Preserving your login...</div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(loadingDiv);
    }
    
    // Clear all caches except auth data and countdown persistence keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        // Preserve Firebase/auth/session keys
        !key.includes('firebase') &&
        !key.includes('auth') &&
        !key.includes('session') &&
        !key.includes('loveworld-singers-session') &&
        !key.startsWith('firebase:') &&
        !key.includes('__firebase') &&
        // Preserve countdown persistence keys
        !key.startsWith('server_target_date_') &&
        !key.startsWith('countdown_hash_')
      ) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('✅ Cache cleared, preserving auth data');
    console.log('🔐 Auth persistence maintained - you will stay logged in');
    
    // Reload the page for complete refresh
    setTimeout(() => {
      // Remove loading indicator before reload
      const loadingDiv = document.querySelector('body > div[style*="position: fixed"]')
      if (loadingDiv) {
        loadingDiv.remove()
      }
      window.location.reload();
    }, 1000); // Increased delay to show loading indicator
    
  } catch (error) {
    console.error('❌ Refresh error:', error);
    // Fallback to page reload
    window.location.reload();
  }
};
