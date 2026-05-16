import { FirebaseDatabaseService } from './firebase-database';
import { BackendAPI } from './api-client';
import { isHQGroup } from '@/config/zones';

/**
 * ZONE DATABASE SERVICE (WEBSITE CLIENT)
 * This is a COMPATIBILITY PROXY for zonal operations.
 * Types and Method Signatures are preserved to keep UI functional.
 */

export class ZoneDatabaseService {
  // --- CORE METHODS ---

  static async getPraiseNightsByZone(zoneId: string, limitCount = 10) {
    const response = await BackendAPI.rehearsals.getAll(zoneId);
    return response.data || [];
  }

  static subscribeToPraiseNightsByZone(zoneId: string, callback: (data: any[]) => void, limitCount = 100) {
    return FirebaseDatabaseService.subscribeToCollectionWhere('zone_praise_nights', 'zoneId', '==', zoneId, callback, limitCount);
  }

  static async getSongsByPraiseNight(praiseNightId: string, zoneId?: string) {
    const collectionName = (zoneId && isHQGroup(zoneId)) ? 'praise_night_songs' : 'zone_songs';
    const response = await BackendAPI.generic.list(collectionName, 500, 'praiseNightId', praiseNightId, '==');
    return response.data || [];
  }

  static async getAllSongsByZone(zoneId: string) {
    const collectionName = isHQGroup(zoneId) ? 'praise_night_songs' : 'zone_songs';
    const response = await BackendAPI.generic.list(collectionName, 1000, 'zoneId', zoneId, '==');
    return response.data || [];
  }

  static async createPraiseNight(zoneId: string, data: any) {
    return await BackendAPI.rehearsals.create({ ...data, zoneId });
  }

  static async createSong(zoneId: string, praiseNightId: string, songData: any) {
    return await BackendAPI.songs.create({ ...songData, zoneId, praiseNightId });
  }

  static async updatePraiseNight(praiseNightId: string, data: any, _zoneId?: string) {
    return await BackendAPI.rehearsals.update(praiseNightId, data);
  }

  static async updateSong(songId: string, data: any) {
    return await BackendAPI.songs.update(songId, data);
  }

  static async deletePraiseNight(praiseNightId: string, _zoneId?: string) {
    return await BackendAPI.rehearsals.delete(praiseNightId);
  }

  static async deleteSong(songId: string) {
    return await BackendAPI.songs.delete(songId);
  }

  // --- CATEGORIES (Restored for Admin UI) ---

  static async getCategories(zoneId: string) {
    const isHQ = isHQGroup(zoneId);
    const collectionName = isHQ ? 'categories' : 'zone_categories';
    const response = isHQ 
      ? await BackendAPI.generic.list(collectionName, 1000)
      : await BackendAPI.generic.list(collectionName, 500, 'zoneId', zoneId, '==');
    return response.data || [];
  }

  static async getCategoriesByZone(zoneId: string) {
    return await this.getCategories(zoneId);
  }

  static async createCategory(zoneId: string, data: any) {
    const collectionName = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
    const payload = isHQGroup(zoneId) ? data : { ...data, zoneId };
    return await BackendAPI.generic.create(collectionName, payload);
  }

  static async updateCategory(zoneId: string, categoryId: string, data: any) {
    const collectionName = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
    return await BackendAPI.generic.update(collectionName, categoryId, data);
  }

  static async deleteCategory(zoneId: string, categoryId: string) {
    const collectionName = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
    return await BackendAPI.generic.delete(collectionName, categoryId);
  }

  // Page Categories
  static async getPageCategories(zoneId: string) {
    const isHQ = isHQGroup(zoneId);
    const collectionName = isHQ ? 'page_categories' : 'zone_page_categories';
    const response = isHQ
      ? await BackendAPI.generic.list(collectionName, 1000)
      : await BackendAPI.generic.list(collectionName, 500, 'zoneId', zoneId, '==');
    return (response.data || []).sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  static async createPageCategory(zoneId: string, data: any) {
    const isHQ = isHQGroup(zoneId);
    const collectionName = isHQ ? 'page_categories' : 'zone_page_categories';
    const payload = isHQ ? data : { ...data, zoneId };
    return await BackendAPI.generic.create(collectionName, payload);
  }

  static async updatePageCategory(zoneId: string, categoryId: string, data: any) {
    const collectionName = isHQGroup(zoneId) ? 'page_categories' : 'zone_page_categories';
    return await BackendAPI.generic.update(collectionName, categoryId, data);
  }

  static async deletePageCategory(zoneId: string, categoryId: string) {
    const collectionName = isHQGroup(zoneId) ? 'page_categories' : 'zone_page_categories';
    return await BackendAPI.generic.delete(collectionName, categoryId);
  }

  static async updatePageCategoryOrder(zoneId: string, categories: any[]) {
    for (let i = 0; i < categories.length; i++) {
      await this.updatePageCategory(zoneId, categories[i].id, { orderIndex: i });
    }
    return { success: true };
  }

  // --- CACHE STUBS ---
  static invalidateCategoriesCache(_zoneId: string) {}
  static invalidatePageCategoriesCache(_zoneId: string) {}

  // --- MASTER LIBRARY (Restored) ---
  static async getMasterSongs() {
    const response = await BackendAPI.songs.getAll();
    return response.data || [];
  }

  static async importFromMasterLibrary(zoneId: string, praiseNightId: string, masterSong: any, importedBy: string) {
    return await this.createSong(zoneId, praiseNightId, { 
      ...masterSong, 
      importedFrom: 'master',
      originalSongId: masterSong.id,
      importedBy
    });
  }
}
