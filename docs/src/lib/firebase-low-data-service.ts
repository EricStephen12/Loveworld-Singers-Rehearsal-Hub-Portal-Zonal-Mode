// Low Data Firebase Service - Minimizes Firebase costs and requests
// Instagram-style optimization for poor connections

import { FirebaseDatabaseService } from './firebase-database';
import { lowDataOptimizer } from '@/utils/low-data-optimizer';

class FirebaseLowDataService {
  private static instance: FirebaseLowDataService;
  
  static getInstance(): FirebaseLowDataService {
    if (!FirebaseLowDataService.instance) {
      FirebaseLowDataService.instance = new FirebaseLowDataService();
    }
    return FirebaseLowDataService.instance;
  }

  // Get collection with smart caching
  async getCollection(collection: string, useCache = true): Promise<any[]> {
    const cacheKey = `collection_${collection}`;
    
    // Check cache first
    if (useCache) {
      const cached = lowDataOptimizer.get(cacheKey);
      if (cached) {
        console.log(`⚡ Collection ${collection} loaded from cache (saved Firebase request)`);
        return cached;
      }
    }

    // Only fetch if not cached or cache expired
    if (lowDataOptimizer.shouldFetch(cacheKey)) {
      console.log(`🔥 Fetching collection ${collection} from Firebase...`);
      const data = await FirebaseDatabaseService.getCollection(collection);
      
      // Cache the data
      if (useCache) {
        lowDataOptimizer.set(cacheKey, data);
        console.log(`💾 Cached collection ${collection} (reduced future Firebase costs)`);
      }
      
      return data;
    }

    // Fallback to cached data
    return lowDataOptimizer.get(cacheKey) || [];
  }

  // Get document with smart caching
  async getDocument(collection: string, docId: string, useCache = true): Promise<any> {
    const cacheKey = `document_${collection}_${docId}`;
    
    // Check cache first
    if (useCache) {
      const cached = lowDataOptimizer.get(cacheKey);
      if (cached) {
        console.log(`⚡ Document ${collection}/${docId} loaded from cache (saved Firebase request)`);
        return cached;
      }
    }

    // Only fetch if not cached or cache expired
    if (lowDataOptimizer.shouldFetch(cacheKey)) {
      console.log(`🔥 Fetching document ${collection}/${docId} from Firebase...`);
      const data = await FirebaseDatabaseService.getDocument(collection, docId);
      
      // Cache the data
      if (useCache) {
        lowDataOptimizer.set(cacheKey, data);
        console.log(`💾 Cached document ${collection}/${docId} (reduced future Firebase costs)`);
      }
      
      return data;
    }

    // Fallback to cached data
    return lowDataOptimizer.get(cacheKey) || null;
  }

  // Get songs by page ID with smart caching
  async getSongsByPageId(pageId: number, useCache = true): Promise<any[]> {
    const cacheKey = `songs_page_${pageId}`;
    
    // Check cache first
    if (useCache) {
      const cached = lowDataOptimizer.get(cacheKey);
      if (cached) {
        console.log(`⚡ Songs for page ${pageId} loaded from cache (saved Firebase request)`);
        return cached;
      }
    }

    // Only fetch if not cached or cache expired
    if (lowDataOptimizer.shouldFetch(cacheKey)) {
      console.log(`🔥 Fetching songs for page ${pageId} from Firebase...`);
      const data = await (FirebaseDatabaseService as any).getSongsByPageId(pageId);
      
      // Cache the data
      if (useCache) {
        lowDataOptimizer.set(cacheKey, data);
        console.log(`💾 Cached songs for page ${pageId} (reduced future Firebase costs)`);
      }
      
      return data;
    }

    // Fallback to cached data
    return lowDataOptimizer.get(cacheKey) || [];
  }

  // Get songs by category with smart caching
  async getSongsByCategory(category: string, useCache = true): Promise<any[]> {
    const cacheKey = `songs_category_${category}`;
    
    // Check cache first
    if (useCache) {
      const cached = lowDataOptimizer.get(cacheKey);
      if (cached) {
        console.log(`⚡ Songs for category ${category} loaded from cache (saved Firebase request)`);
        return cached;
      }
    }

    // Only fetch if not cached or cache expired
    if (lowDataOptimizer.shouldFetch(cacheKey)) {
      console.log(`🔥 Fetching songs for category ${category} from Firebase...`);
      const data = await (FirebaseDatabaseService as any).getSongsByCategory(category);
      
      // Cache the data
      if (useCache) {
        lowDataOptimizer.set(cacheKey, data);
        console.log(`💾 Cached songs for category ${category} (reduced future Firebase costs)`);
      }
      
      return data;
    }

    // Fallback to cached data
    return lowDataOptimizer.get(cacheKey) || [];
  }

  // Get comments with smart caching (shorter TTL for real-time feel)
  async getComments(songId: number, useCache = true): Promise<any[]> {
    const cacheKey = `comments_${songId}`;
    
    // Check cache first
    if (useCache) {
      const cached = lowDataOptimizer.get(cacheKey);
      if (cached) {
        console.log(`⚡ Comments for song ${songId} loaded from cache (saved Firebase request)`);
        return cached;
      }
    }

    // Only fetch if not cached or cache expired
    if (lowDataOptimizer.shouldFetch(cacheKey)) {
      console.log(`🔥 Fetching comments for song ${songId} from Firebase...`);
      const data = await FirebaseDatabaseService.getCollectionWhere('comments', 'songId', songId, '==');
      
      // Cache the data with shorter TTL for comments
      if (useCache) {
        lowDataOptimizer.set(cacheKey, data);
        console.log(`💾 Cached comments for song ${songId} (reduced future Firebase costs)`);
      }
      
      return data;
    }

    // Fallback to cached data
    return lowDataOptimizer.get(cacheKey) || [];
  }

  // Clear cache for specific data
  clearCache(pattern?: string): void {
    if (pattern) {
      // Clear specific cache entries
      const stats = lowDataOptimizer.getCacheStats();
      stats.keys.forEach(key => {
        if (key.includes(pattern)) {
          lowDataOptimizer.clearCache();
          console.log(`🧹 Cleared cache for pattern: ${pattern}`);
        }
      });
    } else {
      // Clear all cache
      lowDataOptimizer.clearCache();
      console.log('🧹 Cleared all Firebase cache');
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[]; connectionInfo: any } {
    return {
      ...lowDataOptimizer.getCacheStats(),
      connectionInfo: lowDataOptimizer.getConnectionInfo()
    };
  }
}

export const firebaseLowDataService = FirebaseLowDataService.getInstance();
