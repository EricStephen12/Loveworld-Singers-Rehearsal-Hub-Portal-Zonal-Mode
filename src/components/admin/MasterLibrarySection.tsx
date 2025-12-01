"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Library, 
  Search, 
  Upload, 
  Music, 
  Download,  
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  FileText
} from 'lucide-react';
import { MasterLibraryService, MasterSong } from '@/lib/master-library-service';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { useZone } from '@/hooks/useZone';
import { useAuth } from '@/hooks/useAuth';
import { isHQGroup, isBossZone } from '@/config/zones';

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
  const [publishing, setPublishing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedForPublish, setSelectedForPublish] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalSongs: 0, totalImports: 0, mostImported: [] as MasterSong[] });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Zone-specific state for importing
  const [zonePraiseNights, setZonePraiseNights] = useState<any[]>([]);
  const [selectedPraiseNight, setSelectedPraiseNight] = useState<string>('');

  // Load data
  useEffect(() => {
    loadData();
  }, [currentZone, isHQAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Always load master songs and stats
      const [songs, statsData, internal] = await Promise.all([
        MasterLibraryService.getMasterSongs(),
        MasterLibraryService.getMasterLibraryStats(),
        MasterLibraryService.getHQInternalSongs() // Always fetch HQ internal songs
      ]);
      
      setMasterSongs(songs);
      setStats(statsData);
      setHqInternalSongs(internal);
      
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Music className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSongs}</p>
                <p className="text-sm text-slate-500">Songs in Library</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalImports}</p>
                <p className="text-sm text-slate-500">Total Imports</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.mostImported[0]?.importCount || 0}
                </p>
                <p className="text-sm text-slate-500">Top Song Imports</p>
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
                  onDelete={() => handleDelete(song.id)}
                  onImport={() => openImportModal(song)}
                />
              ))}
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
        />
      )}

      {/* Song Details Modal */}
      {showDetailsModal && selectedSong && (
        <SongDetailsModal
          song={selectedSong}
          onClose={() => {
            setShowDetailsModal(false);
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


// Song Row Component
function SongRow({ 
  song, 
  canManage, 
  canImport,
  onView, 
  onDelete,
  onImport
}: { 
  song: MasterSong; 
  canManage: boolean;
  canImport?: boolean;
  onView: () => void; 
  onDelete: () => void;
  onImport?: () => void;
}) {
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
            <Music className="w-5 h-5 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-slate-900 truncate">{song.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {song.writer && <span>{song.writer}</span>}
              {song.writer && song.category && <span>•</span>}
              {song.category && <span>{song.category}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {/* Import count badge */}
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <Download className="w-3 h-3" />
            {song.importCount || 0}
          </div>
          
          {/* Import button (Zone Coordinators only) */}
          {canImport && onImport && (
            <button
              onClick={onImport}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              title="Import to your zone"
            >
              <Plus className="w-3.5 h-3.5" />
              Import
            </button>
          )}
          
          {/* View button */}
          <button
            onClick={onView}
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {/* Delete button (HQ Admin only) */}
          {canManage && (
            <button
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove from Master Library"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
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
  publishing
}: {
  songs: any[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onPublish: () => void;
  onClose: () => void;
  publishing: boolean;
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

// Song Details Modal
function SongDetailsModal({
  song,
  onClose
}: {
  song: MasterSong;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<'lyrics' | 'solfa' | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{song.title}</h2>
                <p className="text-sm text-slate-500">
                  {song.writer || 'Unknown writer'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {song.category && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Category</p>
                <p className="font-medium text-slate-900">{song.category}</p>
              </div>
            )}
            {song.key && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Key</p>
                <p className="font-medium text-slate-900">{song.key}</p>
              </div>
            )}
            {song.tempo && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tempo</p>
                <p className="font-medium text-slate-900">{song.tempo}</p>
              </div>
            )}
            {song.leadSinger && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Lead Singer</p>
                <p className="font-medium text-slate-900">{song.leadSinger}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Import Count</p>
              <p className="font-medium text-green-600">{song.importCount || 0} zones</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Published</p>
              <p className="font-medium text-slate-900">
                {song.publishedAt ? new Date(song.publishedAt as any).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
          
          {/* Lyrics */}
          {song.lyrics && (
            <div className="mb-4">
              <button
                onClick={() => setExpanded(expanded === 'lyrics' ? null : 'lyrics')}
                className="w-full flex items-center justify-between p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <span className="font-medium text-slate-900">Lyrics</span>
                {expanded === 'lyrics' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expanded === 'lyrics' && (
                <div className="mt-2 p-4 bg-slate-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                    {song.lyrics}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {/* Solfa */}
          {song.solfa && (
            <div className="mb-4">
              <button
                onClick={() => setExpanded(expanded === 'solfa' ? null : 'solfa')}
                className="w-full flex items-center justify-between p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <span className="font-medium text-slate-900">Solfa Notation</span>
                {expanded === 'solfa' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expanded === 'solfa' && (
                <div className="mt-2 p-4 bg-slate-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                    {song.solfa}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {/* Audio URLs */}
          {song.audioUrls && Object.keys(song.audioUrls).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Audio Tracks</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(song.audioUrls).map(([part, url]) => (
                  url && (
                    <span key={part} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                      {part}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
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
