// Low Data Optimizer - Super fast loading with minimal Firebase costs
// Instagram-style optimization for poor connections

interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

class LowDataOptimizer {
  private static instance: LowDataOptimizer;
  private connectionInfo: ConnectionInfo | null = null;
  private isLowData = false;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  // Cache TTLs based on connection speed
  private readonly TTL = {
    FAST: 5 * 60 * 1000,      // 5 minutes for fast connections
    SLOW: 30 * 60 * 1000,     // 30 minutes for slow connections
    VERY_SLOW: 2 * 60 * 60 * 1000, // 2 hours for very slow connections
    OFFLINE: 24 * 60 * 60 * 1000   // 24 hours when offline
  };

  static getInstance(): LowDataOptimizer {
    if (!LowDataOptimizer.instance) {
      LowDataOptimizer.instance = new LowDataOptimizer();
    }
    return LowDataOptimizer.instance;
  }

  init() {
    this.detectConnection();
    this.setupEventListeners();
    console.log('📱 Low Data Optimizer initialized');
  }

  private detectConnection() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.connectionInfo = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };

      // Determine if this is a low data connection
      this.isLowData = 
        this.connectionInfo.effectiveType === 'slow-2g' ||
        this.connectionInfo.effectiveType === '2g' ||
        this.connectionInfo.downlink < 1 ||
        this.connectionInfo.saveData;

      console.log('📊 Connection detected:', {
        type: this.connectionInfo.effectiveType,
        speed: this.connectionInfo.downlink + 'Mbps',
        rtt: this.connectionInfo.rtt + 'ms',
        saveData: this.connectionInfo.saveData,
        isLowData: this.isLowData
      });

      if (this.isLowData) {
        console.log('⚠️ Low data connection detected - enabling aggressive caching');
      }
    }
  }

  private setupEventListeners() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.detectConnection();
      });
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.detectConnection();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Connection lost');
      this.isLowData = true;
    });
  }

  // Get cache TTL based on connection speed
  getCacheTTL(): number {
    if (!navigator.onLine) return this.TTL.OFFLINE;
    if (!this.connectionInfo) return this.TTL.FAST;
    
    switch (this.connectionInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return this.TTL.VERY_SLOW;
      case '3g':
        return this.TTL.SLOW;
      default:
        return this.TTL.FAST;
    }
  }

  // Smart caching with connection-aware TTL
  set(key: string, data: any): void {
    const ttl = this.getCacheTTL();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`lowdata_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl
      }));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }

    console.log(`💾 Cached ${key} for ${ttl/1000/60} minutes (low data mode)`);
  }

  get(key: string): any | null {
    // Check memory cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`⚡ Cache hit: ${key} (instant load)`);
      return cached.data;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(`lowdata_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          // Restore to memory cache
          this.cache.set(key, parsed);
          console.log(`💾 Restored ${key} from localStorage`);
          return parsed.data;
        } else {
          // Expired, remove it
          localStorage.removeItem(`lowdata_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    return null;
  }

  // Check if we should make a Firebase request
  shouldFetch(key: string): boolean {
    const cached = this.get(key);
    if (cached) {
      console.log(`🚫 Skipping Firebase request for ${key} (cached)`);
      return false;
    }
    
    console.log(`🔥 Making Firebase request for ${key}`);
    return true;
  }

  // Get connection info
  getConnectionInfo(): ConnectionInfo | null {
    return this.connectionInfo;
  }

  // Check if low data mode
  isLowDataMode(): boolean {
    return this.isLowData;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    // Clear localStorage cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('lowdata_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 Low data cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const lowDataOptimizer = LowDataOptimizer.getInstance();


