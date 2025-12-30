// Version Manager for Smart Cache Invalidation
// This ensures users get updates immediately in production

interface VersionInfo {
  version: string;
  buildTime: string;
  lastUpdate: number;
}

class VersionManager {
  private static instance: VersionManager;
  private currentVersion: string;
  private readonly VERSION_KEY = 'app-version';
  private readonly LAST_UPDATE_KEY = 'last-update-check';

  constructor() {
    // Use build time as version for automatic cache busting
    this.currentVersion = this.generateVersion();
  }

  public static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  private generateVersion(): string {
    // Use current timestamp as version for automatic cache busting
    // This ensures every deployment gets a new version
    const buildTime = Date.now().toString();
    return `v${buildTime}`;
  }

  // Check if app version has changed and needs cache refresh
  public async checkForUpdates(): Promise<boolean> {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    try {
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      const lastUpdateCheck = localStorage.getItem(this.LAST_UPDATE_KEY);
      const now = Date.now();
      
      // Check for updates every 5 minutes
      const shouldCheck = !lastUpdateCheck || (now - parseInt(lastUpdateCheck)) > 5 * 60 * 1000;
      
      if (!shouldCheck) {
        return false;
      }

      // Update last check time
      localStorage.setItem(this.LAST_UPDATE_KEY, now.toString());

      // If no stored version or version changed, we need to update
      if (!storedVersion || storedVersion !== this.currentVersion) {
        console.log('🔄 App version changed, clearing caches...');
        console.log(`Old version: ${storedVersion}`);
        console.log(`New version: ${this.currentVersion}`);
        
        await this.clearAllCaches();
        localStorage.setItem(this.VERSION_KEY, this.currentVersion);
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  // Clear all caches when version changes
  private async clearAllCaches(): Promise<void> {
    try {
      // Clear localStorage cache
      this.clearLocalStorageCache();
      
      // Clear service worker cache
      await this.clearServiceWorkerCache();
      
      // Clear browser cache
      await this.clearBrowserCache();
      
      console.log('✅ All caches cleared for new version');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  private clearLocalStorageCache(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('cache') || 
        key.includes('supabase') || 
        key.includes('data') ||
        key.includes('offline') ||
        key.includes('profile') ||
        key.includes('pages')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared ${keysToRemove.length} localStorage cache entries`);
  }

  private async clearServiceWorkerCache(): Promise<void> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log('🧹 Service Worker cache cleared');
      } catch (error) {
        console.error('Error clearing service worker cache:', error);
      }
    }
  }

  private async clearBrowserCache(): Promise<void> {
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🧹 Browser cache cleared');
      } catch (error) {
        console.error('Error clearing browser cache:', error);
      }
    }
  }

  // Force refresh for immediate updates (manual trigger)
  public async forceRefresh(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    
    console.log('🔄 Force refresh triggered...');
    await this.clearAllCaches();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.VERSION_KEY, this.currentVersion);
    }
    window.location.reload();
  }

  // Get current version
  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  // Check if this is a new session (first load after update)
  public isNewSession(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    const storedVersion = localStorage.getItem(this.VERSION_KEY);
    return !storedVersion || storedVersion !== this.currentVersion;
  }
}

export const versionManager = VersionManager.getInstance();

// Auto-check for updates on app start
export const initializeVersionCheck = async (): Promise<void> => {
  const hasUpdates = await versionManager.checkForUpdates();
  
  if (hasUpdates) {
    console.log('🎉 App updated! Fresh data will be loaded.');
    // Show a subtle notification to user
    if (typeof window !== 'undefined') {
      // You can add a toast notification here
      console.log('App has been updated with new features!');
    }
  }
};

// Development helper - force refresh
export const devForceRefresh = (): void => {
  if (process.env.NODE_ENV === 'development') {
    versionManager.forceRefresh();
  }
};
