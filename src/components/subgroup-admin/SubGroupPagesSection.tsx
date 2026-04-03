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
  MoreVertical,
  X,
  CheckCircle2,
  Circle
} from "lucide-react";
import { SubGroupDatabaseService, SubGroupSong, SubGroupRehearsal } from '@/lib/subgroup-database-service';
import { useAuth } from '@/hooks/useAuth';
import { Toast, ToastContainer } from '../Toast';
import CustomLoader from '@/components/CustomLoader';
import { normalizeSearchString } from '@/utils/string-utils';

interface SubGroupPagesSectionProps {
  subGroupId: string;
  zoneId: string;
  subGroupName?: string;
}

export default function SubGroupPagesSection({ subGroupId, zoneId, subGroupName }: SubGroupPagesSectionProps) {
  const { user } = useAuth();
  
  // Data State
  const [rehearsals, setRehearsals] = useState<SubGroupRehearsal[]>([]);
  const [selectedRehearsal, setSelectedRehearsal] = useState<SubGroupRehearsal | null>(null);
  const [rehearsalSongs, setRehearsalSongs] = useState<SubGroupSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [songsLoading, setSongsLoading] = useState(false);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'heard' | 'unheard'>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modal State
  const [showRehearsalModal, setShowRehearsalModal] = useState(false);
  const [editingRehearsal, setEditingRehearsal] = useState<SubGroupRehearsal | null>(null);
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<SubGroupSong | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State - Rehearsal
  const [rehearsalName, setRehearsalName] = useState('');
  const [rehearsalDate, setRehearsalDate] = useState('');
  const [rehearsalLocation, setRehearsalLocation] = useState('');

  // Form State - Song
  const [songTitle, setSongTitle] = useState('');
  const [songWriter, setSongWriter] = useState('');
  const [songCategory, setSongCategory] = useState('');
  const [songLyrics, setSongLyrics] = useState('');

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
        
        // Update selected rehearsal if it's currently selected
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
    return rehearsalSongs.filter(song => {
      const matchesStatus = statusFilter === 'all' || song.status === statusFilter;
      const matchesSearch = !searchTerm || 
        normalizeSearchString(song.title).includes(normalizeSearchString(searchTerm)) ||
        normalizeSearchString(song.writer || '').includes(normalizeSearchString(searchTerm));
      return matchesStatus && matchesSearch;
    });
  }, [rehearsalSongs, statusFilter, searchTerm]);

  // Handlers - Rehearsal
  const handleAddRehearsal = () => {
    setEditingRehearsal(null);
    setRehearsalName('');
    setRehearsalDate('');
    setRehearsalLocation('');
    setShowRehearsalModal(true);
  };

  const handleEditRehearsal = (rehearsal: SubGroupRehearsal) => {
    setEditingRehearsal(rehearsal);
    setRehearsalName(rehearsal.name);
    setRehearsalDate(rehearsal.date);
    setRehearsalLocation(rehearsal.location || '');
    setShowRehearsalModal(true);
  };

  const saveRehearsal = async () => {
    if (!rehearsalName.trim() || !rehearsalDate || !user) return;
    setIsProcessing(true);
    try {
      if (editingRehearsal) {
        const result = await SubGroupDatabaseService.updateRehearsal(editingRehearsal.id, {
          name: rehearsalName,
          date: rehearsalDate,
          location: rehearsalLocation
        });
        if (result.success) addToast({ type: 'success', message: 'Rehearsal updated' });
      } else {
        const result = await SubGroupDatabaseService.createRehearsal(subGroupId, zoneId, {
          name: rehearsalName,
          date: rehearsalDate,
          location: rehearsalLocation,
          subGroupName: subGroupName || ''
        }, user.uid);
        if (result.success) addToast({ type: 'success', message: 'Rehearsal created' });
      }
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
    setShowSongModal(true);
  };

  const handleEditSong = (song: SubGroupSong) => {
    setEditingSong(song);
    setSongTitle(song.title);
    setSongWriter(song.writer || '');
    setSongCategory(song.category || 'Praise');
    setSongLyrics(song.lyrics || '');
    setShowSongModal(true);
  };

  const saveSong = async () => {
    if (!songTitle.trim() || !user || !selectedRehearsal) return;
    setIsProcessing(true);
    try {
      if (editingSong) {
        await SubGroupDatabaseService.updateSong(editingSong.id, {
          title: songTitle,
          writer: songWriter,
          category: songCategory,
          lyrics: songLyrics
        });
        addToast({ type: 'success', message: 'Song updated' });
      } else {
        const result = await SubGroupDatabaseService.createSong(subGroupId, zoneId, {
          title: songTitle,
          writer: songWriter,
          category: songCategory,
          lyrics: songLyrics
        }, user.uid);
        
        if (result.success && result.id) {
          await SubGroupDatabaseService.addSongToRehearsal(selectedRehearsal.id, result.id);
          addToast({ type: 'success', message: 'Song added to rehearsal' });
        }
      }
      setShowSongModal(false);
    } catch (error) {
      addToast({ type: 'error', message: 'Operation failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (song: SubGroupSong) => {
    try {
      await SubGroupDatabaseService.toggleSongStatus(song.id, song.status || 'unheard');
    } catch (error) {
      addToast({ type: 'error', message: 'Status toggle failed' });
    }
  };

  const handleToggleActive = async (song: SubGroupSong) => {
    try {
      await SubGroupDatabaseService.toggleSongActive(song.id, !!song.isActive);
    } catch (error) {
      addToast({ type: 'error', message: 'Active toggle failed' });
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Remove this song from the rehearsal?')) return;
    // For now we just remove from the rehearsal's songIds array
    if (!selectedRehearsal) return;
    try {
      const updatedIds = selectedRehearsal.songIds.filter(id => id !== songId);
      await SubGroupDatabaseService.updateRehearsal(selectedRehearsal.id, { songIds: updatedIds });
      addToast({ type: 'success', message: 'Song removed from rehearsal' });
    } catch (error) {
      addToast({ type: 'error', message: 'Removal failed' });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <CustomLoader message="Syncing with cloud..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50/50">
      {/* LEFT SIDEBAR: Rehearsals List */}
      <div className={`w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col h-full transition-all ${selectedRehearsal ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Rehearsals</h2>
            <button
              onClick={handleAddRehearsal}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center"
              title="Add Rehearsal"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredRehearsals.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No rehearsals found</p>
            </div>
          ) : (
            filteredRehearsals.map((rehearsal) => (
              <div
                key={rehearsal.id}
                onClick={() => setSelectedRehearsal(rehearsal)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                  selectedRehearsal?.id === rehearsal.id
                    ? 'bg-purple-50 border border-purple-100 shadow-sm'
                    : 'bg-white border border-transparent hover:bg-slate-50 hover:border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex flex-col gap-1 pr-8">
                  <h3 className={`font-semibold text-sm truncate ${selectedRehearsal?.id === rehearsal.id ? 'text-purple-700' : 'text-slate-800'}`}>
                    {rehearsal.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {rehearsal.date}
                  </div>
                  {rehearsal.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      {rehearsal.location}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                      {rehearsal.songIds?.length || 0} songs
                    </span>
                  </div>
                </div>
                
                {/* Actions overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditRehearsal(rehearsal); }}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-blue-500 transition-colors shadow-sm bg-white/80"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteRehearsal(rehearsal.id); }}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors shadow-sm bg-white/80"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CONTENT: Page Details & Songs */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${!selectedRehearsal ? 'hidden lg:flex' : 'flex'}`}>
        {selectedRehearsal ? (
          <>
            {/* Toolbar / Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
              <div className="p-4 lg:p-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedRehearsal(null)}
                    className="lg:hidden p-2 -ml-2 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 truncate">{selectedRehearsal.name}</h1>
                    <div className="flex items-center gap-4 mt-1 text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-4 h-4" />
                        {selectedRehearsal.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="w-4 h-4" />
                        {selectedRehearsal.location || 'No location set'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddSong}
                      className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl shadow-sm hover:bg-purple-700 transition-all active:scale-95 font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Song</span>
                    </button>
                  </div>
                </div>
                
                {/* Desktop Filters */}
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter rehearsal songs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                  >
                    <option value="all">All Items</option>
                    <option value="heard">Heard</option>
                    <option value="unheard">Unheard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Songs List */}
            <div className="flex-1 overflow-y-auto">
              {songsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <CustomLoader size="sm" />
                </div>
              ) : filteredSongs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 p-8 text-center bg-white/30 backdrop-blur-sm rounded-3xl m-6 border border-dashed border-slate-200">
                  <Music className="w-12 h-12 text-slate-200 mb-4" />
                  <h3 className="font-semibold text-slate-800">No songs yet</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs">Start creating your setlist by adding songs to this rehearsal.</p>
                  <button onClick={handleAddSong} className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700">Add first song →</button>
                </div>
              ) : (
                <div className="p-4 lg:p-6">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/50 border-b border-slate-200">
                        <tr>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Song Information</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Member View</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSongs.map((song) => (
                          <tr key={song.id} className="group hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${song.status === 'heard' ? 'bg-green-50' : 'bg-purple-50'}`}>
                                  <Music className={`w-5 h-5 ${song.status === 'heard' ? 'text-green-600' : 'text-purple-600'}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 truncate">{song.title}</p>
                                  <p className="text-xs text-slate-500 truncate">{song.writer || 'Unknown writer'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                                {song.category || 'General'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleStatus(song)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                                  song.status === 'heard' 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                              >
                                {song.status === 'heard' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                {song.status === 'heard' ? 'Heard' : 'Unheard'}
                              </button>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleActive(song)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                                  song.isActive ? 'bg-purple-600' : 'bg-slate-200'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${song.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                              <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {song.isActive ? 'Blinking' : 'Off'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleEditSong(song)}
                                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSong(song.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <Music className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Rehearsal</h3>
              <p className="text-slate-500 text-sm">Choose a rehearsal from the sidebar to view and manage its song setlist.</p>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showRehearsalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-6 lg:p-8 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingRehearsal ? 'Edit Rehearsal' : 'New Rehearsal'}</h2>
              <button 
                onClick={() => setShowRehearsalModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 lg:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Event Name</label>
                <input
                  type="text"
                  value={rehearsalName}
                  onChange={(e) => setRehearsalName(e.target.value)}
                  placeholder="e.g., Sunday Service Rehearsal"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 text-slate-900"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Date</label>
                  <input
                    type="date"
                    value={rehearsalDate}
                    onChange={(e) => setRehearsalDate(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-600/10 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Location</label>
                  <input
                    type="text"
                    value={rehearsalLocation}
                    onChange={(e) => setRehearsalLocation(e.target.value)}
                    placeholder="Choir Hall"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-600/10 text-slate-900"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 lg:p-8 bg-slate-50/50 flex gap-4">
              <button 
                onClick={() => setShowRehearsalModal(false)}
                className="flex-1 px-6 py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={saveRehearsal}
                disabled={isProcessing || !rehearsalName.trim() || !rehearsalDate}
                className="flex-1 px-6 py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <CustomLoader size="sm" /> : editingRehearsal ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSongModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-6 lg:p-8 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingSong ? 'Edit Song' : 'Add New Song'}</h2>
              <button 
                onClick={() => setShowSongModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 lg:p-8 space-y-5 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Title *</label>
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Song title"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-600/10 text-slate-900"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Writer</label>
                  <input
                    type="text"
                    value={songWriter}
                    onChange={(e) => setSongWriter(e.target.value)}
                    placeholder="Lyrics/Composer"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-600/10 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Category</label>
                  <select
                    value={songCategory}
                    onChange={(e) => setSongCategory(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-600/10 text-slate-900 appearance-none"
                  >
                    <option value="Praise">Praise</option>
                    <option value="Worship">Worship</option>
                    <option value="Anthem">Anthem</option>
                    <option value="Special">Special Number</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Lyrics</label>
                <textarea
                  value={songLyrics}
                  onChange={(e) => setSongLyrics(e.target.value)}
                  placeholder="Enter lyrics here..."
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-600/10 text-slate-900 resize-none"
                />
              </div>
            </div>
            
            <div className="p-6 lg:p-8 bg-slate-50/50 flex gap-4 text-sm font-bold">
              <button 
                onClick={() => setShowSongModal(false)}
                className="flex-1 px-6 py-4 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={saveSong}
                disabled={isProcessing || !songTitle.trim()}
                className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <CustomLoader size="sm" /> : editingSong ? 'Update' : 'Add to Setlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
