"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  FileText
} from 'lucide-react';
import { MasterLibraryService, MasterSong } from '@/lib/master-library-service';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { useZone } from '@/hooks/useZone';
import { useAuth } from '@/hooks/useAuth';
import { isHQGroup, isBossZone } from '@/config/zones';
import { MasterSongDetailSheet } from './MasterSongDetailSheet';
import { MasterEditSongModal } from './MasterEditSongModal';

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

  // Load data
  useEffect(() => {
    loadData();
  }, [currentZone, isHQAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Always load master songs and stats with limits
      const [songs, statsData, internal] = await Promise.all([
        MasterLibraryService.getMasterSongs(50), // Load 50 initially
        MasterLibraryService.getMasterLibraryStats(),
        MasterLibraryService.getHQInternalSongs(100) // Load 100 initially
      ]);
      
      setMasterSongs(songs);
      setStats(statsData);
      setHqInternalSongs(internal);
      setHasMoreMasterSongs(MasterLibraryService.hasMoreMasterSongs());
      setHasMoreInternalSongs(MasterLibraryService.hasMoreHQInternalSongs());
      
      console.log('📚 Master songs:', songs.length, '| HQ internal songs:', internal.length);
      
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
  };

  // Load more master songs
  const loadMoreMasterSongs = async () => {
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
  };

  // Load more internal songs (for publish modal)
  const loadMoreInternalSongs = async () => {
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
  };

  // Filter songs based on search
  const filteredMasterSongs = useMemo(() => {
    if (!searchTerm) return masterSongs;
    const term = searchTerm.toLowerCase();
    return masterSongs.filter(song =>
      song.title?.toLowerCase().includes(term) ||
      song.writer?.toLowerCase().includes(term) ||
      song.leadSinger?.toLowerCase().includes(term) ||
      song.category?.toLowerCase().includes(term)
    );
  }, [masterSongs, searchTerm]);

  // Filter internal songs (exclude already published)
  const availableForPublish = useMemo(() => {
    console.log('🔍 availableForPublish - hqInternalSongs count:', hqInternalSongs.length);
    console.log('🔍 availableForPublish - masterSongs count:', masterSongs.length);
    const publishedIds = masterSongs.map(s => s.originalSongId);
    const available = hqInternalSongs.filter(song => !publishedIds.includes(song.id || song.firebaseId));
    console.log('🔍 availableForPublish - available count:', available.length);
    return available;
  }, [hqInternalSongs, masterSongs]);

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
      showToast('success', `Published ${successCount} song(s) to Master Library`);
      loadData(); // Refresh
    }
    if (failCount > 0) {
      showToast('error', `Failed to publish ${failCount} song(s)`);
    }
  };

  // Delete from Master Library
  const handleDelete = async (songId: string) => {
    if (!confirm('Are you sure you want to remove this song from the Master Library?')) return;
    
    const result = await MasterLibraryService.deleteMasterSong(songId);
    if (result.success) {
      showToast('success', 'Song removed from Master Library');
      loadData();
    } else {
      showToast('error', result.error || 'Failed to remove song');
    }
  };

  // Import song to Zone (Zone Coordinators only)
  const handleImport = async () => {
    if (!selectedSong || !selectedPraiseNight || !currentZone) {
      showToast('error', 'Please select a praise night to import to');
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
        showToast('success', `"${selectedSong.title}" imported successfully!`);
        setShowImportModal(false);
        setSelectedSong(null);
        setSelectedPraiseNight('');
        loadData(); // Refresh to update import counts
      } else {
        showToast('error', result.error || 'Failed to import song');
      }
    } catch (error) {
      console.error('Error importing song:', error);
      showToast('error', 'Failed to import song');
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
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading Master Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-gradient-to-br lg:from-slate-50 lg:via-white lg:to-purple-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
            <button
              onClick={() => setShowPublishModal(true)}
              className="p-2.5 bg-white/20 text-white rounded-xl transition-colors active:scale-95"
            >
              <Upload className="w-5 h-5" />
            </button>
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
              <button
                onClick={() => setShowPublishModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Publish Songs
              </button>
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

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search songs by title, writer, or lead singer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900">
              {filteredMasterSongs.length} Song{filteredMasterSongs.length !== 1 ? 's' : ''} Available
            </h2>
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
              {filteredMasterSongs.map((song) => (
                <SongRow
                  key={song.id}
                  song={song}
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
                  onDelete={() => handleDelete(song.id)}
                  onImport={() => openImportModal(song)}
                />
              ))}
              
              {/* Load More Button */}
              {hasMoreMasterSongs && !searchTerm && (
                <div className="p-4 text-center border-t border-slate-100">
                  <button
                    onClick={loadMoreMasterSongs}
                    disabled={isLoadingMore}
                    className="px-6 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {isLoadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading...
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
        />
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
    </div>
  );
}


// Song Row Component - Compact Design
function SongRow({ 
  song, 
  canManage, 
  canImport,
  onView, 
  onEdit,
  onDelete,
  onImport
}: { 
  song: MasterSong; 
  canManage: boolean;
  canImport?: boolean;
  onView: () => void; 
  onEdit?: () => void;
  onDelete: () => void;
  onImport?: () => void;
}) {
  return (
    <div 
      className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors"
      onClick={onView}
    >
      {/* Compact Song Icon */}
      <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600">
        <Music className="w-4 h-4 text-white" />
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-300'
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
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading...
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
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Publishing...
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPraiseNight === pn.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPraiseNight === pn.id ? 'border-purple-500' : 'border-slate-300'
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
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importing...
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
