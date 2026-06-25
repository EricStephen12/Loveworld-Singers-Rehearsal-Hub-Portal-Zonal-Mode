"use client";

import { useState, useEffect, useCallback } from 'react';
import { useZone } from '@/hooks/useZone';
import { SchedulingBoardService, SchedulingProgram } from '@/lib/scheduling-board-service';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';

export function useSchedulingBoard() {
  const { currentZone, userRole } = useZone();
  const zoneId = currentZone?.id;
  const canEdit = ['super_admin', 'hq_admin', 'zone_coordinator', 'boss', 'zone_admin', 'admin'].includes(userRole);

  const [loading, setLoading] = useState(true);
  const [viewHistory, setViewHistory] = useState(false);
  const [programs, setPrograms] = useState<SchedulingProgram[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  useEffect(() => {
    if (!zoneId) return;
    setLoading(true);

    const q = query(
      collection(db, 'schedule_programs'),
      where('zoneId', '==', zoneId),
      where('isArchived', '==', viewHistory)
    );

    const unsubscribe = onSnapshot(q, (snap: any) => {
      const fetched: SchedulingProgram[] = [];
      snap.forEach((doc: any) => {
        fetched.push({ id: doc.id, ...doc.data() } as SchedulingProgram);
      });
      fetched.sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      
      setPrograms(fetched);
      if (fetched.length > 0) {
        // Only set active if we don't have one, or the current one is no longer in the list
        setActiveProgramId(prev => {
          if (!prev || !fetched.find(p => p.id === prev)) {
            const currentProg = fetched.find(p => p.isCurrent);
            if (currentProg) return currentProg.id;
            return fetched[fetched.length - 1].id;
          }
          return prev;
        });
      } else {
        setActiveProgramId(null);
      }
      setLoading(false);
    }, (err: any) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [zoneId, viewHistory]);

  const activeProgram = programs.find(p => p.id === activeProgramId) || null;

  const createProgram = async (name: string) => {
    if (!zoneId) return;
    const newProg = await SchedulingBoardService.createProgram(zoneId, name);
    setPrograms([newProg, ...programs]);
    setActiveProgramId(newProg.id);
  };

  const updateProgramData = async (updates: Partial<SchedulingProgram>) => {
    if (!activeProgramId) return;
    await SchedulingBoardService.updateProgram(activeProgramId, updates);
  };

  const toggleArchive = async () => {
    if (!activeProgramId) return;
    const isNowArchived = !activeProgram?.isArchived;
    await SchedulingBoardService.updateProgram(activeProgramId, { isArchived: isNowArchived });
  };

  const deleteActiveProgram = async () => {
    if (!activeProgramId) return;
    await SchedulingBoardService.deleteProgram(activeProgramId);
  };

  const renameActiveProgram = async (newName: string) => {
    if (!activeProgramId) return;
    await SchedulingBoardService.updateProgram(activeProgramId, { name: newName });
  };

  const setCurrentProgram = async (programId: string) => {
    await Promise.all(
      programs.map(p => 
        SchedulingBoardService.updateProgram(p.id, { isCurrent: p.id === programId })
      )
    );
  };

  return {
    loading,
    canEdit,
    viewHistory,
    setViewHistory,
    programs,
    activeProgramId,
    setActiveProgramId,
    activeProgram,
    createProgram,
    updateProgramData,
    toggleArchive,
    deleteActiveProgram,
    renameActiveProgram,
    setCurrentProgram,
    currentZone
  };
}
