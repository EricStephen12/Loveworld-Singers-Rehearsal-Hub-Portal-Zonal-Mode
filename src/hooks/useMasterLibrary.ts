"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MasterLibraryService, MasterSong, MasterProgram } from '@/lib/master-library-service';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { useZone } from '@/hooks/useZone';
import { useAuth } from '@/hooks/useAuth';
import { isHQGroup, isBossZone } from '@/config/zones';

export function useMasterLibrary(isHQAdmin: boolean = false) {
  const { currentZone } = useZone();
  const { user, profile } = useAuth();

  // Determine if current zone is HQ or Boss (Central Admin)
  const isHQ = currentZone ? isHQGroup(currentZone.id) : false;
  const isBoss = currentZone ? isBossZone(currentZone.id) : false;
  const canManage = isHQAdmin || isHQ || isBoss;

  // State
  const [masterSongs, setMasterSongs] = useState<MasterSong[]>([]);
  const [hqInternalSongs, setHqInternalSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<MasterSong | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedForPublish, setSelectedForPublish] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalSongs: 0, totalImports: 0, mostImported: [] as MasterSong[] });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Zone-specific state for importing
  const [zonePraiseNights, setZonePraiseNights] = useState<any[]>([]);
  const [selectedPraiseNight, setSelectedPraiseNight] = useState<string>('');

  // Load more state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMasterSongs, setHasMoreMasterSongs] = useState(true);
  const [hasMoreInternalSongs, setHasMoreInternalSongs] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Search/Filter state
  const [selectedLeadSinger, setSelectedLeadSinger] = useState<string>('');
  const [isLeadSingerDropdownOpen, setIsLeadSingerDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Programs state
  const [programs, setPrograms] = useState<MasterProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [isProgramsDropdownOpen, setIsProgramsDropdownOpen] = useState(false);
  const [showCreateProgramModal, setShowCreateProgramModal] = useState(false);
  const [isAssigningToProgram, setIsAssigningToProgram] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
  const [songsToAssign, setSongsToAssign] = useState<MasterSong[]>([]);
  const [showOrderProgramsModal, setShowOrderProgramsModal] = useState(false);

  // Helper: Normalize name
  const normalizeName = (name: string): string => {
    return name
      .trim()
      .replace(/[.,;:!?]+$/, '')
      .trim();
  };

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [songs, statsData, internal, programList] = await Promise.all([
        MasterLibraryService.getMasterSongs(5000, true),
        MasterLibraryService.getMasterLibraryStats(),
        MasterLibraryService.getHQInternalSongs(1000),
        MasterLibraryService.getMasterPrograms()
      ]);

      setMasterSongs(songs);
      setStats(statsData);
      setHqInternalSongs(internal);
      setPrograms(programList);
      setHasMoreMasterSongs(MasterLibraryService.hasMoreMasterSongs());
      setHasMoreInternalSongs(MasterLibraryService.hasMoreHQInternalSongs());

      if (!canManage && currentZone) {
        const praiseNights = await ZoneDatabaseService.getPraiseNightsByZone(currentZone.id, 50);
        setZonePraiseNights(praiseNights);
      }
    } catch (error) {
      console.error('Error loading master library:', error);
      showToast('error', 'Failed to load Master Library');
    } finally {
      setLoading(false);
    }
  }, [currentZone, canManage, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pagination & Filtering
  const filteredMasterSongs = useMemo(() => {
    let filtered = masterSongs;

    if (selectedProgramId) {
      const selectedProgram = programs.find(p => p.id === selectedProgramId);
      if (selectedProgram) {
        filtered = filtered.filter(song => selectedProgram.songIds?.includes(song.id));
      }
    }

    if (selectedLeadSinger) {
      filtered = filtered.filter(song => {
        const singer = song.leadSinger?.trim();
        if (!singer) return false;
        return normalizeName(singer).toLowerCase() === normalizeName(selectedLeadSinger).toLowerCase();
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(song =>
        song.title?.toLowerCase().includes(term) ||
        song.writer?.toLowerCase().includes(term) ||
        song.leadSinger?.toLowerCase().includes(term) ||
        song.category?.toLowerCase().includes(term) ||
        song.lyrics?.toLowerCase().includes(term) ||
        song.solfa?.toLowerCase().includes(term) ||
        song.key?.toLowerCase().includes(term) ||
        song.tempo?.toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      const titleA = (a.title || '').toLowerCase();
      const titleB = (b.title || '').toLowerCase();
      return sortOrder === 'asc'
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    });
  }, [masterSongs, searchTerm, selectedLeadSinger, selectedProgramId, programs, sortOrder]);

  const paginatedSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMasterSongs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMasterSongs, currentPage]);

  const totalPages = Math.ceil(filteredMasterSongs.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLeadSinger, selectedProgramId]);

  const availableForPublish = useMemo(() => {
    const publishedIds = masterSongs.map(s => s.originalSongId);
    return hqInternalSongs.filter(song => !publishedIds.includes(song.id || song.firebaseId));
  }, [hqInternalSongs, masterSongs]);

  const leadSingers = useMemo(() => {
    const normalizedMap = new Map<string, string>();
    masterSongs.forEach(song => {
      const singer = song.leadSinger?.trim();
      if (!singer) return;
      const normalized = normalizeName(singer).toLowerCase();
      if (!normalizedMap.has(normalized)) {
        normalizedMap.set(normalized, singer);
      }
    });
    return Array.from(normalizedMap.values()).sort((a, b) => a.localeCompare(b));
  }, [masterSongs]);

  // Actions
  const loadMoreMasterSongs = useCallback(async () => {
    if (isLoadingMore || !hasMoreMasterSongs) return;
    setIsLoadingMore(true);
    try {
      const moreSongs = await MasterLibraryService.loadMoreMasterSongs(50);
      if (moreSongs.length > 0) {
        setMasterSongs(prev => [...prev, ...moreSongs]);
      }
      setHasMoreMasterSongs(MasterLibraryService.hasMoreMasterSongs());
    } catch (error) {
      console.error('Error loading more songs:', error);
      showToast('error', 'Failed to load more songs');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreMasterSongs, showToast]);

  const loadMoreInternalSongs = useCallback(async () => {
    if (isLoadingMore || !hasMoreInternalSongs) return;
    setIsLoadingMore(true);
    try {
      const moreSongs = await MasterLibraryService.loadMoreHQInternalSongs(100);
      if (moreSongs.length > 0) {
        setHqInternalSongs(prev => [...prev, ...moreSongs]);
      }
      setHasMoreInternalSongs(MasterLibraryService.hasMoreHQInternalSongs());
    } catch (error) {
      console.error('Error loading more internal songs:', error);
      showToast('error', 'Failed to load more songs');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreInternalSongs, showToast]);

  const handlePublish = async () => {
    if (selectedForPublish.length === 0) {
      showToast('error', 'Please select songs to publish');
      return;
    }
    setPublishing(true);
    let successCount = 0;
    let failCount = 0;

    for (const songId of selectedForPublish) {
      const song = hqInternalSongs.find(s => (s.id || s.firebaseId) === songId);
      if (song) {
        const result = await MasterLibraryService.publishToMasterLibrary(
          song,
          user?.uid || '',
          profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'HQ Admin'
        );
        if (result.success) successCount++;
        else failCount++;
      }
    }

    setPublishing(false);
    setSelectedForPublish([]);
    setShowPublishModal(false);

    if (successCount > 0) {
      const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Admin';
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: `Published ${successCount} song(s) to Master Library`,
          type: 'success',
          userName,
          action: 'created',
          section: 'master_library',
          itemName: `${successCount} song(s)`
        }
      }));
      loadData();
    }
    if (failCount > 0) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: `Failed to publish ${failCount} song(s)`, type: 'error' }
      }));
    }
  };

  const handleDelete = async (songId: string) => {
    const result = await MasterLibraryService.deleteMasterSong(songId);
    if (result.success) {
      const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Admin';
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'Song removed from Master Library',
          type: 'success',
          userName,
          action: 'deleted',
          section: 'master_library',
          itemName: 'Song'
        }
      }));
      loadData();
    } else {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: result.error || 'Failed to remove song', type: 'error' }
      }));
    }
  };

  const handleImport = async () => {
    if (!selectedSong || !selectedPraiseNight || !currentZone) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: 'Please select a praise night to import to', type: 'error' }
      }));
      return;
    }
    setImporting(true);
    try {
      const result = await ZoneDatabaseService.importFromMasterLibrary(
        currentZone.id,
        selectedPraiseNight,
        selectedSong,
        user?.uid || ''
      );
      if (result.success) {
        const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Admin';
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: `"${selectedSong.title}" imported successfully!`,
            type: 'success',
            userName,
            action: 'created',
            section: 'songs',
            itemName: selectedSong.title
          }
        }));
        setShowImportModal(false);
        setSelectedSong(null);
        setSelectedPraiseNight('');
        loadData();
      } else {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { message: result.error || 'Failed to import song', type: 'error' }
        }));
      }
    } catch (error) {
      console.error('Error importing song:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: 'Failed to import song', type: 'error' }
      }));
    } finally {
      setImporting(false);
    }
  };

  const handleCreateProgram = async (name: string, description: string) => {
    if (!name.trim()) return;
    try {
      const result = await MasterLibraryService.createMasterProgram(
        name,
        user?.uid || '',
        profile?.display_name || (profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'Admin'),
        description
      );
      if (result.success) {
        showToast('success', 'Program created successfully');
        loadData();
        setShowCreateProgramModal(false);
      } else {
        showToast('error', result.error || 'Failed to create program');
      }
    } catch (error) {
      console.error('Error creating program:', error);
      showToast('error', 'An unexpected error occurred');
    }
  };

  const handleBulkAddToProgram = async (programId: string) => {
    if (songsToAssign.length === 0) return;
    const songIds = songsToAssign.map(s => s.id);
    try {
      const result = await MasterLibraryService.addSongsToProgram(programId, songIds);
      if (result.success) {
        showToast('success', `Added ${songIds.length} song${songIds.length !== 1 ? 's' : ''} to program`);
        setIsAssigningToProgram(false);
        setSongsToAssign([]);
        setSelectedSongIds(new Set());
        loadData();
      } else {
        showToast('error', 'Failed to add songs to program');
      }
    } catch (error) {
      console.error('Error adding songs to program:', error);
      showToast('error', 'An error occurred');
    }
  };

  const handleToggleSongInProgram = async (songId: string, programId: string) => {
    try {
      const program = programs.find(p => p.id === programId);
      if (!program) return;
      const isInProgram = program.songIds?.includes(songId);
      const result = isInProgram
        ? await MasterLibraryService.removeSongFromProgram(programId, songId)
        : await MasterLibraryService.addSongToProgram(programId, songId);

      if (result.success) {
        showToast('success', isInProgram ? 'Removed from program' : 'Added to program');
        loadData();
      } else {
        showToast('error', result.error || 'Failed to update program');
      }
    } catch (error) {
      console.error('Error toggling song in program:', error);
      showToast('error', 'An unexpected error occurred');
    }
  };

  const handleUpdateProgramOrder = async (updatedPrograms: MasterProgram[]) => {
    try {
      const result = await MasterLibraryService.updateMasterProgramsOrder(updatedPrograms);
      if (result.success) {
        showToast('success', 'Program order updated');
        loadData();
      } else {
        showToast('error', result.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating program order:', error);
      showToast('error', 'An error occurred');
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program? Songs will not be deleted.')) return;
    try {
      const result = await MasterLibraryService.deleteMasterProgram(programId);
      if (result.success) {
        showToast('success', 'Program deleted successfully');
        loadData();
      } else {
        showToast('error', result.error || 'Failed to delete program');
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      showToast('error', 'An error occurred');
    }
  };

  const handleCreateSong = async (songData: any) => {
    setPublishing(true);
    try {
      const result = await MasterLibraryService.createMasterSong(
        songData,
        user?.uid || '',
        profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'HQ Admin'
      );
      if (result.success) {
        showToast('success', 'Song added to Master Library');
        setShowCreateModal(false);
        loadData();
      } else {
        showToast('error', result.error || 'Failed to create song');
      }
    } catch (error) {
      console.error('Error creating song:', error);
      showToast('error', 'An unexpected error occurred');
    } finally {
      setPublishing(false);
    }
  };

  return {
    // State
    masterSongs,
    hqInternalSongs,
    loading,
    searchTerm, setSearchTerm,
    selectedSong, setSelectedSong,
    showPublishModal, setShowPublishModal,
    showDetailsModal, setShowDetailsModal,
    showImportModal, setShowImportModal,
    showEditModal, setShowEditModal,
    showCreateModal, setShowCreateModal,
    publishing,
    importing,
    selectedForPublish, setSelectedForPublish,
    stats,
    toast, showToast,
    zonePraiseNights,
    selectedPraiseNight, setSelectedPraiseNight,
    isLoadingMore,
    hasMoreMasterSongs,
    hasMoreInternalSongs,
    currentPage, setCurrentPage,
    totalPages,
    itemsPerPage,
    selectedLeadSinger, setSelectedLeadSinger,
    isLeadSingerDropdownOpen, setIsLeadSingerDropdownOpen,
    sortOrder, setSortOrder,
    programs,
    selectedProgramId, setSelectedProgramId,
    isProgramsDropdownOpen, setIsProgramsDropdownOpen,
    showCreateProgramModal, setShowCreateProgramModal,
    isAssigningToProgram, setIsAssigningToProgram,
    selectedSongIds, setSelectedSongIds,
    songsToAssign, setSongsToAssign,
    showOrderProgramsModal, setShowOrderProgramsModal,
    availableForPublish,
    leadSingers,
    filteredMasterSongs,
    paginatedSongs,
    canManage,
    currentZone,
    user, profile,

    // Actions
    loadData,
    loadMoreMasterSongs,
    loadMoreInternalSongs,
    handlePublish,
    handleDelete,
    handleImport,
    handleCreateProgram,
    handleBulkAddToProgram,
    handleToggleSongInProgram,
    handleUpdateProgramOrder,
    handleDeleteProgram,
    handleCreateSong
  };
}
