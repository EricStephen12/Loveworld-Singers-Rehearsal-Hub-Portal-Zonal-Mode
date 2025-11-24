// Zone-Aware Database Service
// All queries use separate zone-specific collections to avoid conflicts with HQ data
// 
// HQ Groups (zone-001 to zone-005) use: praise_nights, songs, categories, etc.
// Regular Zones (zone-006+) use: zone_praise_nights, zone_songs, zone_categories, etc.

import { FirebaseDatabaseService } from './firebase-database'

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
   * Create praise night for a zone
   * Saves to zone_praise_nights collection
   */
  static async createPraiseNight(zoneId: string, data: any) {
    try {
      console.log('📝 Creating zone praise night for zone:', zoneId)
      
      const praiseNightData = {
        ...data,
        zoneId, // Add zone ID
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Use addDocument to save to zone_praise_nights collection with auto-generated ID
      const result = await FirebaseDatabaseService.addDocument(
        'zone_praise_nights',
        praiseNightData
      )
      
      console.log('✅ Zone praise night created:', result.id)
      return { success: true, id: result.id, firebaseId: result.id }
    } catch (error) {
      console.error('❌ Error creating zone praise night:', error)
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
   * Update praise night (zone is already set, can't be changed)
   * Updates in zone_praise_nights collection
   */
  static async updatePraiseNight(praiseNightId: string, data: any) {
    try {
      // Don't allow changing zoneId
      const updateData = { ...data, updatedAt: new Date() }
      delete updateData.zoneId
      
      await FirebaseDatabaseService.updateDocument('zone_praise_nights', praiseNightId, updateData)
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating zone praise night:', error)
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
   * Delete praise night from zone_praise_nights collection
   */
  static async deletePraiseNight(praiseNightId: string) {
    try {
      await FirebaseDatabaseService.deleteDocument('zone_praise_nights', praiseNightId)
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting zone praise night:', error)
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
   * Get categories for a zone - HQ AWARE
   */
  static async getCategories(zoneId: string) {
    // Import here to avoid circular dependency
    const { isHQGroup } = await import('@/config/zones')
    
    if (isHQGroup(zoneId)) {
      console.log('🏢 Loading HQ categories from categories collection (unfiltered)')
      return await FirebaseDatabaseService.getCollection('categories')
    } else {
      console.log('📍 Loading zone categories from zone_categories collection (filtered)')
      return this.getCategoriesByZone(zoneId)
    }
  }
  
  /**
   * Get page categories for a zone - HQ AWARE
   */
  static async getPageCategories(zoneId: string) {
    // Import here to avoid circular dependency
    const { isHQGroup } = await import('@/config/zones')
    
    if (isHQGroup(zoneId)) {
      console.log('🏢 Loading HQ page categories from page_categories collection (unfiltered)')
      return await FirebaseDatabaseService.getCollection('page_categories')
    } else {
      console.log('📍 Loading zone page categories from zone_page_categories collection (filtered)')
      return this.getPageCategoriesByZone(zoneId)
    }
  }
}
