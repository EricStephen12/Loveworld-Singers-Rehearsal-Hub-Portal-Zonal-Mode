// Instagram-style caching strategy for LWSRH
// Balances performance with real-time updates

interface CacheStrategy {
  // Critical data - cached for performance
  CRITICAL: string[];
  // Dynamic data - always fresh
  DYNAMIC: string[];
  // Static data - cached longer
  STATIC: string[];
}

class InstagramStyleCache {
  private static instance: InstagramStyleCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  // Instagram-style cache categories
  private readonly STRATEGY: CacheStrategy = {
    CRITICAL: [
      'user-profile',
      'app-settings',
      'navigation-structure'
    ],
    DYNAMIC: [
      'songs',
      'comments',
      'rehearsal-count',
      'song-details',
      'lyrics',
      'solfas'
    ],
    STATIC: [
      'app-config',
      'categories',
      'static-content'
    ]
  };

  // TTL values (Instagram-style)
  private readonly TTL = {
    CRITICAL: 5 * 60 * 1000,    // 5 minutes - user profile, settings
    DYNAMIC: 10 * 1000,         // 10 seconds - songs, comments, counts
    STATIC: 30 * 60 * 1000,     // 30 minutes - categories, config
    NO_CACHE: 0                 // Always fresh
  };

  static getInstance(): InstagramStyleCache {
    if (!InstagramStyleCache.instance) {
      InstagramStyleCache.instance = new InstagramStyleCache();
    }
    return InstagramStyleCache.instance;
  }

  // Get cache TTL based on data type
  private getTTL(key: string): number {
    if (this.STRATEGY.CRITICAL.includes(key)) return this.TTL.CRITICAL;
    if (this.STRATEGY.DYNAMIC.includes(key)) return this.TTL.DYNAMIC;
    if (this.STRATEGY.STATIC.includes(key)) return this.TTL.STATIC;
    return this.TTL.NO_CACHE; // Default to no cache
  }

  // Set cache with smart TTL
  set(key: string, data: any): void {
    const ttl = this.getTTL(key);
    
    // Don't cache if TTL is 0
    if (ttl === 0) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    console.log(`📱 Instagram-style cache set: ${key} (TTL: ${ttl}ms)`);
  }

  // Get cache with smart validation
  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`📱 Instagram-style cache hit: ${key}`);
    return cached.data;
  }

  // Clear specific cache
  clear(key: string): void {
    this.cache.delete(key);
    console.log(`📱 Instagram-style cache cleared: ${key}`);
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
    console.log(`📱 Instagram-style cache cleared: all`);
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const instagramCache = InstagramStyleCache.getInstance();


