"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useZone } from '@/hooks/useZone';
import {
  ScheduleCategoryService,
  ScheduleSongService,
  ScheduleProgramService,
  ScheduleCategory,
  ScheduleSong,
  ScheduleProgram,
  SpreadsheetData
} from '@/lib/schedule-service';
import { PraiseNightSong } from '@/types/supabase';

export function useScheduleManager(allSongs: PraiseNightSong[] = []) {
  const { currentZone, userRole } = useZone();
  const zoneId = currentZone?.id;
  const canEdit = ['super_admin', 'hq_admin', 'zone_coordinator'].includes(userRole);

  // UI state
  const [viewMode, setViewMode] = useState<'categories' | 'category-detail'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<ScheduleCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [editorLoading, setEditorLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Data state
  const [categories, setCategories] = useState<ScheduleCategory[]>([]);
  const [allPrograms, setAllPrograms] = useState<ScheduleProgram[]>([]);
  const [songs, setSongs] = useState<Record<string, ScheduleSong[]>>({});
  const [program, setProgram] = useState<ScheduleProgram | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData | undefined>(undefined);

  // Form states
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<ScheduleCategory | null>(null);
  const [catForm, setCatForm] = useState({ label: '', description: '', icon: 'Music', color: 'bg-purple-100', iconColor: 'text-purple-600', parentId: null as string | null });
  const [savingCat, setSavingCat] = useState(false);

  const [showSongForm, setShowSongForm] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<ScheduleSong | null>(null);
  const [songForm, setSongForm] = useState({
    title: '', writer: '', leadSinger: '', rehearsalCount: 1,
    dateReceived: new Date().toISOString().split('T')[0], type: 'song' as 'song' | 'activity' | 'title', comment: ''
  });
  const [savingSong, setSavingSong] = useState(false);

  const [programForm, setProgramForm] = useState({ program: '', date: '', time: '', dailyTarget: '' });
  const [savingProgram, setSavingProgram] = useState(false);
  const [editingProgram, setEditingProgram] = useState(false);

  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [newScheduleDate, setNewScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  const [showRenameListModal, setShowRenameListModal] = useState(false);
  const [renameListValue, setRenameListValue] = useState('');

  const [quickAddInput, setQuickAddInput] = useState('');
  const [quickAddResults, setQuickAddResults] = useState<PraiseNightSong[]>([]);
  const [showQuickAddResults, setShowQuickAddResults] = useState(false);

  // Refs for Auto-Saving
  const programFormRef = useRef(programForm);
  const spreadsheetDataRef = useRef(spreadsheetData);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { programFormRef.current = programForm; }, [programForm]);
  useEffect(() => { spreadsheetDataRef.current = spreadsheetData; }, [spreadsheetData]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    if (!zoneId) return;
    setLoading(true);
    try {
      const [cats, progs] = await Promise.all([
        ScheduleCategoryService.getCategories(zoneId),
        ScheduleProgramService.getAllPrograms(zoneId),
      ]);
      setCategories(cats);
      setAllPrograms(progs);
    } catch (error) {
      console.error(error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [zoneId, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadEditorData = useCallback(async (dateId: string, categoryId?: string) => {
    if (!zoneId) return;
    setEditorLoading(true);
    try {
      const prog = await ScheduleProgramService.getProgram(zoneId, dateId, categoryId);
      setProgram(prog);
      if (prog) {
        setProgramForm({ program: prog.program, date: prog.date, time: prog.time, dailyTarget: prog.dailyTarget });
        setSpreadsheetData(prog.spreadsheetData);
      } else {
        setProgramForm({ program: '', date: dateId, time: '', dailyTarget: '' });
        setSpreadsheetData(undefined);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEditorLoading(false);
    }
  }, [zoneId]);

  const loadSongs = useCallback(async (categoryId: string) => {
    if (!zoneId || songs[categoryId]) return;
    const isDaily = categories.find(c => c.id === categoryId)?.label === 'Daily Schedule';
    if (isDaily) return;
    try {
      const list = await ScheduleSongService.getSongs(categoryId, zoneId);
      setSongs(prev => ({ ...prev, [categoryId]: list }));
    } catch (error) {
      console.error(error);
    }
  }, [zoneId, songs, categories]);

  const saveProgram = async (grid?: SpreadsheetData | React.MouseEvent, isAutoSave = false) => {
    // Prevent event objects from being treated as data
    const actualGridInput = (grid && typeof grid === 'object' && 'nativeEvent' in grid) ? undefined : grid as SpreadsheetData;

    if (!zoneId) return;
    if (!isAutoSave) setSavingProgram(true);
    const isDaily = selectedCategory?.label === 'Daily Schedule';
    const currentForm = programFormRef.current;
    
    // Ensure we don't save an event object to spreadsheetData
    const currentGrid = actualGridInput || spreadsheetDataRef.current;
    const catId = isDaily ? undefined : selectedCategory?.id;

    const payload: any = { ...currentForm, zoneId: currentZone?.id, updatedBy: 'admin' };
    if (catId) payload.categoryId = catId;
    if (currentGrid !== undefined && currentGrid !== null && !('nativeEvent' in (currentGrid as any))) {
      payload.spreadsheetData = currentGrid;
    }

    const oldDate = currentDate;
    const newDate = currentForm.date;

    try {
      if (oldDate !== newDate && !isAutoSave) {
        const existing = await ScheduleProgramService.getProgram(currentZone?.id || '', newDate, catId);
        if (existing && !confirm(`A schedule already exists for ${newDate}. Overwrite it?`)) {
          setSavingProgram(false);
          return;
        }
        await ScheduleProgramService.updateProgram(payload, currentZone?.id || '', newDate);
        await ScheduleProgramService.deleteProgram(currentZone?.id || '', oldDate, catId);
        setCurrentDate(newDate);
        if (expandedDate === oldDate) setExpandedDate(newDate);
        if (!isAutoSave) showToast('Program moved to new date!');
      } else {
        await ScheduleProgramService.updateProgram(payload, currentZone?.id || '', oldDate);
        if (!isAutoSave) showToast('Program info saved!');
      }

      const updatedProg = { ...(program || {}), ...payload, updatedAt: new Date().toISOString(), id: program?.id || `temp_${newDate}`, zoneId: currentZone?.id || '' } as ScheduleProgram;
      setProgram(updatedProg);
      setAllPrograms(prev => prev.map(p => (p.date === oldDate && p.categoryId === catId) ? updatedProg : p));
    } catch (error) {
      console.error(error);
      if (!isAutoSave) showToast('Failed to save program', 'error');
    } finally {
      if (!isAutoSave) {
        setSavingProgram(false);
        setEditingProgram(false);
      }
    }
  };

  const deleteProgramHandler = async (dateId: string, categoryId?: string) => {
    if (!zoneId || !confirm('Are you sure you want to delete this schedule/list?')) return;
    setSavingProgram(true);
    try {
      const success = await ScheduleProgramService.deleteProgram(zoneId, dateId, categoryId);
      if (success) {
        setAllPrograms(prev => prev.filter(p => !(p.date === dateId && p.categoryId === categoryId)));
        showToast('Schedule deleted successfully');
        setExpandedDate(null);
        setCurrentDate('');
      } else {
        showToast('Failed to delete schedule', 'error');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSavingProgram(false);
    }
  };

  const saveCat = async (grid?: SpreadsheetData | React.MouseEvent) => {
    // Prevent event objects from being treated as data
    const actualGrid = (grid && typeof grid === 'object' && 'nativeEvent' in grid) ? undefined : grid as SpreadsheetData;
    
    if (!zoneId || !catForm.label.trim()) return showToast('Label is required', 'error');
    setSavingCat(true);
    const payload: any = { ...catForm, parentId: catForm.parentId || null };
    
    // Ensure we don't save an event object to spreadsheetData
    const gridData = actualGrid || (editingCat?.spreadsheetData || selectedCategory?.spreadsheetData);
    if (gridData !== undefined && gridData !== null && !('nativeEvent' in (gridData as any))) {
      payload.spreadsheetData = gridData;
    }

    try {
      if (editingCat) {
        await ScheduleCategoryService.updateCategory(editingCat.id, payload);
        setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...payload } : c));
        if (selectedCategory?.id === editingCat.id) setSelectedCategory(prev => prev ? ({ ...prev, ...payload }) : null);
        showToast('Category updated!');
      } else {
        const newId = await ScheduleCategoryService.addCategory({ ...payload, zoneId, order: categories.length, isActive: true, createdBy: 'admin' }, zoneId);
        if (newId) {
          const newCat = { id: newId, zoneId, ...payload, order: categories.length, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'admin' } as ScheduleCategory;
          setCategories(prev => [...prev, newCat]);
          showToast('Category added!');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save category', 'error');
    } finally {
      setSavingCat(false);
      setShowCatForm(false);
      setEditingCat(null);
    }
  };

  const deleteCat = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const oldCats = [...categories];
    setCategories(prev => prev.filter(c => c.id !== id));
    const success = await ScheduleCategoryService.deleteCategory(id);
    if (success) showToast('Category removed');
    else { setCategories(oldCats); showToast('Failed to remove category', 'error'); }
  };

  const saveSong = async (categoryId: string) => {
    if (!currentZone?.id || !songForm.title.trim()) return showToast('Title is required', 'error');
    setSavingSong(true);
    try {
      if (editingSong) {
        await ScheduleSongService.updateSong(editingSong.id, { ...songForm, dateReceived: new Date(songForm.dateReceived).toISOString() });
        setSongs(prev => ({ ...prev, [categoryId]: prev[categoryId].map(s => s.id === editingSong.id ? { ...s, ...songForm, dateReceived: new Date(songForm.dateReceived).toISOString() } : s) }));
        showToast('Item updated!');
      } else {
        const newId = await ScheduleSongService.addSong({ ...songForm, categoryId, zoneId: currentZone.id, order: (songs[categoryId]?.length || 0), dateReceived: new Date(songForm.dateReceived).toISOString(), createdBy: 'admin' }, currentZone.id);
        if (newId) {
          const newSong = { id: newId, categoryId, zoneId: currentZone.id, ...songForm, order: (songs[categoryId]?.length || 0), dateReceived: new Date(songForm.dateReceived).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'admin' } as ScheduleSong;
          setSongs(prev => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), newSong] }));
          showToast('Item added!');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save item', 'error');
    } finally {
      setSavingSong(false);
      setShowSongForm(null);
    }
  };

  const deleteSong = async (song: ScheduleSong) => {
    if (!confirm(`Delete "${song.title}"?`)) return;
    const oldSongs = { ...songs };
    setSongs(prev => ({ ...prev, [song.categoryId]: prev[song.categoryId].filter(s => s.id !== song.id) }));
    const success = await ScheduleSongService.deleteSong(song.id);
    if (success) showToast('Item deleted');
    else { setSongs(oldSongs); showToast('Failed to delete item', 'error'); }
  };

  const confirmCreateSchedule = async () => {
    if (!zoneId || !newScheduleDate || !selectedCategory) return;
    setShowNewScheduleModal(false);

    const isDaily = selectedCategory.label === 'Daily Schedule';
    const catId = isDaily ? undefined : selectedCategory.id;

    // For non-daily lists, use the input as the title (program name)
    // and use a timestamp-based ID for the unique 'date' field
    const programName = isDaily ? '' : newScheduleDate;
    const dateId = isDaily ? newScheduleDate : `list_${Date.now()}`;

    const newProgramPayload: any = { 
      zoneId, 
      program: programName, 
      date: dateId, 
      time: '', 
      dailyTarget: '', 
      updatedBy: 'admin' 
    };
    
    if (catId) newProgramPayload.categoryId = catId;

    setAllPrograms(prev => {
      if (prev.find(p => p.date === dateId && p.categoryId === catId)) return prev;
      return [{ ...newProgramPayload, id: `temp_${dateId}_${Date.now()}`, updatedAt: new Date().toISOString() } as ScheduleProgram, ...prev].sort((a, b) => {
        if (isDaily) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return b.updatedAt.localeCompare(a.updatedAt);
      });
    });

    await ScheduleProgramService.updateProgram(newProgramPayload, currentZone.id, dateId);
    setExpandedDate(dateId);
    setCurrentDate(dateId);
    loadEditorData(dateId, catId);
  };

  const handleRenameList = async () => {
    if (!renameListValue.trim() || renameListValue === program?.date) { setShowRenameListModal(false); return; }
    const updatedForm = { ...programForm, date: renameListValue };
    setProgramForm(updatedForm);
    programFormRef.current = updatedForm;
    await saveProgram(undefined, false);
    setShowRenameListModal(false);
  };

  const isDailyView = useMemo(() => {
    // If it has no category, it's a global/daily schedule
    if (selectedCategory?.id === 'daily-schedule' || (program && !program.categoryId)) return true;
    
    const dailyCategory = categories.find(c => c.label === 'Daily Schedule' || c.id === 'daily-schedule');
    if (!selectedCategory) return !program?.categoryId; // Default to true if no category and no program, or if global program
    if (dailyCategory && selectedCategory.id === dailyCategory.id) return true;
    
    let current: ScheduleCategory | undefined = selectedCategory;
    while (current) {
      if (current.id === dailyCategory?.id || current.label === 'Daily Schedule') return true;
      if (!current.parentId) break;
      current = categories.find(c => c.id === current!.parentId);
    }
    return false;
  }, [selectedCategory, categories, program]);

  return {
    // UI State
    viewMode, setViewMode,
    selectedCategory, setSelectedCategory,
    loading,
    editorLoading,
    toast, showToast,
    expandedDate, setExpandedDate,
    currentDate, setCurrentDate,
    canEdit,
    currentZone,

    // Data State
    categories,
    allPrograms,
    songs,
    program,
    spreadsheetData, setSpreadsheetData,

    // Form State
    showCatForm, setShowCatForm,
    editingCat, setEditingCat,
    catForm, setCatForm,
    savingCat,
    showSongForm, setShowSongForm,
    editingSong, setEditingSong,
    songForm, setSongForm,
    savingSong,
    programForm, setProgramForm,
    savingProgram,
    editingProgram, setEditingProgram,
    showNewScheduleModal, setShowNewScheduleModal,
    newScheduleDate, setNewScheduleDate,
    showRenameListModal, setShowRenameListModal,
    renameListValue, setRenameListValue,
    quickAddInput, setQuickAddInput,
    quickAddResults, setQuickAddResults,
    showQuickAddResults, setShowQuickAddResults,

    // Actions
    loadData,
    loadEditorData,
    loadSongs,
    saveProgram,
    deleteProgramHandler,
    saveCat,
    deleteCat,
    saveSong,
    deleteSong,
    confirmCreateSchedule,
    handleRenameList,
    isDailyView
  };
}
