"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Calendar,
  FileText,
  Plus,
  ChevronLeft,
  Edit,
  Trash2,
  Music,
  ArrowDownUp,
  MapPin,
  Clock,
  X,
  CheckCircle2,
  Circle,
  Download
} from "lucide-react";
import { SubGroupDatabaseService, SubGroupSong, SubGroupRehearsal } from '@/lib/subgroup-database-service';
import { useAuth } from '@/hooks/useAuth';
import { Toast, ToastContainer } from '../Toast';
import CustomLoader from '@/components/CustomLoader';
import { FirebaseMetadataService } from '@/lib/firebase-metadata-service';
import { normalizeSearchString } from '@/utils/string-utils';
import SubGroupCloneModal from './SubGroupCloneModal';

interface SubGroupPagesSectionProps {
  subGroupId: string;
  zoneId: string;
  subGroupName?: string;
}

export default function SubGroupPagesSection({ subGroupId, zoneId, subGroupName }: SubGroupPagesSectionProps) {
  const { user } = useAuth();
  
  // Tabs State
  const [rehearsals, setRehearsals] = useState<SubGroupRehearsal[]>([]);
  const [selectedRehearsal, setSelectedRehearsal] = useState<SubGroupRehearsal | null>(null);
  const [rehearsalSongs, setRehearsalSongs] = useState<SubGroupSong[]>([]);
  const [allSubGroupSongs, setAllSubGroupSongs] = useState<SubGroupSong[]>([]);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [songsLoading, setSongsLoading] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'heard' | 'unheard'>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modal State
  const [showRehearsalModal, setShowRehearsalModal] = useState(false);
  const [editingRehearsal, setEditingRehearsal] = useState<SubGroupRehearsal | null>(null);
  const [showSongModal, setShowSongModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [editingSong, setEditingSong] = useState<SubGroupSong | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMediaOps, setShowMediaOps] = useState(false);

  // Form State - Rehearsal
  const [rehearsalName, setRehearsalName] = useState('');
  const [rehearsalDate, setRehearsalDate] = useState('');
  const [rehearsalLocation, setRehearsalLocation] = useState('');
  const [rehearsalCategory, setRehearsalCategory] = useState<'ongoing' | 'archive' | 'pre-rehearsal'>('ongoing');

  // Form State - Song
  const [songTitle, setSongTitle] = useState('');
  const [songWriter, setSongWriter] = useState('');
  const [songCategory, setSongCategory] = useState('Praise');
  const [songLyrics, setSongLyrics] = useState('');
  
  // Form State - Media
  const [sopranoUrl, setSopranoUrl] = useState('');
  const [altoUrl, setAltoUrl] = useState('');
  const [tenorUrl, setTenorUrl] = useState('');
  const [bassUrl, setBassUrl] = useState('');
  const [fullAudioUrl, setFullAudioUrl] = useState('');
  const [leaderNote, setLeaderNote] = useState('');
  const [leaderAudioUrl, setLeaderAudioUrl] = useState('');

  // Toast Helpers
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. Subscribe to Rehearsals
  useEffect(() => {
    if (!subGroupId) return;
    
    setLoading(true);
    const unsubscribe = SubGroupDatabaseService.subscribeToRehearsals(
      subGroupId,
      (data) => {
        const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRehearsals(sorted);
        setLoading(false);
        
        if (selectedRehearsal) {
          const updated = sorted.find(r => r.id === selectedRehearsal.id);
          if (updated) setSelectedRehearsal(updated);
        }
      },
      (error) => {
        addToast({ type: 'error', message: 'Failed to load rehearsals' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [subGroupId]);

  // 2. Subscribe to Songs for Selected Rehearsal
  useEffect(() => {
    if (!selectedRehearsal || !selectedRehearsal.songIds || selectedRehearsal.songIds.length === 0) {
      setRehearsalSongs([]);
      return;
    }

    setSongsLoading(true);
    const unsubscribe = SubGroupDatabaseService.subscribeToRehearsalSongs(
      selectedRehearsal.songIds,
      (data) => {
        setRehearsalSongs(data);
        setSongsLoading(false);
      },
      (error) => {
        addToast({ type: 'error', message: 'Failed to load songs' });
        setSongsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedRehearsal?.id, selectedRehearsal?.songIds?.length]);

  // 3. Load All SubGroup Songs
  useEffect(() => {
    if (!subGroupId) return;

    const loadSongs = async () => {
      setLibraryLoading(true);
      try {
        const data = await SubGroupDatabaseService.getSubGroupSongs(subGroupId);
        setAllSubGroupSongs(data);
      } catch (error) {
        addToast({ type: 'error', message: 'Failed to load library' });
      } finally {
        setLibraryLoading(false);
      }
    };

    loadSongs();
  }, [subGroupId]);

  // Filters
  const filteredRehearsals = useMemo(() => {
    if (!searchTerm) return rehearsals;
    const query = normalizeSearchString(searchTerm);
    return rehearsals.filter(r => 
      normalizeSearchString(r.name).includes(query) || 
      normalizeSearchString(r.location || '').includes(query)
    );
  }, [rehearsals, searchTerm]);


  const filteredSongs = useMemo(() => {
    const source = selectedRehearsal ? rehearsalSongs : allSubGroupSongs;
    return source.filter(song => {
      const matchesStatus = statusFilter === 'all' || song.status === statusFilter;
      const matchesSearch = !searchTerm || 
        normalizeSearchString(song.title).includes(normalizeSearchString(searchTerm)) ||
        normalizeSearchString(song.writer || '').includes(normalizeSearchString(searchTerm));
      return matchesStatus && matchesSearch;
    });
  }, [allSubGroupSongs, rehearsalSongs, selectedRehearsal, statusFilter, searchTerm]);

  // Handlers - Rehearsal
  const handleAddRehearsal = () => {
    setEditingRehearsal(null);
    setRehearsalName('');
    setRehearsalDate('');
    setRehearsalLocation('');
    setRehearsalCategory('ongoing');
    setShowRehearsalModal(true);
  };

  const handleEditRehearsal = (rehearsal: SubGroupRehearsal) => {
    setEditingRehearsal(rehearsal);
    setRehearsalName(rehearsal.name);
    setRehearsalDate(rehearsal.date);
    setRehearsalLocation(rehearsal.location || '');
    setRehearsalCategory(rehearsal.category || 'ongoing');
    setShowRehearsalModal(true);
  };

  const saveRehearsal = async () => {
    if (!rehearsalName.trim() || !rehearsalDate || !user) return;
    setIsProcessing(true);
    try {
      if (editingRehearsal) {
        await SubGroupDatabaseService.updateRehearsal(editingRehearsal.id, {
          name: rehearsalName,
          date: rehearsalDate,
          location: rehearsalLocation,
          category: rehearsalCategory
        });
        addToast({ type: 'success', message: 'Rehearsal updated' });
      } else {
        await SubGroupDatabaseService.createRehearsal(subGroupId, zoneId, {
          name: rehearsalName,
          date: rehearsalDate,
          location: rehearsalLocation,
          category: rehearsalCategory,
          subGroupName: subGroupName || ''
        }, user.uid);
        addToast({ type: 'success', message: 'Rehearsal created' });
      }
      
      // Update metadata for real-time Hub refresh
      await FirebaseMetadataService.updateMetadata(zoneId, 'praise_nights');
      
      setShowRehearsalModal(false);
    } catch (error) {
      addToast({ type: 'error', message: 'Operation failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRehearsal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rehearsal?')) return;
    try {
      const result = await SubGroupDatabaseService.deleteRehearsal(id);
      if (result.success) {
        addToast({ type: 'success', message: 'Rehearsal deleted' });
        if (selectedRehearsal?.id === id) setSelectedRehearsal(null);
        
        // Update metadata for real-time Hub refresh
        await FirebaseMetadataService.updateMetadata(zoneId, 'praise_nights');
      }
    } catch (error) {
      addToast({ type: 'error', message: 'Delete failed' });
    }
  };

  // Handlers - Songs
  const handleAddSong = () => {
    setEditingSong(null);
    setSongTitle('');
    setSongWriter('');
    setSongCategory('Praise');
    setSongLyrics('');
    setFullAudioUrl('');
    setSopranoUrl('');
    setAltoUrl('');
    setTenorUrl('');
    setBassUrl('');
    setLeaderNote('');
    setLeaderAudioUrl('');
    setShowMediaOps(false);
    setShowSongModal(true);
  };

  const handleEditSong = (song: SubGroupSong) => {
    setEditingSong(song);
    setSongTitle(song.title);
    setSongWriter(song.writer || '');
    setSongCategory(song.category || 'Praise');
    setSongLyrics(song.lyrics || '');
    setFullAudioUrl(song.audioUrls?.full || '');
    setSopranoUrl(song.audioUrls?.soprano || '');
    setAltoUrl(song.audioUrls?.alto || '');
    setTenorUrl(song.audioUrls?.tenor || '');
    setBassUrl(song.audioUrls?.bass || '');
    setLeaderNote(song.comments && song.comments.length > 0 ? song.comments[0].text : '');
    setLeaderAudioUrl(song.comments && song.comments.length > 0 ? song.comments[0].audioUrl || '' : '');
    setShowMediaOps(false);
    setShowSongModal(true);
  };

  const saveSong = async () => {
    if (!songTitle.trim() || !user) return;
    setIsProcessing(true);
    try {
      const finalComments = (leaderNote && leaderNote.trim() !== '') || leaderAudioUrl ? [
        {
          id: `comment-${Date.now()}`,
          text: leaderNote,
          audioUrl: leaderAudioUrl,
          date: new Date().toISOString(),
          author: "Sub-Group Lead"
        }
      ] : [];

      if (editingSong) {
        await SubGroupDatabaseService.updateSong(editingSong.id, {
          title: songTitle,
          writer: songWriter,
          category: songCategory,
          lyrics: songLyrics,
          audioFile: fullAudioUrl,
          audioUrls: {
            full: fullAudioUrl,
            soprano: sopranoUrl,
            alto: altoUrl,
            tenor: tenorUrl,
            bass: bassUrl
          },
          comments: finalComments
        });
        addToast({ type: 'success', message: 'Song updated' });
        
        // Refresh songs
        const data = await SubGroupDatabaseService.getSubGroupSongs(subGroupId);
        setAllSubGroupSongs(data);
        addToast({ type: 'success', message: 'Song updated' });
      } else {
        const result = await SubGroupDatabaseService.createSong(subGroupId, zoneId, {
          title: songTitle,
          writer: songWriter,
          category: songCategory,
          lyrics: songLyrics,
          audioFile: fullAudioUrl,
          audioUrls: {
            full: fullAudioUrl,
            soprano: sopranoUrl,
            alto: altoUrl,
            tenor: tenorUrl,
            bass: bassUrl
          },
          comments: finalComments
        }, user.uid);
        
        if (result.success && result.id) {
          if (selectedRehearsal) {
            await SubGroupDatabaseService.addSongToRehearsal(selectedRehearsal.id, result.id);
            addToast({ type: 'success', message: 'Song saved to setlist' });
          } else {
            // Refresh main list
            const data = await SubGroupDatabaseService.getSubGroupSongs(subGroupId);
            setAllSubGroupSongs(data);
            addToast({ type: 'success', message: 'Song saved' });
          }
        }
      }
      setShowSongModal(false);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloneSuccess = async (songId: string) => {
    try {
      if (selectedRehearsal) {
        await SubGroupDatabaseService.addSongToRehearsal(selectedRehearsal.id, songId);
        addToast({ type: 'success', message: 'Imported to setlist' });
      } else {
        const data = await SubGroupDatabaseService.getSubGroupSongs(subGroupId);
        setAllSubGroupSongs(data);
        addToast({ type: 'success', message: 'Imported to songs' });
      }
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to process import' });
    }
  };

  const handleToggleStatus = async (song: SubGroupSong) => {
    try {
      await SubGroupDatabaseService.toggleSongStatus(song.id, song.status || 'unheard');
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update status' });
    }
  };

  const handleToggleActive = async (song: SubGroupSong) => {
    try {
      await SubGroupDatabaseService.toggleSongActive(song.id, !!song.isActive);
    } catch (error) {
      addToast({ type: 'error', message: 'Toggle failed' });
    }
  };

  const handleDeleteSongFromRehearsal = async (songId: string) => {
    if (!confirm('Remove this song from the setlist? (It will still be in your songs list)')) return;
    if (!selectedRehearsal) return;
    try {
      const updatedIds = selectedRehearsal.songIds.filter(id => id !== songId);
      await SubGroupDatabaseService.updateRehearsal(selectedRehearsal.id, { songIds: updatedIds });
      addToast({ type: 'success', message: 'Removed from setlist' });
    } catch (error) {
      addToast({ type: 'error', message: 'Operation failed' });
    }
  };

  const handleDeleteSongFromLibrary = async (songId: string) => {
    if (!confirm('PERMANENTLY delete this song from your library? This cannot be undone.')) return;
    try {
      await SubGroupDatabaseService.deleteSong(songId);
      setAllSubGroupSongs(prev => prev.filter(s => s.id !== songId));
      addToast({ type: 'success', message: 'Permanently deleted' });
    } catch (error) {
      addToast({ type: 'error', message: 'Delete failed' });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <CustomLoader message="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-white">
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Sidebar List */}
        <div className={`w-full lg:w-96 border-r border-slate-100 flex flex-col transition-all bg-slate-50/30 ${selectedRehearsal ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900">Setlists</h2>
              <button onClick={handleAddRehearsal} className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/10 hover:bg-purple-700 transition-all active:scale-95">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
            {rehearsals.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Events</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredRehearsals.map(r => (
                    <RehearsalItem 
                      key={r.id} r={r} 
                      isSelected={selectedRehearsal?.id === r.id}
                      onClick={() => setSelectedRehearsal(r)}
                      onEdit={() => handleEditRehearsal(r)}
                      onDelete={() => handleDeleteRehearsal(r.id)}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* View All Songs Link at bottom of sidebar */}
            {selectedRehearsal && (
              <div className="pt-4 border-t border-slate-100 px-4">
                <button 
                  onClick={() => setSelectedRehearsal(null)}
                  className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 rounded-2xl transition-all"
                >
                  <Music className="w-4 h-4" />
                  All Songs
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 flex flex-col bg-white overflow-hidden ${!selectedRehearsal ? 'hidden lg:flex' : 'flex'}`}>
          {selectedRehearsal ? (
            <>
              <div className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedRehearsal(null)} className="lg:hidden p-2 -ml-2 text-slate-400"><ChevronLeft /></button>
                  <div className="flex-1">
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">{selectedRehearsal.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-slate-400">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase"><Calendar className="w-3.5 h-3.5" />{selectedRehearsal.date}</div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase"><MapPin className="w-3.5 h-3.5" />{selectedRehearsal.location || 'No Location'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowCloneModal(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200/50">
                      <Download className="w-4 h-4" /> Import
                    </button>
                    <button onClick={handleAddSong} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all">
                      <Plus className="w-4 h-4" /> Add Song
                    </button>
                  </div>
                </div>
              </div>
              <SongTable 
                songs={filteredSongs} 
                loading={songsLoading}
                onEdit={handleEditSong}
                onDelete={handleDeleteSongFromRehearsal}
                onToggleStatus={handleToggleStatus}
                onToggleActive={handleToggleActive}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden">
              <div className="p-10 bg-white border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Songs</h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">{allSubGroupSongs.length} Tracks</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search songs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-600/5"
                      />
                    </div>
                    <button onClick={() => setShowCloneModal(true)} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                      <Download className="w-4 h-4" /> Import
                    </button>
                    <button onClick={handleAddSong} className="flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all">
                      <Plus className="w-4 h-4" /> New Song
                    </button>
                  </div>
                </div>
              </div>
              <SongTable 
                songs={filteredSongs} 
                loading={libraryLoading}
                onEdit={handleEditSong}
                onDelete={handleDeleteSongFromLibrary}
                onToggleStatus={handleToggleStatus}
                onToggleActive={handleToggleActive}
                isLibraryMode
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals & Components */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {showCloneModal && (
        <SubGroupCloneModal 
          subGroupId={subGroupId}
          zoneId={zoneId}
          onClose={() => setShowCloneModal(false)}
          onSuccess={handleCloneSuccess}
        />
      )}

      {/* Rehearsal Modal */}
      {showRehearsalModal && (
        <Modal onClose={() => setShowRehearsalModal(false)} title={editingRehearsal ? 'Edit Setlist' : 'New Setlist'}>
            <div className="space-y-6">
                <Input label="Event Name" value={rehearsalName} onChange={setRehearsalName} placeholder="e.g. Easter Praise Night" />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Date" value={rehearsalDate} onChange={setRehearsalDate} type="date" />
                    <Input label="Location" value={rehearsalLocation} onChange={setRehearsalLocation} placeholder="Choir Hall" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Status / Category</label>
                    <select 
                      value={rehearsalCategory} 
                      onChange={(e) => setRehearsalCategory(e.target.value as any)} 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none"
                    >
                        <option value="ongoing">Ongoing (Live)</option>
                        <option value="archive">Archive (Past)</option>
                        <option value="pre-rehearsal">Pre-Rehearsal (Coming Soon)</option>
                    </select>
                </div>
                <button onClick={saveRehearsal} disabled={isProcessing || !rehearsalName} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all">
                    {isProcessing ? 'Processing...' : 'Save Rehearsal'}
                </button>
            </div>
        </Modal>
      )}

      {/* Song Modal */}
      {showSongModal && (
        <Modal onClose={() => setShowSongModal(false)} title={editingSong ? 'Edit Track' : 'Create New Track'}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                <Input label="Song Title" value={songTitle} onChange={setSongTitle} placeholder="Awesome God" />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Writer" value={songWriter} onChange={setSongWriter} placeholder="Artist/Composer" />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Category</label>
                        <select value={songCategory} onChange={(e) => setSongCategory(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none">
                            <option>Praise</option>
                            <option>Worship</option>
                            <option>Special</option>
                            <option>Hymn</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Lyrics</label>
                    <textarea value={songLyrics} onChange={(e) => setSongLyrics(e.target.value)} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium min-h-[150px] focus:outline-none" placeholder="Paste lyrics here..." />
                </div>
                
                <div className="border-t border-slate-100 pt-6 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3.5 h-3.5 text-purple-600" />
                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Leader's Note</label>
                        </div>
                        <textarea 
                            value={leaderNote} 
                            onChange={(e) => setLeaderNote(e.target.value)} 
                            className="w-full p-4 bg-purple-50/30 border border-purple-100 rounded-2xl text-sm font-medium min-h-[100px] focus:outline-none focus:ring-4 focus:ring-purple-600/5 focus:border-purple-200 transition-all" 
                            placeholder="Add specific instructions for your subgroup..." 
                        />
                    </div>
                    
                    <Input label="Note Audio URL (Optional)" value={leaderAudioUrl} onChange={setLeaderAudioUrl} placeholder="https://storage.googleapis.com/..." />

                    <button onClick={() => setShowMediaOps(!showMediaOps)} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block hover:text-purple-600 transition-colors">
                        {showMediaOps ? '↑ Hide Technical Tracks' : '↓ Manage Vocal Parts'}
                    </button>
                    {showMediaOps && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <Input label="Full Audio/Instrumental URL" value={fullAudioUrl} onChange={setFullAudioUrl} placeholder="https://..." />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Soprano" value={sopranoUrl} onChange={setSopranoUrl} placeholder="URL" />
                                <Input label="Alto" value={altoUrl} onChange={setAltoUrl} placeholder="URL" />
                                <Input label="Tenor" value={tenorUrl} onChange={setTenorUrl} placeholder="URL" />
                                <Input label="Bass" value={bassUrl} onChange={setBassUrl} placeholder="URL" />
                            </div>
                        </div>
                    )}
                </div>
                
                <button onClick={saveSong} disabled={isProcessing || !songTitle} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all">
                    {isProcessing ? 'Saving...' : 'Save Song'}
                </button>
            </div>
        </Modal>
      )}
    </div>
  );
}

// Sub-components
function RehearsalItem({ r, isSelected, onClick, onEdit, onDelete }: { r: SubGroupRehearsal, isSelected: boolean, onClick: () => void, onEdit: () => void, onDelete: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`group p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'bg-white border-purple-200 shadow-[0_10px_30px_rgba(147,51,234,0.06)] ring-1 ring-purple-100' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <h3 className={`font-black text-sm truncate ${isSelected ? 'text-purple-600' : 'text-slate-900'}`}>{r.name}</h3>
             {r.category === 'ongoing' && (
               <span className="px-2 py-0.5 bg-green-500 text-white rounded text-[8px] font-black uppercase tracking-widest pulse-ring">Live</span>
             )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{r.date} • {r.location || 'Hall'}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600"></div>}
    </div>
  );
}

function SongTable({ songs, loading, onEdit, onDelete, onToggleStatus, onToggleActive, isLibraryMode }: { songs: SubGroupSong[], loading: boolean, onEdit: (s: SubGroupSong) => void, onDelete: (id: string) => void, onToggleStatus: (s: SubGroupSong) => void, onToggleActive: (s: SubGroupSong) => void, isLibraryMode?: boolean }) {
  if (loading) return <div className="flex items-center justify-center h-64"><CustomLoader size="sm" /></div>;
  if (songs.length === 0) return <EmptyState icon={<Music className="w-12 h-12" />} title="No Songs" desc="Start by creating or importing songs." />;

  return (
    <div className="p-8">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Track Detail</th>
              <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              {!isLibraryMode && <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Active</th>}
              <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {songs.map(song => (
              <tr key={song.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-5 px-8">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all border border-slate-100/50">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{song.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{song.writer || 'SubGroup Hub'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-tight border border-blue-100/50">{song.category || 'Praise'}</span>
                </td>
                <td className="py-5 px-8">
                    <div className="flex justify-center">
                        <button onClick={() => onToggleStatus(song)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 ${song.status === 'heard' ? 'bg-green-50 text-green-600 shadow-sm border border-green-100/50' : 'bg-slate-50 text-slate-400 border border-slate-200/50'}`}>
                            {song.status === 'heard' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            {song.status === 'heard' ? 'Learned' : 'New'}
                        </button>
                    </div>
                </td>
                {!isLibraryMode && (
                  <td className="py-5 px-8">
                    <div className="flex justify-center">
                        <button onClick={() => onToggleActive(song)} className={`w-12 h-6 rounded-full relative transition-all focus:outline-none ${song.isActive ? 'bg-purple-600' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${song.isActive ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                  </td>
                )}
                <td className="py-5 px-8 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(song)} className="p-3 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(song.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20">
      <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-center text-slate-200 mb-8">{icon}</div>
      <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">{desc}</p>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-[0_20px_70px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                <div className="p-10 flex items-center justify-between border-b border-slate-50">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <button onClick={onClose} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-10">{children}</div>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-600/5 focus:border-purple-600 transition-all"
            />
        </div>
    );
}
