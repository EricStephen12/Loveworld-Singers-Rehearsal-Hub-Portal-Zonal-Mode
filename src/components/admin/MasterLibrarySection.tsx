"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Library,
  Search,
  Upload,
  Music,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  ChevronDown,
  X,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  CheckSquare,
  Square,
  Minus
} from 'lucide-react';
import { MasterLibraryService, MasterSong, MasterProgram } from '@/lib/master-library-service';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { useZone } from '@/hooks/useZone';
import { useAuth } from '@/hooks/useAuth';
import { isHQGroup, isBossZone } from '@/config/zones';
import { MasterSongDetailSheet } from './MasterSongDetailSheet';
import { MasterEditSongModal } from './MasterEditSongModal';
import MasterProgramOrderModal from './MasterProgramOrderModal';
import CustomLoader from '@/components/CustomLoader';

interface MasterLibrarySectionProps {
  isHQAdmin?: boolean;
}

export default function MasterLibrarySection({ isHQAdmin = false }: MasterLibrarySectionProps) {
  const { currentZone } = useZone();
  const { user, profile } = useAuth();

  // Determine if current zone is HQ or Boss (Central Admin)
  const isHQ = currentZone ? isHQGroup(currentZone.id) : false;
  const isBoss = currentZone ? isBossZone(currentZone.id) : false;
  const canManage = isHQAdmin || isHQ || isBoss; // HQ Admin or Boss can publish/edit/delete

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
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set())
  const [songsToAssign, setSongsToAssign] = useState<MasterSong[]>([])
  const [showOrderProgramsModal, setShowOrderProgramsModal] = useState(false);

  // Normalize name: remove trailing punctuation and trim
  const normalizeName = (name: string): string => {
    return name
      .trim()
      .replace(/[.,;:!?]+$/, '') // Remove trailing punctuation
      .trim()
  };

  // Get unique lead singers with normalization
  const leadSingers = useMemo(() => {
    const normalizedMap = new Map<string, string>()

    masterSongs.forEach(song => {
      const singer = song.leadSinger?.trim()
      if (!singer) return

      const normalized = normalizeName(singer).toLowerCase()
      if (!normalizedMap.has(normalized)) {
        normalizedMap.set(normalized, singer)
      }
    })

    return Array.from(normalizedMap.values()).sort((a, b) => a.localeCompare(b))
  }, [masterSongs]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load master songs and stats with smaller initial limits for performance
      const [songs, statsData, internal, programList] = await Promise.all([
        MasterLibraryService.getMasterSongs(5000, true), // Match All Ministered Songs limit and force refresh
        MasterLibraryService.getMasterLibraryStats(),
        MasterLibraryService.getHQInternalSongs(1000), // Increase internal limit too
        MasterLibraryService.getMasterPrograms()
      ]);

      setMasterSongs(songs);
      setStats(statsData);
      setHqInternalSongs(internal);
      setPrograms(programList);
      setHasMoreMasterSongs(MasterLibraryService.hasMoreMasterSongs());
      setHasMoreInternalSongs(MasterLibraryService.hasMoreHQInternalSongs());


      // Load zone praise nights for Zone Coordinators (for import destination)
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
  }, [currentZone, isHQAdmin, canManage]);

  // Load data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load more master songs
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
  }, [isLoadingMore, hasMoreMasterSongs]);

  // Load more internal songs (for publish modal)
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
  }, [isLoadingMore, hasMoreInternalSongs]);

  // Filter songs based on search, singer, program and sort
  const filteredMasterSongs = useMemo(() => {
    let filtered = masterSongs;

    // Filter by program
    if (selectedProgramId) {
      const selectedProgram = programs.find(p => p.id === selectedProgramId);
      if (selectedProgram) {
        filtered = filtered.filter(song => selectedProgram.songIds?.includes(song.id));
      }
    }

    // Filter by lead singer
    if (selectedLeadSinger) {
      filtered = filtered.filter(song => {
        const singer = song.leadSinger?.trim()
        if (!singer) return false
        return normalizeName(singer).toLowerCase() === normalizeName(selectedLeadSinger).toLowerCase()
      })
    }

    // Filter by search query
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

    // Sort alphabetically by title
    return [...filtered].sort((a, b) => {
      const titleA = (a.title || '').toLowerCase()
      const titleB = (b.title || '').toLowerCase()
      return sortOrder === 'asc'
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA)
    });
  }, [masterSongs, searchTerm, selectedLeadSinger, selectedProgramId, programs, sortOrder]);

  // Paginated songs for display
  const paginatedSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMasterSongs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMasterSongs, currentPage]);

  const totalPages = Math.ceil(filteredMasterSongs.length / itemsPerPage);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLeadSinger, selectedProgramId]);

  // Filter internal songs (exclude already published)
  const availableForPublish = useMemo(() => {
    const publishedIds = masterSongs.map(s => s.originalSongId);
    const available = hqInternalSongs.filter(song => !publishedIds.includes(song.id || song.firebaseId));
    return available;
  }, [hqInternalSongs, masterSongs]);

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
        loadData(); // Refresh programs list
        setShowCreateProgramModal(false);
      } else {
        showToast('error', result.error || 'Failed to create program');
      }
    } catch (error) {
      console.error('Error creating program:', error);
      showToast('error', 'An unexpected error occurred');
    }
  };

  // Multi-select Logic
  const handleToggleSongSelection = (songId: string) => {
    const newSelected = new Set(selectedSongIds)
    if (newSelected.has(songId)) {
      newSelected.delete(songId)
    } else {
      newSelected.add(songId)
    }
    setSelectedSongIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedSongIds.size === filteredMasterSongs.length && filteredMasterSongs.length > 0) {
      setSelectedSongIds(new Set())
    } else {
      setSelectedSongIds(new Set(filteredMasterSongs.map(s => s.id)))
    }
  }

  const handleBulkAssignToProgram = () => {
    const songs = filteredMasterSongs.filter(s => selectedSongIds.has(s.id))
    setSongsToAssign(songs)
    setIsAssigningToProgram(true)
  }

  const handleAssignSingleToProgram = (song: MasterSong) => {
    setSongsToAssign([song])
    setIsAssigningToProgram(true)
  }

  const handleBulkAddToProgram = async (programId: string) => {
    if (songsToAssign.length === 0) return

    const songIds = songsToAssign.map(s => s.id)
    try {
      const result = await MasterLibraryService.addSongsToProgram(programId, songIds)
      if (result.success) {
        showToast('success', `Added ${songIds.length} song${songIds.length !== 1 ? 's' : ''} to program`)
        setIsAssigningToProgram(false)
        setSongsToAssign([])
        setSelectedSongIds(new Set()) // Clear selection after action
        loadData() // Refresh programs to show updated counts/songs
      } else {
        showToast('error', 'Failed to add songs to program')
      }
    } catch (error) {
      console.error('Error adding songs to program:', error)
      showToast('error', 'An error occurred')
    }
  }

  const handleToggleSongInProgram = async (songId: string, programId: string) => {
    try {
      const program = programs.find(p => p.id === programId);
      if (!program) return;

      const isInProgram = program.songIds?.includes(songId);
      let result;

      if (isInProgram) {
        result = await MasterLibraryService.removeSongFromProgram(programId, songId);
      } else {
        result = await MasterLibraryService.addSongToProgram(programId, songId);
      }

      if (result.success) {
        showToast('success', isInProgram ? 'Removed from program' : 'Added to program');
        loadData(); // Refresh to get updated songIds
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

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Publish songs to Master Library
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
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }
    }

    setPublishing(false);
    setSelectedForPublish([]);
    setShowPublishModal(false);

    if (successCount > 0) {
      // Get real user info
      const userName = localStorage.getItem('userName') ||
        localStorage.getItem('userEmail') ||
        'Admin';

      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: `Published ${successCount} song(s) to Master Library`,
          type: 'success',
          userName: userName,
          action: 'created',
          section: 'master_library',
          itemName: `${successCount} song(s)`
        }
      }));
      loadData(); // Refresh
    }
    if (failCount > 0) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: `Failed to publish ${failCount} song(s)`,
          type: 'error'
        }
      }));
    }
  };

  // State for delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Delete from Master Library
  const handleDelete = async (songId: string) => {
    const result = await MasterLibraryService.deleteMasterSong(songId);
    if (result.success) {
      const userName = localStorage.getItem('userName') ||
        localStorage.getItem('userEmail') ||
        'Admin';

      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'Song removed from Master Library',
          type: 'success',
          userName: userName,
          action: 'deleted',
          section: 'master_library',
          itemName: 'Song'
        }
      }));
      setDeleteConfirmId(null);
      loadData();
    } else {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: result.error || 'Failed to remove song',
          type: 'error'
        }
      }));
    }
  };

  // Import song to Zone (Zone Coordinators only)
  const handleImport = async () => {
    if (!selectedSong || !selectedPraiseNight || !currentZone) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'Please select a praise night to import to',
          type: 'error'
        }
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
        // Get real user info
        const userName = localStorage.getItem('userName') ||
          localStorage.getItem('userEmail') ||
          'Admin';

        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: `"${selectedSong.title}" imported successfully!`,
            type: 'success',
            userName: userName,
            action: 'created',
            section: 'songs',
            itemName: selectedSong.title
          }
        }));
        setShowImportModal(false);
        setSelectedSong(null);
        setSelectedPraiseNight('');
        loadData(); // Refresh to update import counts
      } else {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: result.error || 'Failed to import song',
            type: 'error'
          }
        }));
      }
    } catch (error) {
      console.error('Error importing song:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'Failed to import song',
          type: 'error'
        }
      }));
    } finally {
      setImporting(false);
    }
  };

  // Open import modal for a song
  const openImportModal = (song: MasterSong) => {
    setSelectedSong(song);
    setSelectedPraiseNight('');
    setShowImportModal(true);
  };

  // Toggle song selection for publish
  const toggleSongSelection = (songId: string) => {
    setSelectedForPublish(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <CustomLoader message="Loading Master Library..." />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-gradient-to-br lg:from-slate-50 lg:via-white lg:to-purple-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Mobile Stats Header */}
      <div className="lg:hidden bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Library className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs">Master Library</p>
              <p className="text-white font-bold text-lg">{stats.totalSongs} songs</p>
            </div>
          </div>
          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                }}
                className="p-2.5 bg-white/20 text-white rounded-xl transition-colors active:scale-95"
                title="Create New Song"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowPublishModal(true)}
                className="p-2.5 bg-white/20 text-white rounded-xl transition-colors active:scale-95"
                title="Import from Internal"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Header - Desktop Only */}
        <div className="hidden lg:block mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Library className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Master Library</h1>
                <p className="text-slate-500 text-sm">
                  {canManage
                    ? 'Publish songs for zones to access'
                    : 'Browse and import songs to your zone'}
                </p>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import from Internal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards - Horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 mb-4 lg:mb-6 scrollbar-hide">
          <div className="flex-shrink-0 w-[140px] lg:w-auto bg-white rounded-2xl lg:rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 lg:p-2 bg-purple-100 rounded-xl lg:rounded-lg">
                <Music className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSongs}</p>
                <p className="text-xs lg:text-sm text-slate-500 whitespace-nowrap">Songs</p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-[140px] lg:w-auto bg-white rounded-2xl lg:rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 lg:p-2 bg-green-100 rounded-xl lg:rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalImports}</p>
                <p className="text-xs lg:text-sm text-slate-500 whitespace-nowrap">Imports</p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-[140px] lg:w-auto bg-white rounded-2xl lg:rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 lg:p-2 bg-blue-100 rounded-xl lg:rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.mostImported[0]?.importCount || 0}
                </p>
                <p className="text-xs lg:text-sm text-slate-500 whitespace-nowrap">Top Imports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search songs by title, writer, or lead singer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Sort Toggle - Moved before Lead Singer */}
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-3 lg:px-4 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:border-purple-300 transition-all shadow-sm"
                title={sortOrder === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
              >
                <Filter className="w-4 h-4 text-purple-500" />
                <span className="hidden sm:inline">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
              </button>

              {/* Lead Singer Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsLeadSingerDropdownOpen(!isLeadSingerDropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-sm border ${selectedLeadSinger
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{selectedLeadSinger || 'Lead Singer'}</span>
                  <span className="sm:hidden">{selectedLeadSinger ? selectedLeadSinger.split(' ')[0] : 'Singer'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isLeadSingerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLeadSingerDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsLeadSingerDropdownOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-20 min-w-[220px] max-h-[300px] overflow-y-auto">
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Filter by Lead Singer</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLeadSinger('')
                          setIsLeadSingerDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!selectedLeadSinger
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        All Lead Singers
                      </button>
                      {leadSingers.map(singer => (
                        <button
                          key={singer}
                          onClick={() => {
                            setSelectedLeadSinger(singer)
                            setIsLeadSingerDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedLeadSinger === singer
                            ? 'bg-purple-50 text-purple-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          {singer}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Programs Filter - Replaces previous A-Z position */}
              <div className="relative">
                <button
                  onClick={() => setIsProgramsDropdownOpen(!isProgramsDropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-sm border ${selectedProgramId
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                    }`}
                >
                  <Music className="w-4 h-4" />
                  <span>{selectedProgramId ? programs.find(p => p.id === selectedProgramId)?.name : 'Programs'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProgramsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProgramsDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProgramsDropdownOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-20 min-w-[220px] max-h-[300px] overflow-y-auto">
                      <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Filter by Program</p>
                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setShowOrderProgramsModal(true);
                                setIsProgramsDropdownOpen(false);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-amber-600"
                              title="Reorder Programs"
                            >
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setShowCreateProgramModal(true);
                                setIsProgramsDropdownOpen(false);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-purple-600"
                              title="Create Program"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProgramId('')
                          setIsProgramsDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!selectedProgramId
                          ? 'bg-violet-50 text-violet-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        All Songs
                      </button>
                      {programs.map(program => (
                        <div key={program.id} className="relative group">
                          <button
                            onClick={() => {
                              setSelectedProgramId(program.id)
                              setIsProgramsDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedProgramId === program.id
                              ? 'bg-violet-50 text-violet-700 font-medium'
                              : 'text-slate-700 hover:bg-slate-50'
                              }`}
                          >
                            {program.name}
                            <span className="ml-2 text-[10px] text-slate-400">({program.songIds?.length || 0})</span>
                          </button>
                          {canManage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this program?')) {
                                  // Call delete handler directly here or create a wrapper
                                  MasterLibraryService.deleteMasterProgram(program.id).then(res => {
                                    if (res.success) {
                                      showToast('success', 'Program deleted');
                                      if (selectedProgramId === program.id) setSelectedProgramId('');
                                      loadData();
                                    } else {
                                      showToast('error', 'Failed to delete program');
                                    }
                                  });
                                }
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Program"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              {filteredMasterSongs.length} Song{filteredMasterSongs.length !== 1 ? 's' : ''} Available
            </h2>
            {canManage && (
              <button
                onClick={handleSelectAll}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {selectedSongIds.size === filteredMasterSongs.length && filteredMasterSongs.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            )}
          </div>

          {filteredMasterSongs.length === 0 ? (
            <div className="p-8 text-center">
              <Music className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {searchTerm ? 'No songs match your search' : 'No songs in Master Library yet'}
              </p>
              {canManage && !searchTerm && (
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Publish your first song →
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedSongs.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={sortOrder === 'asc'
                    ? (currentPage - 1) * itemsPerPage + index + 1
                    : filteredMasterSongs.length - ((currentPage - 1) * itemsPerPage + index)
                  }
                  canManage={canManage}
                  canImport={!canManage && zonePraiseNights.length > 0}
                  onView={() => {
                    setSelectedSong(song);
                    setShowDetailsModal(true);
                  }}
                  onEdit={canManage ? () => {
                    setSelectedSong(song);
                    setShowEditModal(true);
                  } : undefined}
                  onDelete={() => setDeleteConfirmId(song.id)}
                  onImport={() => openImportModal(song)}
                  onAssignToProgram={() => handleAssignSingleToProgram(song)}
                  onRemoveFromProgram={selectedProgramId ? () => handleToggleSongInProgram(song.id, selectedProgramId) : undefined}
                  isInProgram={selectedProgramId ? programs.find(p => p.id === selectedProgramId)?.songIds?.includes(song.id) : false}
                  isSelected={selectedSongIds.has(song.id)}
                  onToggleSelection={() => handleToggleSongSelection(song.id)}
                />
              ))}

              {/* Bulk Action Bar */}
              {selectedSongIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
                  <span className="font-medium text-sm whitespace-nowrap">{selectedSongIds.size} selected</span>
                  <div className="h-4 w-px bg-slate-700" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkAssignToProgram}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Program
                    </button>
                    <button
                      onClick={() => setSelectedSongIds(new Set())}
                      className="px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {filteredMasterSongs.length > itemsPerPage && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredMasterSongs.length)}</span> of <span className="font-medium text-slate-900">{filteredMasterSongs.length}</span> songs
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Only show first, last, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                ? 'bg-purple-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {hasMoreMasterSongs && (
                    <button
                      onClick={loadMoreMasterSongs}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <CustomLoader size="sm" />
                      ) : 'Fetch More from Server'}
                    </button>
                  )}
                </div>
              )}

              {/* Original Load More button removed and replaced with pagination + Fetch More */}
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && canManage && (
        <PublishModal
          songs={availableForPublish}
          selectedIds={selectedForPublish}
          onToggle={toggleSongSelection}
          onPublish={handlePublish}
          onClose={() => {
            setShowPublishModal(false);
            setSelectedForPublish([]);
          }}
          publishing={publishing}
          hasMore={hasMoreInternalSongs}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMoreInternalSongs}
        />
      )}

      {/* Song Details Sheet */}
      {selectedSong && (
        <MasterSongDetailSheet
          song={selectedSong}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSong(null);
          }}
        />
      )}

      {/* Edit Song Modal */}
      {selectedSong && showEditModal && (
        <MasterEditSongModal
          song={selectedSong}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSong(null);
          }}
          onSongUpdated={(updatedSong) => {
            setMasterSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
            setShowEditModal(false);
            setSelectedSong(null);
          }}
          mode="edit"
        />
      )}

      {/* Create New Song Modal */}
      {showCreateModal && canManage && (
        <>
          <MasterEditSongModal
            song={null}
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSongUpdated={() => { }}
            onSongCreated={(newSong) => {
              setMasterSongs(prev => [newSong, ...prev]);
              setStats(prev => ({ ...prev, totalSongs: prev.totalSongs + 1 }));
              setShowCreateModal(false);

              const userName = localStorage.getItem('userName') ||
                localStorage.getItem('userEmail') ||
                'Admin';

              window.dispatchEvent(new CustomEvent('showToast', {
                detail: {
                  message: `"${newSong.title}" created successfully!`,
                  type: 'success',
                  userName: userName,
                  action: 'created',
                  section: 'master_library',
                  itemName: newSong.title
                }
              }));
            }}
            mode="create"
          />
        </>
      )}

      {/* Import to Zone Modal (Zone Coordinators only) */}
      {showImportModal && selectedSong && !canManage && (
        <ImportModal
          song={selectedSong}
          praiseNights={zonePraiseNights}
          selectedPraiseNight={selectedPraiseNight}
          onSelectPraiseNight={setSelectedPraiseNight}
          onImport={handleImport}
          onClose={() => {
            setShowImportModal(false);
            setSelectedSong(null);
            setSelectedPraiseNight('');
          }}
          importing={importing}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Song</h3>
                <p className="text-sm text-gray-500">This cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove this song from the Master Library?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create Program Modal */}
      {showCreateProgramModal && canManage && (
        <CreateProgramModal
          onSave={handleCreateProgram}
          onClose={() => setShowCreateProgramModal(false)}
        />
      )}

      {/* Assign Song to Program Modal */}
      {isAssigningToProgram && songsToAssign.length > 0 && canManage && (
        <AssignToProgramModal
          songs={songsToAssign}
          programs={programs}
          onAssign={handleBulkAddToProgram}
          onClose={() => {
            setIsAssigningToProgram(false)
            setSongsToAssign([])
          }}
        />
      )}

      {/* Program Order Modal */}
      {showOrderProgramsModal && (
        <MasterProgramOrderModal
          isOpen={showOrderProgramsModal}
          onClose={() => setShowOrderProgramsModal(false)}
          programs={programs}
          onUpdate={handleUpdateProgramOrder}
        />
      )}
    </div>
  );
}


