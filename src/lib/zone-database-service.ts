// Zone-Aware Database Service
// All queries use separate zone-specific collections to avoid conflicts with HQ data
// 
// HQ Groups (zone-001 to zone-005) use: praise_nights, songs, categories, etc.
// Regular Zones (zone-006+) use: zone_praise_nights, zone_songs, zone_categories, etc.

import { FirebaseDatabaseService } from './firebase-database'

// In-memory cache for categories (5 minute TTL)
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface CategoriesCache {
  data: any[];
  timestamp: number;
  zoneId: string;
}
const categoriesCache = new Map<string, CategoriesCache>();
const pageCategoriesCache = new Map<string, CategoriesCache>();

function isCategoriesCacheValid(cache: CategoriesCache | undefined): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CATEGORIES_CACHE_TTL;
}

export class ZoneDatabaseService {
  
  /**
   * Get praise nights for a specific zone
   * Uses zone_praise_nights collection (separate from HQ's praise_nights)
   */
  static async getPraiseNightsByZone(zoneId: string, limitCount = 10) {
    try {
      console.log('🔍 Getting zone praise nights for zone:', zoneId)
      
      const allPraiseNights = await FirebaseDatabaseService.getCollectionWhere(
        'zone_praise_nights',
        'zoneId',
        '==',
        zoneId
      )
      
      // Sort by createdAt (newest first)
      const sorted = allPraiseNights.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })
      
      // Limit results
      const limited = sorted.slice(0, limitCount)
      
