import { db } from './firebase-setup';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

export interface SchedulingProgram {
  id: string;
  zoneId: string;
  name: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  newSongs: any[];
  carriedOver: any[];
  swapped: any[];
  invalidSongs: any[];
  nameChanges: any[];
  dailySchedules: any[];
  submitters: any[]; 
  weeks?: any[];
  days?: any[];
  currentWeekId?: string;
  currentDayId?: string;
  isCurrent?: boolean;
}

export const SchedulingBoardService = {
  async getPrograms(zoneId: string, isArchived: boolean = false): Promise<SchedulingProgram[]> {
    try {
      const q = query(
        collection(db, 'schedule_programs'), 
        where('zoneId', '==', zoneId),
        where('isArchived', '==', isArchived)
      );
      const snap = await getDocs(q);
      const programs: SchedulingProgram[] = [];
      snap.forEach(doc => programs.push({ id: doc.id, ...doc.data() } as SchedulingProgram));
      return programs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async createProgram(zoneId: string, name: string): Promise<SchedulingProgram> {
    const id = `board_${Date.now()}`;
    const newProgram: SchedulingProgram = {
      id,
      zoneId,
      name,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      newSongs: [],
      carriedOver: [],
      swapped: [],
      invalidSongs: [],
      nameChanges: [],
      dailySchedules: [],
      submitters: [],
      weeks: [],
      days: []
    };
    await setDoc(doc(db, 'schedule_programs', id), newProgram);
    return newProgram;
  },

  async updateProgram(id: string, updates: Partial<SchedulingProgram>): Promise<void> {
    const cleanUndefined = (o: any): any => {
      if (o === undefined) return null;
      if (o === null) return null;
      if (typeof o !== 'object') return o;
      if (Array.isArray(o)) return o.map(i => i === undefined ? null : cleanUndefined(i));
      const res: any = {};
      for (const k in o) {
        if (o[k] !== undefined) {
          res[k] = cleanUndefined(o[k]);
        }
      }
      return res;
    };

    updates.updatedAt = new Date().toISOString();
    const cleanedUpdates = cleanUndefined(updates);
    
    // updateDoc doesn't like passing undefined directly, and cleanUndefined handles it by omitting or using null
    // But cleanUndefined maps undefined inside arrays to null, which is safe for Firestore
    // For top-level keys that were undefined, cleanUndefined just omits them, which is perfect for updateDoc
    await updateDoc(doc(db, 'schedule_programs', id), cleanedUpdates);
  },

  async deleteProgram(id: string): Promise<void> {
    await deleteDoc(doc(db, 'schedule_programs', id));
  }
};
