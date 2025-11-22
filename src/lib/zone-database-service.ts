// Zone-Aware Database Service
// All queries are filtered by current zone

import { FirebaseDatabaseService } from './firebase-database'

export class ZoneDatabaseService {
  
  /**
   * Get praise nights for a specific zone
   */
  static async getPraiseNightsByZone(zoneId: string, limitCount = 10) {
    try {
      console.log('🔍 Getting praise nights for zone:', zoneId)
      
      const allPraiseNights = await FirebaseDatabaseService.getCollectionWhere(
        'praise_nights',
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
   * Get songs for a specific praise night (already zone-filtered via praiseNightId)
   */
  static async getSongsByPraiseNight(praiseNightId: string) {
    try {
      return await FirebaseDatabaseService.getSongs(praiseNightId)
    } catch (error) {
      console.error('❌ Error getting songs:', error)
      return []
    }
  }
  
  /**
   * Get all songs for a zone (across all praise nights)
   */
  static async getAllSongsByZone(zoneId: string) {
    try {
      console.log('🔍 Getting all songs for zone:', zoneId)
      
      const allSongs = await FirebaseDatabaseService.getCollectionWhere(
        'songs',
        'zoneId',
        '==',
        zoneId
      )
      
      console.log('✅ Found', allSongs.length, 'songs for zone')
      return allSongs
    } catch (error) {
      console.error('❌ Error getting songs by zone:', error)
      return []
    }
  }
  
  /**
   * Create praise night for a zone
   */
  static async createPraiseNight(zoneId: string, data: any) {
    try {
      console.log('📝 Creating praise night for zone:', zoneId)
      
      const praiseNightData = {
        ...data,
        zoneId, // Add zone ID
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await FirebaseDatabaseService.addPraiseNight(praiseNightData)
      
      if (result.success) {
        console.log('✅ Praise night created for zone')
      }
      
      return result
    } catch (error) {
      console.error('❌ Error creating praise night:', error)
      return { success: false }
    }
  }
  
  /**
   * Create song for a zone
   */
  static async createSong(zoneId: string, praiseNightId: string, songData: any) {
    try {
      console.log('📝 Creating song for zone:', zoneId)
      
      const data = {
        ...songData,
        zoneId, // Add zone ID
        praiseNightId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await FirebaseDatabaseService.createSong(data)
      
      if (result.success) {
        console.log('✅ Song created for zone')
      }
      
      return result
    } catch (error) {
      console.error('❌ Error creating song:', error)
      return { success: false }
    }
  }
  
  /**
   * Update praise night (zone is already set, can't be changed)
   */
  static async updatePraiseNight(praiseNightId: string, data: any) {
    try {
      // Don't allow changing zoneId
      const updateData = { ...data }
      delete updateData.zoneId
      
      return await FirebaseDatabaseService.updatePraiseNight(praiseNightId, updateData)
    } catch (error) {
      console.error('❌ Error updating praise night:', error)
      return { success: false }
    }
  }
  
  /**
   * Update song (zone is already set, can't be changed)
   */
  static async updateSong(songId: string, data: any) {
    try {
      // Don't allow changing zoneId
      const updateData = { ...data }
      delete updateData.zoneId
      
      return await FirebaseDatabaseService.updateSong(songId, updateData)
    } catch (error) {
      console.error('❌ Error updating song:', error)
      return { success: false }
    }
  }
  
  /**
   * Delete praise night
   */
  static async deletePraiseNight(praiseNightId: string) {
    try {
      return await FirebaseDatabaseService.deletePraiseNight(praiseNightId)
    } catch (error) {
      console.error('❌ Error deleting praise night:', error)
      return { success: false }
    }
  }
  
  /**
   * Delete song
   */
  static async deleteSong(songId: string) {
    try {
      return await FirebaseDatabaseService.deleteSong(songId)
    } catch (error) {
      console.error('❌ Error deleting song:', error)
      return { success: false }
    }
  }
  
  /**
   * Get categories for a zone
   */
  static async getCategoriesByZone(zoneId: string) {
    try {
      const categories = await FirebaseDatabaseService.getCollectionWhere(
        'categories',
        'zoneId',
        '==',
        zoneId
      )
      
      return categories
    } catch (error) {
      console.error('❌ Error getting categories:', error)
      return []
    }
  }
  
  /**
   * Create category for a zone
   */
  static async createCategory(zoneId: string, categoryData: any) {
    try {
      const data = {
        ...categoryData,
        zoneId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      return await FirebaseDatabaseService.createCategory(data)
    } catch (error) {
      console.error('❌ Error creating category:', error)
      return { success: false }
    }
  }
  
  /**
   * Get page categories for a zone
   */
  static async getPageCategoriesByZone(zoneId: string) {
    try {
      const pageCategories = await FirebaseDatabaseService.getCollectionWhere(
        'page_categories',
        'zoneId',
        '==',
        zoneId
      )
      
      return pageCategories
    } catch (error) {
      console.error('❌ Error getting page categories:', error)
      return []
    }
  }
  
  /**
   * Create page category for a zone
   */
  static async createPageCategory(zoneId: string, data: any) {
    try {
      const categoryData = {
        ...data,
        zoneId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      return await FirebaseDatabaseService.createPageCategory(categoryData)
    } catch (error) {
      console.error('❌ Error creating page category:', error)
      return { success: false }
    }
  }
  
  /**
   * Update page category for a zone
   */
  static async updatePageCategory(zoneId: string, pageCategoryId: string, data: any) {
    try {
      // Don't allow changing zoneId
      const updateData = { ...data }
      delete updateData.zoneId
      
      return await FirebaseDatabaseService.updatePageCategory(pageCategoryId, updateData)
    } catch (error) {
      console.error('❌ Error updating page category:', error)
      return { success: false }
    }
  }
  
  /**
   * Delete page category
   */
  static async deletePageCategory(zoneId: string, pageCategoryId: string) {
    try {
      return await FirebaseDatabaseService.deletePageCategory(pageCategoryId)
    } catch (error) {
      console.error('❌ Error deleting page category:', error)
      return { success: false }
    }
  }
  
  /**
   * Update category for a zone
   */
  static async updateCategory(zoneId: string, categoryId: string, data: any) {
    try {
      // Don't allow changing zoneId
      const updateData = { ...data }
      delete updateData.zoneId
      
      return await FirebaseDatabaseService.updateCategory(categoryId, updateData)
    } catch (error) {
      console.error('❌ Error updating category:', error)
      return { success: false }
    }
  }
  
  /**
   * Delete category
   */
  static async deleteCategory(zoneId: string, categoryId: string) {
    try {
      return await FirebaseDatabaseService.deleteCategory(categoryId)
    } catch (error) {
      console.error('❌ Error deleting category:', error)
      return { success: false }
    }
  }
  
  /**
   * Get categories for a zone (alias for getCategoriesByZone)
   */
  static async getCategories(zoneId: string) {
    return this.getCategoriesByZone(zoneId)
  }
  
  /**
   * Get page categories for a zone (alias for getPageCategoriesByZone)
   */
  static async getPageCategories(zoneId: string) {
    return this.getPageCategoriesByZone(zoneId)
  }
}
