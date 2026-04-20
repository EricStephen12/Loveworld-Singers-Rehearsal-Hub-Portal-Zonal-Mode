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
  Download,
  Filter,
  MoreVertical,
  ChevronRight,
  Save,
  AlertCircle,
  Mic,
  Upload,
  Check,
  Globe,
  Star,
  RefreshCw
} from "lucide-react";
import { SubGroupDatabaseService, SubGroupSong, SubGroupRehearsal } from '@/lib/subgroup-database-service';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
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
  const { currentZone } = useZone();
  
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

  const themeColor = currentZone?.themeColor || '#9333ea';

  // Form State - Rehearsal
  const [rehearsalName, setRehearsalName] = useState('');
  const [rehearsalDate, setRehearsalDate] = useState('');
  const [rehearsalLocation, setRehearsalLocation] = useState('');
  const [rehearsalCategory, setRehearsalCategory] = useState<'ongoing' | 'archive' | 'pre-rehearsal'>('ongoing');

  // Form State - Song
  const [songTitle, setSongTitle] = useState('');
  const [songWriter, setSongWriter] = useState('');
  const [songLeadSinger, setSongLeadSinger] = useState('');
  const [songKey, setSongKey] = useState('');
  const [songTempo, setSongTempo] = useState('');
  const [songCategory, setSongCategory] = useState('Praise');
  const [songLyrics, setSongLyrics] = useState('');
  const [songSolfa, setSongSolfa] = useState('');
  
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

  // Helper function to convert markdown-style formatting to HTML for display
  const markdownToHtml = (text: string): string => {
    if (!text) return '';
    const paragraphs = text.split('\n\n');
    const processedParagraphs = paragraphs
      .filter(p => p.trim() !== '')
      .map(paragraph => {
        let processed = paragraph.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        processed = processed.replace(/\n/g, '<br>');
        return `<div>${processed}</div>`;
      });
    return processedParagraphs.join('');
  };

  // Helper function to convert HTML to markdown-style text for editing
  const htmlToMarkdown = (html: string): string => {
    if (!html) return '';
    return html
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
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
    setSongLeadSinger('');
    setSongKey('');
    setSongTempo('');
    setSongCategory('Praise');
    setSongLyrics('');
    setSongSolfa('');
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
    setSongLeadSinger(song.leadSinger || '');
    setSongKey(song.key || '');
    setSongTempo(song.tempo || '');
    setSongCategory(song.category || 'Praise');
    setSongLyrics(htmlToMarkdown(song.lyrics || ''));
    setSongSolfa(htmlToMarkdown(song.solfa || ''));
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
          leadSinger: songLeadSinger,
          key: songKey,
          tempo: songTempo,
          category: songCategory,
          lyrics: markdownToHtml(songLyrics),
          solfa: markdownToHtml(songSolfa),
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
        
        const data = await SubGroupDatabaseService.getSubGroupSongs(subGroupId);
        setAllSubGroupSongs(data);
      } else {
        const result = await SubGroupDatabaseService.createSong(subGroupId, zoneId, {
          title: songTitle,
          writer: songWriter,
          leadSinger: songLeadSinger,
          key: songKey,
          tempo: songTempo,
          category: songCategory,
          lyrics: markdownToHtml(songLyrics),
          solfa: markdownToHtml(songSolfa),
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
      <div className="flex-1 flex items-center justify-center p-8 bg-white h-full">
        <CustomLoader message="Syncing Hub..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 bg-white">
      {/* Rehearsals List - Standard Sidebar List style from /admin */}
      <div className={`w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col h-full ${selectedRehearsal ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Setlists</h2>
            <button 
              onClick={handleAddRehearsal} 
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Set
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search setlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {rehearsals.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-slate-400">No setlists created yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRehearsals.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => setSelectedRehearsal(r)}
                  className={`
                    p-4 rounded-xl border cursor-pointer transition-all duration-200 group
                    ${selectedRehearsal?.id === r.id 
                      ? 'bg-purple-50 border-purple-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className={`font-bold text-sm truncate ${selectedRehearsal?.id === r.id ? 'text-purple-700' : 'text-slate-900'}`}>{r.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 font-medium">{r.date}</span>
                        {r.category === 'ongoing' && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[8px] font-bold uppercase">Live</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleEditRehearsal(r); }} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-white rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteRehearsal(r.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Removed Master Library button as requested */}
        </div>
      </div>

      {/* Songs Content Area - Standard Admin Style */}
      <div className={`flex-1 flex flex-col bg-white h-full ${!selectedRehearsal && 'hidden lg:flex'}`}>
        {selectedRehearsal ? (
          <>
            {/* Page Header - Tighter & More Professional */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => setSelectedRehearsal(null)} 
                    className="p-2 -ml-1 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate uppercase tracking-tight">{selectedRehearsal.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        {selectedRehearsal.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedRehearsal.location || 'Choir Hall'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full">
                  <button 
                    onClick={() => setShowCloneModal(true)} 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98]"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-600" /> Import
                  </button>
                  <button 
                    onClick={handleAddSong} 
                    className="flex-[1.5] flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Song
                  </button>
                </div>
              </div>
            </div>
            
            {/* Songs List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/20">
               <SongTable 
                 songs={filteredSongs} 
                 loading={songsLoading}
                 onEdit={handleEditSong}
                 onDelete={handleDeleteSongFromRehearsal}
                 onToggleStatus={handleToggleStatus}
                 onToggleActive={handleToggleActive}
                 themeColor={themeColor}
               />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
              <Calendar className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Select a Setlist</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-xs">
              Choose a setlist from the sidebar to manage songs or create a new one to get started.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {showCloneModal && (
        <SubGroupCloneModal 
          subGroupId={subGroupId}
          zoneId={zoneId}
          onClose={() => setShowCloneModal(false)}
          onSuccess={handleCloneSuccess}
        />
      )}

      {/* Rehearsal Modal - Professional Clean Form */}
      {showRehearsalModal && (
        <Modal onClose={() => setShowRehearsalModal(false)} title={editingRehearsal ? 'Edit Setlist' : 'New Setlist'}>
            <div className="space-y-6">
                <Input label="Setlist Name" value={rehearsalName} onChange={setRehearsalName} placeholder="e.g. Sunday Service Preparation" />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Date" value={rehearsalDate} onChange={setRehearsalDate} type="date" />
                    <Input label="Location" value={rehearsalLocation} onChange={setRehearsalLocation} placeholder="e.g. Choir Hall" />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Archive Category</label>
                    <select 
                      value={rehearsalCategory} 
                      onChange={(e) => setRehearsalCategory(e.target.value as any)} 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                        <option value="ongoing">Ongoing (Live on Hub)</option>
                        <option value="archive">Archive (Past History)</option>
                        <option value="pre-rehearsal">Pre-Rehearsal (Internal Only)</option>
                    </select>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={saveRehearsal} 
                    disabled={isProcessing || !rehearsalName} 
                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                  >
                      {isProcessing ? 'Saving...' : 'Save Setlist'}
                  </button>
                </div>
            </div>
        </Modal>
      )}


      {/* Song Modal - Landscape Professional Layout */}
      {showSongModal && (
        <Modal 
          onClose={() => setShowSongModal(false)} 
          title={editingSong ? 'Edit Song' : 'Create Song'}
          maxWidth="max-w-4xl"
        >
          <div className="flex flex-col lg:flex-row gap-8 max-h-[75vh] overflow-hidden">
            {/* Left Column: Details & Audio */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Music className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Song Information</h3>
                </div>
                
                <Input label="Song Title" value={songTitle} onChange={setSongTitle} placeholder="e.g. Holy Spirit" />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Writer / Artist" value={songWriter} onChange={setSongWriter} placeholder="Artist name" />
                  <Input label="Lead Singer" value={songLeadSinger} onChange={setSongLeadSinger} placeholder="Singer name" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select value={songCategory} onChange={(e) => setSongCategory(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                      <option>Praise</option>
                      <option>Worship</option>
                      <option>Special</option>
                      <option>Hymn</option>
                      <option>Theme Song</option>
                    </select>
                  </div>
                  <Input label="Key" value={songKey} onChange={setSongKey} placeholder="e.g. C#" />
                  <Input label="Tempo" value={songTempo} onChange={setSongTempo} placeholder="e.g. 120" />
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Audio & Parts</h3>
                </div>

                <Input label="Main Instrumental / Full Audio" value={fullAudioUrl} onChange={setFullAudioUrl} placeholder="Direct URL to audio file" />

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                   <button 
                    onClick={() => setShowMediaOps(!showMediaOps)} 
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <span>Vocal Part Assignments</span>
                    {showMediaOps ? <ChevronLeft className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  
                  {showMediaOps && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                      <Input label="Soprano" value={sopranoUrl} onChange={setSopranoUrl} />
                      <Input label="Alto" value={altoUrl} onChange={setAltoUrl} />
                      <Input label="Tenor" value={tenorUrl} onChange={setTenorUrl} />
                      <Input label="Bass" value={bassUrl} onChange={setBassUrl} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vocal Instruction (Text)</label>
                  <textarea 
                    value={leaderNote} 
                    onChange={(e) => setLeaderNote(e.target.value)} 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
                    placeholder="e.g. Tenors start at the second verse..." 
                  />
                </div>
                
                <Input label="Audio Instruction Link" value={leaderAudioUrl} onChange={setLeaderAudioUrl} placeholder="Voice note link" />
              </section>
            </div>

            {/* Right Column: Lyrics & Solfa */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Lyrics Structure</h3>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Supports **Bold**</span>
                </div>
                <textarea 
                  value={songLyrics} 
                  onChange={(e) => setSongLyrics(e.target.value)} 
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold min-h-[280px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono text-slate-700 leading-relaxed" 
                  placeholder="Paste track lyrics here... Use **VERSE 1** for bold headings." 
                />
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Conductor's Guide (Solfa)</h3>
                </div>
                <textarea 
                  value={songSolfa} 
                  onChange={(e) => setSongSolfa(e.target.value)} 
                  className="w-full p-5 bg-amber-50/30 border border-amber-100 rounded-[2rem] text-sm font-bold min-h-[150px] focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-mono text-amber-900 leading-relaxed" 
                  placeholder="Enter musical notation or guide instructions..." 
                />
              </section>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-50">
            <button
              onClick={() => setShowSongModal(false)}
              className="px-8 py-3.5 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              onClick={saveSong} 
              disabled={isProcessing || !songTitle} 
              className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isProcessing ? 'Saving...' : 'Save Track Details'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Sub-components
function SongTable({ songs, loading, onEdit, onDelete, onToggleStatus, onToggleActive, isLibraryMode, themeColor }: any) {
  if (loading) return <div className="flex flex-col items-center justify-center h-64 gap-3"><div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Repertoire...</p></div>;
  if (songs.length === 0) return <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100"><Music className="w-12 h-12 text-slate-200 mb-4" /><h3 className="text-lg font-bold text-slate-900 mb-1">No tracks found</h3><p className="text-xs text-slate-400 max-w-xs leading-relaxed">Add your first song to this setlist or import from the library.</p></div>;

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Track</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                {!isLibraryMode && <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active</th>}
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {songs.map((song: any) => (
                <tr key={song.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{song.title}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{song.writer || 'Artist unknown'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-tight">
                      {song.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onToggleStatus(song)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${song.status === 'heard' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {song.status === 'heard' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      {song.status === 'heard' ? 'Learned' : 'New'}
                    </button>
                  </td>
                  {!isLibraryMode && (
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onToggleActive(song)}
                        className={`w-10 h-5 rounded-full relative transition-all ${song.isActive ? 'bg-purple-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${song.isActive ? 'left-5.5' : 'left-0.5'}`}></div>
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(song)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(song.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Professional & Tight */}
      <div className="lg:hidden space-y-4">
        {songs.map((song: any) => (
          <div key={song.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-5 transition-all active:scale-[0.99]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 shadow-inner">
                  <Music className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 text-[14px] leading-tight truncate uppercase tracking-tight">{song.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-wider mt-1">{song.writer || 'Unknown Artist'}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => onEdit(song)} className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => onDelete(song.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
               <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => onToggleStatus(song)}
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${song.status === 'heard' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}
                  >
                    {song.status === 'heard' ? 'Learned' : 'New'}
                  </button>
                  <span className="px-2.5 py-1.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">{song.category || 'General'}</span>
               </div>
               
               {!isLibraryMode && (
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live</span>
                    <button 
                      onClick={() => onToggleActive(song)}
                      className={`w-10 h-5.5 rounded-full relative transition-all shadow-inner ${song.isActive ? 'bg-purple-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-0.75 w-4 h-4 rounded-full bg-white shadow-md transition-all ${song.isActive ? 'left-[1.25rem]' : 'left-0.75'}`}></div>
                    </button>
                  </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modal({ children, onClose, title, maxWidth = "max-w-xl" }: { children: React.ReactNode, onClose: () => void, title: string, maxWidth?: string }) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[130] p-0 sm:p-6 animate-in fade-in duration-300">
            <div className={`bg-white rounded-none sm:rounded-[3rem] w-full ${maxWidth} shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col max-h-full sm:max-h-[90vh]`}>
                <div className="p-6 sm:p-10 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-[10]">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Manage your track repertoire</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all border border-transparent hover:border-slate-100"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">{children}</div>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm"
            />
        </div>
    );
}