      console.log('✅ Found', limited.length, 'praise nights for zone')
      return limited
    } catch (error) {
      console.error('❌ Error getting praise nights by zone:', error)
      return []
    }
  }
  
  /**
   * Get songs for a specific praise night
   * Uses zone_songs collection
   */
  static async getSongsByPraiseNight(praiseNightId: string) {
    try {
      const songs = await FirebaseDatabaseService.getCollectionWhere(
        'zone_songs',
        'praiseNightId',
        '==',
        praiseNightId
      )
      
      // Sort by orderIndex
      return songs.sort((a: any, b: any) => {
        const indexA = a.orderIndex || 0
        const indexB = b.orderIndex || 0
        return indexA - indexB
      })
    } catch (error) {
      console.error('❌ Error getting zone songs:', error)
      return []
    }
  }
  
  /**
   * Get all songs for a zone (across all praise nights)
   * Uses zone_songs collection (separate from HQ's songs)
   */
  static async getAllSongsByZone(zoneId: string) {
    try {
      console.log('🔍 Getting all zone songs for zone:', zoneId)
      
      const allSongs = await FirebaseDatabaseService.getCollectionWhere(
        'zone_songs',
        'zoneId',
        '==',
        zoneId
      )
      
      console.log('✅ Found', allSongs.length, 'zone songs for zone')
      return allSongs
    } catch (error) {
      console.error('❌ Error getting zone songs by zone:', error)
      return []
    }
  }
  
  /**
   * Create praise night for a zone - HQ AWARE
   * HQ groups → saves to praise_nights (unfiltered)
   * Regular zones → saves to zone_praise_nights
   */
  static async createPraiseNight(zoneId: string, data: any) {
    try {
      // Import here to avoid circular dependency
      const { isHQGroup } = await import('@/config/zones')
      const now = new Date()

      if (isHQGroup(zoneId)) {
        console.log('🏢 [ZoneDB] Creating HQ praise night in praise_nights collection for zone:', zoneId)

        const praiseNightData = {
          ...data,
          zoneId,
          scope: 'hq',
          createdAt: now,
          updatedAt: now
        }

        const result = await FirebaseDatabaseService.addDocument('praise_nights', praiseNightData)
        console.log('✅ [ZoneDB] HQ praise night created:', result.id)
        return { success: true, id: result.id, firebaseId: result.id }
      } else {
        console.log('📍 [ZoneDB] Creating zone praise night in zone_praise_nights for zone:', zoneId)
      
      const praiseNightData = {
        ...data,
        zoneId, // Add zone ID
        scope: 'zone', // Mark as zone-level rehearsal (Phase 4)
          createdAt: now,
          updatedAt: now
      }
      
        const result = await FirebaseDatabaseService.addDocument('zone_praise_nights', praiseNightData)
        console.log('✅ [ZoneDB] Zone praise night created:', result.id)
      return { success: true, id: result.id, firebaseId: result.id }
      }
    } catch (error) {
      console.error('❌ [ZoneDB] Error creating praise night:', error)
      return { success: false }
    }
  }
  
  /**
   * Create song for a zone
   * Saves to zone_songs collection
   */
  static async createSong(zoneId: string, praiseNightId: string, songData: any) {
    try {
      console.log('📝 Creating zone song for zone:', zoneId)
      
      const data = {
        ...songData,
        zoneId, // Add zone ID
        praiseNightId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      )
      
      // Save to zone_songs collection
      const result = await FirebaseDatabaseService.addDocument('zone_songs', cleanData)
      
      console.log('✅ Zone song created:', result.id)
      return { success: true, id: result.id, song: { ...cleanData, id: result.id } }
    } catch (error) {
      console.error('❌ Error creating zone song:', error)
      return { success: false }
    }
  }
  
  /**
   * Update praise night - HQ AWARE
   * HQ groups → updates praise_nights
   * Regular zones → updates zone_praise_nights
   */
  static async updatePraiseNight(praiseNightId: string, data: any, zoneId?: string) {
    try {
      // Don't allow changing zoneId
      const updateData = { ...data, updatedAt: new Date() }
      delete updateData.zoneId
      
      if (zoneId) {
        const { isHQGroup } = await import('@/config/zones')
        if (isHQGroup(zoneId)) {
          console.log('🏢 [ZoneDB] Updating HQ praise night in praise_nights:', praiseNightId)
          return await FirebaseDatabaseService.updatePraiseNight(praiseNightId, updateData)
        }
      }

      console.log('📍 [ZoneDB] Updating zone praise night in zone_praise_nights:', praiseNightId)
      await FirebaseDatabaseService.updateDocument('zone_praise_nights', praiseNightId, updateData)
      return { success: true }
    } catch (error) {
      console.error('❌ [ZoneDB] Error updating praise night:', error)
      return { success: false }
    }
  }
  
  /**
   * Update song (zone is already set, can't be changed)
   * Updates in zone_songs collection
   */
  static async updateSong(songId: string, data: any) {
    try {
      // Don't allow changing zoneId
      const updateData = { ...data, updatedAt: new Date() }
      delete updateData.zoneId
      delete updateData.id
      delete updateData.firebaseId
      
      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      )
      
      await FirebaseDatabaseService.updateDocument('zone_songs', songId, cleanData)
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating zone song:', error)
      return { success: false }
    }
  }
  
  /**
   * Delete praise night - HQ AWARE
   * HQ groups → deletes from praise_nights
   * Regular zones → deletes from zone_praise_nights
   */
  static async deletePraiseNight(praiseNightId: string, zoneId?: string) {
    try {
      if (zoneId) {
        const { isHQGroup } = await import('@/config/zones')
        if (isHQGroup(zoneId)) {
          console.log('🏢 [ZoneDB] Deleting HQ praise night from praise_nights:', praiseNightId)
          return await FirebaseDatabaseService.deletePraiseNight(praiseNightId)
        }
      }

      console.log('📍 [ZoneDB] Deleting zone praise night from zone_praise_nights:', praiseNightId)
      await FirebaseDatabaseService.deleteDocument('zone_praise_nights', praiseNightId)
      return { success: true }
    } catch (error) {
      console.error('❌ [ZoneDB] Error deleting praise night:', error)
      return { success: false }
    }
  }
  
  /**
   * Delete song from zone_songs collection
   */
  static async deleteSong(songId: string) {
    try {
      await FirebaseDatabaseService.deleteDocument('zone_songs', songId)
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting zone song:', error)
      return { success: false }
    }
  }
  
  /**
   * Get categories for a zone
   * Uses zone_categories collection
   */
  static async getCategoriesByZone(zoneId: string) {
    try {
      const categories = await FirebaseDatabaseService.getCollectionWhere(
        'zone_categories',
        'zoneId',
        '==',
        zoneId
      )
      
      return categories
    } catch (error) {
      console.error('❌ Error getting zone categories:', error)
      return []
    }
  }
  
  /**
   * Create category for a zone - HQ AWARE
   */
  static async createCategory(zoneId: string, categoryData: any) {
    try {
      // Import here to avoid circular dependency
      const { isHQGroup } = await import('@/config/zones')
      
      if (isHQGroup(zoneId)) {
        console.log('🏢 Creating HQ category in categories collection (unfiltered)')
        const data = {
          ...categoryData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await FirebaseDatabaseService.addDocument('categories', data)
        this.invalidateCategoriesCache(zoneId) // Invalidate cache
        return { success: true, id: result.id, ...data }
      } else {
        console.log('📍 Creating zone category in zone_categories collection (filtered)')
        const data = {
          ...categoryData,
          zoneId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await FirebaseDatabaseService.addDocument('zone_categories', data)
        this.invalidateCategoriesCache(zoneId) // Invalidate cache
        return { success: true, id: result.id, ...data }
      }
    } catch (error) {
      console.error('❌ Error creating category:', error)
      return { success: false }
    }
  }
  
  /**
   * Get page categories for a zone
   * Uses zone_page_categories collection
   */
  static async getPageCategoriesByZone(zoneId: string) {
    try {
      const pageCategories = await FirebaseDatabaseService.getCollectionWhere(
        'zone_page_categories',
        'zoneId',
        '==',
        zoneId
      )
      
      return pageCategories
    } catch (error) {
      console.error('❌ Error getting zone page categories:', error)
      return []
    }
  }
  
  /**
   * Create page category for a zone - HQ AWARE
   */
  static async createPageCategory(zoneId: string, data: any) {
    try {
      // Import here to avoid circular dependency
      const { isHQGroup } = await import('@/config/zones')
      
      if (isHQGroup(zoneId)) {
        console.log('🏢 Creating HQ page category in page_categories collection (unfiltered)')
        const categoryData = {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await FirebaseDatabaseService.addDocument('page_categories', categoryData)
        this.invalidatePageCategoriesCache(zoneId) // Invalidate cache
        return { success: true, id: result.id }
      } else {
        console.log('📍 Creating zone page category in zone_page_categories collection (filtered)')
        const categoryData = {
          ...data,
          zoneId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await FirebaseDatabaseService.addDocument('zone_page_categories', categoryData)
        this.invalidatePageCategoriesCache(zoneId) // Invalidate cache
        return { success: true, id: result.id }
      }
    } catch (error) {
      console.error('❌ Error creating page category:', error)
      return { success: false }
    }
  }
  
  /**
   * Update page category for a zone - HQ AWARE
   */
  static async updatePageCategory(zoneId: string, pageCategoryId: string, data: any) {
    try {
      // Import here to avoid circular dependency
      const { isHQGroup } = await import('@/config/zones')
      
      const updateData = { ...data, updatedAt: new Date() }
      delete updateData.zoneId
      
      if (isHQGroup(zoneId)) {
        console.log('🏢 Updating HQ page category in page_categories collection')
        await FirebaseDatabaseService.updateDocument('page_categories', pageCategoryId, updateData)
      } else {
        console.log('📍 Updating zone page category in zone_page_categories collection')
        await FirebaseDatabaseService.updateDocument('zone_page_categories', pageCategoryId, updateData)
      }
      
      this.invalidatePageCategoriesCache(zoneId) // Invalidate cache
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating page category:', error)
      return { success: false }
    }
  }
  
  /**
   * Delete page category - HQ AWARE
   */
  static async deletePageCategory(zoneId: string, pageCategoryId: string) {
    try {
      // Import here to avoid circular dependency
      const { isHQGroup } = await import('@/config/zones')
      
      if (isHQGroup(zoneId)) {
        console.log('🏢 Deleting HQ page category from page_categories collection')
        await FirebaseDatabaseService.deleteDocument('page_categories', pageCategoryId)
      } else {
        console.log('📍 Deleting zone page category from zone_page_categories collection')
        await FirebaseDatabaseService.deleteDocument('zone_page_categories', pageCategoryId)
      }
      
      this.invalidatePageCategoriesCache(zoneId) // Invalidate cache
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting page category:', error)
      return { success: false }
    }
  }
  
  /**
   * Update category for a zone - HQ AWARE
   */
  static async updateCategory(zoneId: string, categoryId: string, data: any) {
    try {
      // Import here to avoid circular dependency
      const { isHQGroup } = await import('@/config/zones')
      
      const updateData = { ...data, updatedAt: new Date() }
      delete updateData.zoneId
      
      if (isHQGroup(zoneId)) {
        console.log('🏢 Updating HQ category in categories collection')
        await FirebaseDatabaseService.updateDocument('categories', categoryId, updateData)
      } else {
        console.log('📍 Updating zone category in zone_categories collection')
        await FirebaseDatabaseService.updateDocument('zone_categories', categoryId, updateData)
      }
      
      this.invalidateCategoriesCache(zoneId) // Invalidate cache
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating category:', error)
      return { success: false }
    }
  }
  
  /**
   * Delete category - HQ AWARE
   */
  static async deleteCategory(zoneId: string, categoryId: string) {
    try {
      // Import here to avoid circular dependency
      const { isHQGroup } = await import('@/config/zones')
      
      if (isHQGroup(zoneId)) {
        console.log('🏢 Deleting HQ category from categories collection')
        await FirebaseDatabaseService.deleteDocument('categories', categoryId)
      } else {
        console.log('📍 Deleting zone category from zone_categories collection')
        await FirebaseDatabaseService.deleteDocument('zone_categories', categoryId)
      }
      
      this.invalidateCategoriesCache(zoneId) // Invalidate cache
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting category:', error)
      return { success: false }
    }
  }
  
  /**
   * Get song history for a zone song
   * Uses zone_song_history collection
   */
  static async getSongHistory(songId: string) {
    try {
      const history = await FirebaseDatabaseService.getCollectionWhere(
        'zone_song_history',
        'song_id',
        '==',
        songId
      )
      
      // Sort by created_at (newest first)
      return history.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })
    } catch (error) {
      console.error('❌ Error getting zone song history:', error)
      return []
    }
  }
  
  /**
   * Create song history entry for a zone
   * Saves to zone_song_history collection
   */
  static async createSongHistory(historyData: any) {
    try {
      const data = {
        ...historyData,
        created_at: new Date()
      }
      
      const result = await FirebaseDatabaseService.addDocument('zone_song_history', data)
      return { success: true, id: result.id }
    } catch (error) {
      console.error('❌ Error creating zone song history:', error)
      return { success: false }
    }
  }
  
  /**
   * Get categories for a zone - HQ AWARE (with caching)
   */
  static async getCategories(zoneId: string) {
    // Check cache first
    const cacheKey = `categories_${zoneId}`;
    const cached = categoriesCache.get(cacheKey);
    if (isCategoriesCacheValid(cached)) {
      console.log('📦 [Categories] Using cached data for zone:', zoneId);
      return cached!.data;
    }
    
    // Import here to avoid circular dependency
    const { isHQGroup } = await import('@/config/zones')
    
    let categories: any[];
    if (isHQGroup(zoneId)) {
      console.log('🏢 Loading HQ categories from categories collection (unfiltered)')
      categories = await FirebaseDatabaseService.getCollection('categories')
    } else {
      console.log('📍 Loading zone categories from zone_categories collection (filtered)')
      categories = await this.getCategoriesByZone(zoneId)
    }
    
    // Cache the results
    categoriesCache.set(cacheKey, {
      data: categories,
      timestamp: Date.now(),
      zoneId
    });
    console.log('✅ [Categories] Cached for zone:', zoneId);
    
    return categories;
  }
  
  /**
   * Get page categories for a zone - HQ AWARE (with caching)
   */
  static async getPageCategories(zoneId: string) {
    // Check cache first
    const cacheKey = `page_categories_${zoneId}`;
    const cached = pageCategoriesCache.get(cacheKey);
    if (isCategoriesCacheValid(cached)) {
      console.log('📦 [PageCategories] Using cached data for zone:', zoneId);
      return cached!.data;
    }
    
    // Import here to avoid circular dependency
    const { isHQGroup } = await import('@/config/zones')
    
    let pageCategories: any[];
    if (isHQGroup(zoneId)) {
      console.log('🏢 Loading HQ page categories from page_categories collection (unfiltered)')
      pageCategories = await FirebaseDatabaseService.getCollection('page_categories')
    } else {
      console.log('📍 Loading zone page categories from zone_page_categories collection (filtered)')
      pageCategories = await this.getPageCategoriesByZone(zoneId)
    }
    
    // Cache the results
    pageCategoriesCache.set(cacheKey, {
      data: pageCategories,
      timestamp: Date.now(),
      zoneId
    });
    console.log('✅ [PageCategories] Cached for zone:', zoneId);
    
    return pageCategories;
  }
  
  /**
   * Invalidate categories cache (call after create/update/delete)
   */
  static invalidateCategoriesCache(zoneId: string) {
    categoriesCache.delete(`categories_${zoneId}`);
    console.log('🗑️ [Categories] Cache invalidated for zone:', zoneId);
  }
  
  /**
   * Invalidate page categories cache (call after create/update/delete)
   */
  static invalidatePageCategoriesCache(zoneId: string) {
    pageCategoriesCache.delete(`page_categories_${zoneId}`);
    console.log('🗑️ [PageCategories] Cache invalidated for zone:', zoneId);
  }

  // ============================================
  // MASTER LIBRARY FUNCTIONS (Phase 1B)
  // ============================================
  
  /**
   * Get all songs from Master Library
   * Zone Coordinators use this to browse available songs for import
   * OPTIMIZED: Uses MasterLibraryService with caching and limits
   */
  static async getMasterSongs(limit: number = 100) {
    try {
      console.log('📚 [Zone] Getting Master Library songs (limit:', limit, ')...')
      
      // Use the optimized MasterLibraryService with caching
      const { MasterLibraryService } = await import('./master-library-service')
      const songs = await MasterLibraryService.getMasterSongs(limit)
      
      console.log(`✅ [Zone] Found ${songs.length} songs in Master Library`)
      return songs
    } catch (error) {
      console.error('❌ [Zone] Error getting Master Library songs:', error)
      return []
    }
  }
  
  /**
   * Search Master Library songs
   */
  static async searchMasterSongs(searchTerm: string) {
    try {
      const allSongs = await this.getMasterSongs()
      const term = searchTerm.toLowerCase()
      
      return allSongs.filter((song: any) => 
        song.title?.toLowerCase().includes(term) ||
        song.writer?.toLowerCase().includes(term) ||
        song.leadSinger?.toLowerCase().includes(term) ||
        song.category?.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('❌ [Zone] Error searching Master Library:', error)
      return []
    }
  }
  
  /**
   * Import a song from Master Library to Zone
   * Creates a copy in zone_songs with import tracking
   */
  static async importFromMasterLibrary(
    zoneId: string,
    praiseNightId: string,
    masterSong: any,
    importedBy: string
  ) {
    try {
      console.log('📥 [Zone] Importing song from Master Library:', masterSong.title)
      
      // Check if already imported to this praise night
      const existingSongs = await this.getSongsByPraiseNight(praiseNightId)
      const alreadyImported = existingSongs.some(
        (s: any) => s.importedFrom === 'master' && s.originalSongId === masterSong.id
      )
      
      if (alreadyImported) {
        return { 
          success: false, 
          error: 'This song has already been imported to this praise night' 
        }
      }
      
      // Get the next order index
      const maxOrderIndex = existingSongs.reduce(
        (max: number, s: any) => Math.max(max, s.orderIndex || 0), 
        0
      )
      
      // Create zone song data (copy only song data, no comments/history)
      const zoneSongData = {
        // Song data
        title: masterSong.title || '',
        lyrics: masterSong.lyrics || '',
        solfa: masterSong.solfa || '',
        key: masterSong.key || '',
        tempo: masterSong.tempo || '',
        writer: masterSong.writer || '',
        leadSinger: masterSong.leadSinger || '',
        category: masterSong.category || '',
        categories: masterSong.categories || [],
        audioFile: masterSong.audioFile || '',
        audioUrls: masterSong.audioUrls || {},
        // Zone reference
        zoneId,
        praiseNightId,
        orderIndex: maxOrderIndex + 1,
        // Import tracking (NEW)
        importedFrom: 'master',
        originalSongId: masterSong.id,
        importedAt: new Date(),
        importedBy,
        // Metadata
        status: 'unheard',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(zoneSongData).filter(([_, v]) => v !== undefined)
      )
      
      const result = await FirebaseDatabaseService.addDocument('zone_songs', cleanData)
      
      if (result.success && result.id) {
        // Increment import count on master song
        await this.incrementMasterSongImportCount(masterSong.id)
        
        console.log('✅ [Zone] Song imported from Master Library:', result.id)
        return { success: true, id: result.id }
      } else {
        return { success: false, error: 'Failed to import song' }
      }
    } catch (error) {
      console.error('❌ [Zone] Error importing from Master Library:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Increment the import count for a master song
   * OPTIMIZED: Fetch single document instead of entire collection
   */
  static async incrementMasterSongImportCount(masterSongId: string) {
    try {
      // Get single document instead of entire collection
      const masterSong = await FirebaseDatabaseService.getDocument('master_songs', masterSongId)
      
      if (masterSong) {
        const newCount = ((masterSong as any).importCount || 0) + 1
        await FirebaseDatabaseService.updateDocument('master_songs', masterSongId, {
          importCount: newCount
        })
        console.log('📊 [Zone] Import count incremented for:', masterSongId)
      }
    } catch (error) {
      console.error('❌ [Zone] Error incrementing import count:', error)
    }
  }
  
  /**
   * Check if a song was imported from Master Library
   * OPTIMIZED: Fetch single document instead of entire collection
   */
  static async isImportedFromMaster(songId: string): Promise<boolean> {
    try {
      const song = await FirebaseDatabaseService.getDocument('zone_songs', songId)
      return (song as any)?.importedFrom === 'master'
    } catch (error) {
      console.error('❌ [Zone] Error checking import status:', error)
      return false
    }
  }
  
  /**
   * Get all imported songs for a zone (from Master Library)
   */
  static async getImportedSongs(zoneId: string) {
    try {
      const allSongs = await this.getAllSongsByZone(zoneId)
      return allSongs.filter((song: any) => song.importedFrom === 'master')
    } catch (error) {
      console.error('❌ [Zone] Error getting imported songs:', error)
      return []
    }
  }
}
