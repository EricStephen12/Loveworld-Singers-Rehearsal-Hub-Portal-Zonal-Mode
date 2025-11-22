// Feature Update Manager - Like Instagram PWA
// Handles feature rollouts and cache invalidation for new features

interface FeatureUpdate {
  featureId: string;
  version: string;
  rolloutPercentage: number;
  enabled: boolean;
  cacheKeys: string[];
  description: string;
}

interface AppVersion {
  version: string;
  buildTime: string;
  features: string[];
  forceUpdate: boolean;
}

class FeatureUpdateManager {
  private static instance: FeatureUpdateManager;
  private readonly FEATURE_KEY = 'app-features';
  private readonly VERSION_KEY = 'app-version-info';
  private readonly LAST_CHECK_KEY = 'last-feature-check';
  
  // Current app version - update this when you add new features
  private readonly CURRENT_VERSION: AppVersion = {
    version: '3.1.0', // Increment this when adding new features
    buildTime: new Date().toISOString(),
    features: [
      'video-calls', // New video call feature
      'enhanced-chat',
      'improved-navigation',
      'viewport-fixes'
    ],
    forceUpdate: false // Set to true to force all users to update
  };

  // Feature definitions - control which users see new features
  private readonly FEATURES: FeatureUpdate[] = [
    {
      featureId: 'video-calls',
      version: '3.1.0',
      rolloutPercentage: 100, // 100% rollout for video calls
      enabled: true,
      cacheKeys: ['chat-cache', 'media-cache', 'user-cache'],
      description: 'Video call functionality in chat'
    },
    {
      featureId: 'enhanced-chat',
      version: '3.1.0',
      rolloutPercentage: 100,
      enabled: true,
      cacheKeys: ['chat-cache', 'messages-cache'],
      description: 'Enhanced chat interface with better UX'
    },
    {
      featureId: 'improved-navigation',
      version: '3.1.0',
      rolloutPercentage: 100,
      enabled: true,
      cacheKeys: ['navigation-cache', 'user-cache'],
      description: 'Improved back navigation and routing'
    },
    {
      featureId: 'viewport-fixes',
      version: '3.1.0',
      rolloutPercentage: 100,
      enabled: true,
      cacheKeys: ['layout-cache', 'ui-cache'],
      description: 'Fixed viewport height issues on app resume'
    }
  ];

  public static getInstance(): FeatureUpdateManager {
    if (!FeatureUpdateManager.instance) {
      FeatureUpdateManager.instance = new FeatureUpdateManager();
    }
    return FeatureUpdateManager.instance;
  }

  // Check for feature updates and handle cache invalidation
  public async checkForFeatureUpdates(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      const lastCheck = localStorage.getItem(this.LAST_CHECK_KEY);
      const now = Date.now();

      // Check every 2 minutes (more frequent than version check)
      const shouldCheck = !lastCheck || (now - parseInt(lastCheck)) > 2 * 60 * 1000;

      if (!shouldCheck) {
        return false;
      }

      localStorage.setItem(this.LAST_CHECK_KEY, now.toString());

      // Check if version changed
      const needsUpdate = !storedVersion || 
        storedVersion !== this.CURRENT_VERSION.version ||
        this.CURRENT_VERSION.forceUpdate;

      if (needsUpdate) {
        console.log('🚀 New features detected!', {
          oldVersion: storedVersion,
          newVersion: this.CURRENT_VERSION.version,
          newFeatures: this.CURRENT_VERSION.features
        });

        await this.handleFeatureUpdate();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Feature update check failed:', error);
      return false;
    }
  }

  // Handle feature update - clear relevant caches
  private async handleFeatureUpdate(): Promise<void> {
    try {
      // Clear feature-specific caches
      const cacheKeysToClear = new Set<string>();
      
      this.FEATURES.forEach(feature => {
        if (feature.enabled) {
          feature.cacheKeys.forEach(key => cacheKeysToClear.add(key));
        }
      });

      // Clear localStorage caches
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Clear feature-related caches
          cacheKeysToClear.forEach(cacheKey => {
            if (key.includes(cacheKey)) {
              keysToRemove.push(key);
            }
          });
          
          // Clear old version caches
          if (key.includes('cache') || key.includes('Cache')) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Cleared cache:', key);
      });

      // Clear service worker caches
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Clearing service worker cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }

      // Update stored version
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION.version);
      localStorage.setItem(this.FEATURE_KEY, JSON.stringify(this.CURRENT_VERSION.features));

      // Show update notification
      this.showUpdateNotification();

      console.log('✅ Feature update completed');
    } catch (error) {
      console.error('Feature update failed:', error);
    }
  }

  // Check if a specific feature is enabled for this user
  public isFeatureEnabled(featureId: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const feature = this.FEATURES.find(f => f.featureId === featureId);
      if (!feature) return false;

      // Check if feature is enabled
      if (!feature.enabled) return false;

      // Check rollout percentage (like Instagram does)
      const userId = this.getUserId();
      const userHash = this.hashUserId(userId);
      const rolloutThreshold = feature.rolloutPercentage / 100;

      return userHash < rolloutThreshold;
    } catch (error) {
      console.error('Feature check failed:', error);
      return false;
    }
  }

  // Get user ID for consistent feature rollout
  private getUserId(): string {
    // Try to get from auth context or generate consistent ID
    const authUser = localStorage.getItem('userAuthenticated');
    if (authUser) {
      return authUser;
    }
    
    // Generate consistent ID based on browser fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('feature-rollout', 10, 10);
    const fingerprint = canvas.toDataURL();
    
    return btoa(fingerprint).slice(0, 16);
  }

  // Hash user ID for consistent rollout
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  // Show update notification to user via notification system
  private async showUpdateNotification(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Create a system notification for feature updates
      const notificationData = {
        title: '✨ New Features Available',
        message: `Version ${this.CURRENT_VERSION.version} is now available with ${this.CURRENT_VERSION.features.length} new features`,
        type: 'info' as const,
        category: 'system' as const,
        priority: 'medium' as const,
        target_audience: 'all' as const,
        action_url: '/pages/notifications', // Link to notifications page
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expire in 7 days
      };

      // Send to notification system
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        console.log('✅ Feature update notification sent to all users');
      } else {
        console.log('⚠️ Failed to send feature update notification');
      }
    } catch (error) {
      console.error('Error sending feature update notification:', error);
    }
  }

  // Force refresh for all users (emergency updates)
  public forceRefresh(): void {
    if (typeof window === 'undefined') return;

    console.log('🔄 Force refreshing app for all users...');
    
    // Clear all caches
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear service worker caches
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      });
    }

    // Reload page
    window.location.reload();
  }

  // Get current version info
  public getVersionInfo(): AppVersion {
    return { ...this.CURRENT_VERSION };
  }

  // Get enabled features for current user
  public getEnabledFeatures(): string[] {
    return this.FEATURES
      .filter(feature => this.isFeatureEnabled(feature.featureId))
      .map(feature => feature.featureId);
  }
}

export const featureUpdateManager = FeatureUpdateManager.getInstance();
export default featureUpdateManager;