// Song Row Component - Compact Design
function SongRow({
  song,
  index,
  canManage,
  canImport,
  onView,
  onEdit,
  onDelete,
  onImport,
  onAssignToProgram,
  onRemoveFromProgram,
  isInProgram,
  isSelected,
  onToggleSelection
}: {
  song: MasterSong;
  index: number;
  canManage: boolean;
  canImport?: boolean;
  onView: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onImport?: () => void;
  onAssignToProgram?: () => void;
  onRemoveFromProgram?: () => void;
  isInProgram?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-purple-50 hover:bg-purple-50' : ''}`}
      onClick={onView}
    >
      {/* Checkbox or Count */}
      <div
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection && onToggleSelection();
        }}
      >
        {isSelected ? (
          <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
            <CheckSquare className="w-3.5 h-3.5 text-white" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 group">
            <span className="text-white font-bold text-xs group-hover:hidden">{index}</span>
            <div className="hidden group-hover:block w-4 h-4 border-2 border-white/50 rounded hover:border-white"></div>
          </div>
        )}
      </div>

      {/* Info - Compact */}
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm text-slate-900 truncate">{song.title}</h3>
        <p className="text-xs text-slate-500 truncate">
          {song.writer || 'Unknown writer'}
          {song.key && ` • ${song.key}`}
        </p>
      </div>

      {/* Import count - always visible */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-medium shrink-0">
        <Download className="w-3 h-3" />
        {song.importCount || 0}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {canImport && onImport && (
          <button
            onClick={(e) => { e.stopPropagation(); onImport(); }}
            className="px-2.5 py-1 bg-violet-600 text-white text-[11px] font-medium rounded-lg hover:bg-violet-700 active:scale-95 transition-all"
          >
            Import
          </button>
        )}
        {canManage && onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="px-2.5 py-1 bg-purple-100 text-purple-600 text-[11px] font-medium rounded-lg hover:bg-purple-200 active:scale-95 transition-all"
          >
            Edit
          </button>
        )}
        {canManage && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        {canManage && onAssignToProgram && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isInProgram && onRemoveFromProgram) {
                onRemoveFromProgram();
              } else {
                onAssignToProgram();
              }
            }}
            className={`p-1.5 rounded-lg transition-colors ${isInProgram
              ? 'text-red-600 bg-red-50 hover:bg-red-100'
              : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'
              }`}
            title={isInProgram ? "Remove from program" : "Add to program"}
          >
            {isInProgram ? (
              <Minus className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Publish Modal Component
function PublishModal({
  songs,
  selectedIds,
  onToggle,
  onPublish,
  onClose,
  publishing,
  hasMore,
  isLoadingMore,
  onLoadMore
}: {
  songs: any[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onPublish: () => void;
  onClose: () => void;
  publishing: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSongs = useMemo(() => {
    if (!searchTerm) return songs;
    const term = searchTerm.toLowerCase();
    return songs.filter(song =>
      song.title?.toLowerCase().includes(term) ||
      song.writer?.toLowerCase().includes(term)
    );
  }, [songs, searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Publish to Master Library</h2>
              <p className="text-sm text-slate-500 mt-1">
                Select songs from your internal library to make available to zones
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-auto p-4">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">
                {searchTerm ? 'No songs match your search' : 'All songs have been published'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSongs.map((song) => {
                const songId = song.id || song.firebaseId;
                const isSelected = selectedIds.includes(songId);

                return (
                  <div
                    key={songId}
                    onClick={() => onToggle(songId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-300'
                        }`}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{song.title}</p>
                        <p className="text-sm text-slate-500 truncate">
                          {song.writer || 'Unknown writer'} • {song.category || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {hasMore && !searchTerm && onLoadMore && (
                <div className="pt-4 text-center">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {isLoadingMore ? (
                      <>
                        <CustomLoader size="sm" />
                        <span className="ml-2">Loading...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Load More Songs
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {selectedIds.length} song{selectedIds.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onPublish}
                disabled={selectedIds.length === 0 || publishing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {publishing ? (
                  <>
                    <CustomLoader size="sm" />
                    <span className="ml-2">Publishing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Publish Selected
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// Import to Zone Modal (Zone Coordinators)
function ImportModal({
  song,
  praiseNights,
  selectedPraiseNight,
  onSelectPraiseNight,
  onImport,
  onClose,
  importing
}: {
  song: MasterSong;
  praiseNights: any[];
  selectedPraiseNight: string;
  onSelectPraiseNight: (id: string) => void;
  onImport: () => void;
  onClose: () => void;
  importing: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Import to Zone</h2>
              <p className="text-sm text-slate-500 mt-1">
                Select a praise night to add this song to
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Song Info */}
        <div className="p-4 bg-purple-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Music className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{song.title}</p>
              <p className="text-sm text-slate-500">{song.writer || 'Unknown writer'}</p>
            </div>
          </div>
        </div>

        {/* Praise Night Selection */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Praise Night
          </label>

          {praiseNights.length === 0 ? (
            <div className="text-center py-4">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No praise nights available</p>
              <p className="text-slate-400 text-xs mt-1">Create a praise night first to import songs</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {praiseNights.map((pn) => (
                <div
                  key={pn.id}
                  onClick={() => onSelectPraiseNight(pn.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPraiseNight === pn.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPraiseNight === pn.id ? 'border-purple-500' : 'border-slate-300'
                      }`}>
                      {selectedPraiseNight === pn.id && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{pn.name}</p>
                      <p className="text-xs text-slate-500">
                        {pn.date} • {pn.location || 'No location'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onImport}
              disabled={!selectedPraiseNight || importing}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <CustomLoader size="sm" />
                  <span className="ml-2">Importing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Import Song
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Program Modal Component
function CreateProgramModal({
  onSave,
  onClose
}: {
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-xl font-bold text-slate-900">Create New Program</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Program Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sunday Service Jan 19"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about this program..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none h-24"
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name, description)}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200"
          >
            Create Program
          </button>
        </div>
      </div>
    </div>
  );
}

// Assign to Program Modal Component
function AssignToProgramModal({
  songs,
  programs,
  onAssign,
  onClose
}: {
  songs: MasterSong[];
  programs: MasterProgram[];
  onAssign: (programId: string) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrograms = useMemo(() => {
    if (!searchTerm) return programs;
    const term = searchTerm.toLowerCase();
    return programs.filter(p => p.name.toLowerCase().includes(term));
  }, [programs, searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-900">Add to Program</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
          <p className="text-sm text-slate-500">
            {songs.length === 1
              ? <span>Add "<span className="font-semibold text-slate-900">{songs[0].title}</span>" to program</span>
              : <span>Add <span className="font-semibold text-slate-900">{songs.length}</span> songs to program</span>
            }
          </p>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search programs..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredPrograms.length === 0 ? (
            <div className="p-8 text-center">
              <Plus className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No programs found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredPrograms.map(program => {
                // Check if ALL songs are in this program
                const allSelectedInProgram = songs.every(s => program.songIds?.includes(s.id));
                // Check if SOME are in
                const someSelectedInProgram = songs.some(s => program.songIds?.includes(s.id));

                return (
                  <button
                    key={program.id}
                    onClick={() => onAssign(program.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${allSelectedInProgram
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${allSelectedInProgram
                        ? 'bg-purple-600 border-purple-600'
                        : someSelectedInProgram
                          ? 'bg-purple-100 border-purple-600'
                          : 'border-slate-300'
                        }`}>
                        {allSelectedInProgram && <Plus className="w-3.5 h-3.5 text-white" />}
                        {someSelectedInProgram && !allSelectedInProgram && <div className="w-2 h-2 bg-purple-600 rounded-sm" />}
                      </div>
                      <span>{program.name}</span>
                    </div>
                    {allSelectedInProgram && <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Added</span>}
                    {someSelectedInProgram && !allSelectedInProgram && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Partial</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ... existing PublishModal etc. below
