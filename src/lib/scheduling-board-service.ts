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
    updates.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, 'schedule_programs', id), updates as any);
  },

  async deleteProgram(id: string): Promise<void> {
    await deleteDoc(doc(db, 'schedule_programs', id));
  }
};
