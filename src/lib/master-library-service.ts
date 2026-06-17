import { BackendAPI } from './api-client';

/**
 * MASTER LIBRARY SERVICE (WEBSITE CLIENT)
 * This is a COMPATIBILITY PROXY for the central song library.
 */

export interface MasterSong {
  id: string;
  title: string;
  lyrics?: string;
  solfa?: string;
  key?: string;
  tempo?: string;
  writer?: string;
  leadSinger?: string;
  category?: string;
  categories?: string[];
  audioFile?: string;
  imageUrl?: string;
  audioUrls?: any;
  importCount: number;
  publishedAt: Date;
  updatedAt: Date;
  originalSongId?: string;
  conductor?: string;
  leadKeyboardist?: string;
  bassGuitarist?: string;
  drummer?: string;
  customParts?: string[];
}

export interface MasterProgram {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  publishedBy: string;
  publishedByName: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder?: number;
}

export class MasterLibraryService {
  // --- SONGS ---
  
  static async getMasterSongs(_limitCount = 10000, _forceRefresh = false): Promise<MasterSong[]> {
    const response = await BackendAPI.songs.getAll();
    return response.data || [];
  }

  static async getMasterSong(songId: string): Promise<MasterSong | null> {
    const response = await BackendAPI.songs.getById(songId);
    return response.data;
  }

  static async loadMoreMasterSongs(_limitCount = 1000): Promise<MasterSong[]> {
    return []; // Backend currently returns all
  }

  static hasMoreMasterSongs(): boolean {
    return false;
  }

  // --- PROGRAMS ---

  static async getMasterPrograms(): Promise<MasterProgram[]> {
    const response = await BackendAPI.generic.list('master_programs');
    return response.data || [];
  }

  static async createMasterProgram(name: string, publishedBy: string, publishedByName: string, description?: string) {
    return await BackendAPI.generic.create('master_programs', {
      name, publishedBy, publishedByName, description, songIds: [], createdAt: new Date()
    });
  }

  static async deleteMasterProgram(id: string) {
    return await BackendAPI.generic.delete('master_programs', id);
  }

  static async updateMasterProgramsOrder(updatedPrograms: MasterProgram[]) {
    for (let i = 0; i < updatedPrograms.length; i++) {
      await BackendAPI.generic.update('master_programs', updatedPrograms[i].id, { sortOrder: i });
    }
    return { success: true, error: null as any };
  }

  static async addSongsToProgram(programId: string, songIds: string[]) {
    return await BackendAPI.generic.update('master_programs', programId, { songIds });
  }

  static async addSongToProgram(programId: string, songId: string) {
    const program = await this.getMasterPrograms().then(ps => ps.find(p => p.id === programId));
    if (!program) return;
    const songIds = Array.from(new Set([...(program.songIds || []), songId]));
    return await this.addSongsToProgram(programId, songIds);
  }

  static async removeSongFromProgram(programId: string, songId: string) {
    const program = await this.getMasterPrograms().then(ps => ps.find(p => p.id === programId));
    if (!program) return;
    const songIds = (program.songIds || []).filter(id => id !== songId);
    return await this.addSongsToProgram(programId, songIds);
  }

  // --- STATS & SEARCH ---

  static async getMasterLibraryStats() {
    const songs = await this.getMasterSongs();
    return {
      totalSongs: songs.length,
      totalImports: songs.reduce((acc, s) => acc + (s.importCount || 0), 0),
      mostImported: songs.sort((a, b) => (b.importCount || 0) - (a.importCount || 0)).slice(0, 5)
    };
  }

  static async searchMasterSongs(searchTerm: string): Promise<MasterSong[]> {
    const all = await this.getMasterSongs();
    const term = searchTerm.toLowerCase();
    return all.filter(s => s.title?.toLowerCase().includes(term));
  }

  // HQ Internal
  static async getHQInternalSongs(_limitCount = 200) {
    const response = await BackendAPI.generic.list('praise_night_songs');
    return response.data || [];
  }

  static hasMoreHQInternalSongs(): boolean { return false; }
  static async loadMoreHQInternalSongs(_limitCount = 100) { return []; }

  // --- ACTIONS ---

  static async publishToMasterLibrary(originalSong: any, publishedBy: string, _publishedByName?: string) {
    return await BackendAPI.songs.create({ ...originalSong, sourceType: 'published', publishedBy });
  }

  static async createMasterSong(songData: any, publishedBy: string, _publishedByName?: string) {
    return await BackendAPI.songs.create({ ...songData, publishedBy });
  }

  static async updateMasterSong(songId: string, data: any) {
    return await BackendAPI.songs.update(songId, data);
  }

  static async deleteMasterSong(songId: string) {
    return await BackendAPI.songs.delete(songId);
  }

  static async importToZone(masterSong: MasterSong, zoneId: string, praiseNightId: string, importedBy: string) {
    return await BackendAPI.songs.create({ 
      ...masterSong, 
      zoneId, 
      praiseNightId, 
      importedFrom: 'master', 
      originalSongId: masterSong.id,
      importedBy 
    });
  }
}
