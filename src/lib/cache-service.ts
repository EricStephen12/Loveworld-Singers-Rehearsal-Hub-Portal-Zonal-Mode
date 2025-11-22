// src/lib/cache-service.ts
'use client'

interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>()
  // No caching - everything is real-time
  private readonly NO_CACHE = 0 // No cache for real-time features
  private readonly REAL_TIME_TTL = 0 // No cache for dynamic content
  private readonly DEFAULT_TTL = 0 // No cache for semi-static content
  private readonly LONG_TTL = 0 // No cache for static content
  private readonly VERY_LONG_TTL = 0 // No cache for very static content

  // Set cache with TTL
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Don't cache if TTL is 0 (real-time features)
    if (ttl === this.NO_CACHE) {
      return;
    }
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    }
    this.cache.set(key, item)
    
    // Only store in localStorage for longer TTL items
    if (ttl >= this.DEFAULT_TTL) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(item))
      } catch (error) {
        console.warn('Failed to store cache in localStorage:', error)
      }
    }
  }

  // Get cache item
  get<T>(key: string): T | null {
    // First check memory cache
    const memoryItem = this.cache.get(key)
    if (memoryItem && Date.now() < memoryItem.expiry) {
      return memoryItem.data
    }

    // Then check localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored)
        if (Date.now() < item.expiry) {
          // Restore to memory cache
          this.cache.set(key, item)
          return item.data
        } else {
          // Expired, remove from localStorage
          localStorage.removeItem(`cache_${key}`)
        }
      }
    } catch (error) {
      console.warn('Failed to read cache from localStorage:', error)
    }

    return null
  }

  // Check if cache exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Instagram-style cache methods
  setRealTime<T>(key: string, data: T): void {
    this.set(key, data, this.REAL_TIME_TTL)
  }

  setStatic<T>(key: string, data: T): void {
    this.set(key, data, this.LONG_TTL)
  }

  setVeryStatic<T>(key: string, data: T): void {
    this.set(key, data, this.VERY_LONG_TTL)
  }

  // Clear cache for specific key
  clear(key: string): void {
    this.cache.delete(key)
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error)
    }
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear()
    try {
      // Clear all cache items from localStorage
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear all cache from localStorage:', error)
    }
  }

  // Cache with different TTL strategies
  setUserData<T>(key: string, data: T): void {
    this.set(key, data, this.LONG_TTL)
  }

  setStaticData<T>(key: string, data: T): void {
    this.set(key, data, this.VERY_LONG_TTL)
  }

  setTemporaryData<T>(key: string, data: T): void {
    this.set(key, data, 2 * 60 * 1000) // 2 minutes (moderate)
  }

  // Preload data
  async preload<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Check if already cached
    const cached = this.get<T>(key)
    if (cached) {
      return cached
    }

    // Fetch and cache
    try {
      const data = await fetcher()
      this.set(key, data, ttl)
      return data
    } catch (error) {
      console.error(`Failed to preload data for key ${key}:`, error)
      throw error
    }
  }

  // Smart cache invalidation - like Instagram
  invalidateUserData(userId: string): void {
    const keysToInvalidate = [
      `${CACHE_KEYS.USER_PROFILE}_${userId}`,
      `${CACHE_KEYS.GROUPS}_${userId}`,
      `${CACHE_KEYS.FRIENDS}_${userId}`,
      `${CACHE_KEYS.NOTIFICATIONS}_${userId}`
    ]
    
    keysToInvalidate.forEach(key => this.clear(key))
    console.log('🔄 Invalidated user cache for fresh data')
  }

  // Check if cache is stale (for background refresh)
  isStale(key: string, maxAge: number = 5 * 60 * 1000): boolean {
    const item = this.cache.get(key)
    if (!item) return true
    
    return (Date.now() - item.timestamp) > maxAge
  }

  // Get cache stats
  getStats() {
    const memorySize = this.cache.size
    let localStorageSize = 0
    
    try {
      const keys = Object.keys(localStorage)
      localStorageSize = keys.filter(key => key.startsWith('cache_')).length
    } catch (error) {
      console.warn('Failed to get localStorage cache stats:', error)
    }

    return {
      memoryCacheSize: memorySize,
      localStorageCacheSize: localStorageSize,
      totalCacheSize: memorySize + localStorageSize
    }
  }
}

export const cacheService = new CacheService()

// Cache keys constants
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  GROUPS: 'groups',
  FRIENDS: 'friends',
  PRAISE_NIGHTS: 'praise_nights',
  SONGS: 'songs',
  NOTIFICATIONS: 'notifications',
  APP_STATE: 'app_state'
} as const

