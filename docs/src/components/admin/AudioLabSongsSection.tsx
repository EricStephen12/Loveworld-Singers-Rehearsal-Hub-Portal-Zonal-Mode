'use client';

import { useState, useEffect } from 'react';
import { 
  Music, Plus, Trash2, Edit, Upload, Loader2, 
  Search, X, Check, AlertCircle 
} from 'lucide-react';
import { getSongs, createSong, updateSong, deleteSong, clearSongCache } from '@/app/pages/audiolab/_lib/song-service';
import { uploadToCloudinary } from '@/lib/cloudinary-media-service';
import { useAuth } from '@/hooks/useAuth';
import type { AudioLabSong, VocalPart, AudioUrls, CreateSongInput } from '@/app/pages/audiolab/_types';

const VOCAL_PARTS: VocalPart[] = ['full', 'soprano', 'alto', 'tenor', 'bass'];

const partLabels: Record<VocalPart, string> = {
  full: 'Full Mix',
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass'
};

interface SongFormData {
  title: string;
  artist: string;
  genre: string;
  key: string;
  tempo: string;
  albumArt: string;
  audioUrls: AudioUrls;
  isHQSong: boolean;
}

const initialFormData: SongFormData = {
  title: '',
  artist: '',
  genre: '',
  key: '',
  tempo: '',
  albumArt: '',
  audioUrls: {},
  isHQSong: true
};

export function AudioLabSongsSection() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<AudioLabSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSong, setEditingSong] = useState<AudioLabSong | null>(null);
  const [formData, setFormData] = useState<SongFormData>(initialFormData);
  const [uploadingPart, setUploadingPart] = useState<VocalPart | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (err) {
      console.error('Error loading songs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingSong(null);
    setFormData(initialFormData);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (song: AudioLabSong) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      genre: song.genre || '',
      key: song.key || '',
      tempo: song.tempo?.toString() || '',
      albumArt: song.albumArt || '',
      audioUrls: { ...song.audioUrls },
      isHQSong: song.isHQSong
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSong(null);
    setFormData(initialFormData);
    setError(null);
  };

  const handleAudioUpload = async (part: VocalPart, file: File) => {
    if (!file) return;
    
    setUploadingPart(part);
    setError(null);
    
    try {
      // Get audio duration
      const duration = await getAudioDuration(file);
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, {
        folder: 'audiolab/songs',
        resourceType: 'video' // Cloudinary uses 'video' for audio
      });
      
      if (result.url) {
        setFormData(prev => ({
          ...prev,
          audioUrls: { ...prev.audioUrls, [part]: result.url }
        }));
        
        // Store duration if this is the first part
        if (!formData.audioUrls.full && part === 'full') {
          // Duration will be calculated on save
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to upload ${partLabels[part]} audio`);
    } finally {
      setUploadingPart(null);
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(file);
    });
  };

  const removeAudioPart = (part: VocalPart) => {
    setFormData(prev => {
      const newUrls = { ...prev.audioUrls };
      delete newUrls[part];
      return { ...prev, audioUrls: newUrls };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artist) {
      setError('Title and artist are required');
      return;
    }
    
    if (Object.keys(formData.audioUrls).length === 0) {
      setError('At least one audio file is required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Calculate duration from first available audio
      let duration = 0;
      const firstUrl = Object.values(formData.audioUrls)[0];
      if (firstUrl) {
        duration = await getAudioDurationFromUrl(firstUrl);
      }
      
      if (editingSong) {
        // Update existing song
        const result = await updateSong(editingSong.id, {
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre || undefined,
          key: formData.key || undefined,
          tempo: formData.tempo ? parseInt(formData.tempo) : undefined,
          albumArt: formData.albumArt || undefined,
          audioUrls: formData.audioUrls,
          isHQSong: formData.isHQSong
        });
        
        if (result.success) {
          setSuccess('Song updated successfully');
          closeModal();
          loadSongs();
        } else {
          setError(result.error || 'Failed to update song');
        }
      } else {
        // Create new song
        const input: CreateSongInput = {
          title: formData.title,
          artist: formData.artist,
          duration,
          audioUrls: formData.audioUrls,
          availableParts: Object.keys(formData.audioUrls) as VocalPart[],
          genre: formData.genre || undefined,
          key: formData.key || undefined,
          tempo: formData.tempo ? parseInt(formData.tempo) : undefined,
          albumArt: formData.albumArt || undefined,
          isHQSong: formData.isHQSong,
          createdBy: user?.uid || ''
        };
        
        const result = await createSong(input);
        
        if (result.success) {
          setSuccess('Song created successfully');
          closeModal();
          loadSongs();
        } else {
          setError(result.error || 'Failed to create song');
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const getAudioDurationFromUrl = async (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.onloadedmetadata = () => resolve(Math.round(audio.duration));
      audio.onerror = () => resolve(0);
    });
  };

  const handleDelete = async (song: AudioLabSong) => {
    if (!confirm(`Delete "${song.title}"? This cannot be undone.`)) return;
    
    const result = await deleteSong(song.id);
    if (result.success) {
      setSuccess('Song deleted');
      loadSongs();
    } else {
      setError(result.error || 'Failed to delete song');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AudioLab Songs</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage songs with multi-part vocal tracks
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Song
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          <Check size={18} />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Songs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-violet-500" />
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-12">
          <Music size={48} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">
            {searchQuery ? 'No songs found' : 'No songs yet. Add your first song!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
            >
              {/* Album Art */}
              <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {song.albumArt ? (
                  <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                  <Music size={24} className="text-slate-500" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{song.title}</h3>
                <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                <div className="flex items-center gap-2 mt-1">
                  {song.availableParts.map(part => (
                    <span
                      key={part}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium uppercase"
                    >
                      {part === 'full' ? 'Full' : part.charAt(0)}
                    </span>
                  ))}
                  <span className="text-xs text-slate-500">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(song)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(song)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
              <h3 className="text-lg font-bold text-white">
                {editingSong ? 'Edit Song' : 'Add New Song'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g., Choral, Gospel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Key
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g., C Major"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Tempo (BPM)
                  </label>
                  <input
                    type="number"
                    value={formData.tempo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tempo: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Album Art URL
                  </label>
                  <input
                    type="url"
                    value={formData.albumArt}
                    onChange={(e) => setFormData(prev => ({ ...prev, albumArt: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Audio Parts */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Audio Tracks *
                </label>
                <div className="space-y-2">
                  {VOCAL_PARTS.map(part => (
                    <div
                      key={part}
                      className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg"
                    >
                      <span className="w-20 text-sm font-medium text-slate-300">
                        {partLabels[part]}
                      </span>
                      
                      {formData.audioUrls[part] ? (
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm text-green-400 truncate flex-1">
                            ✓ Uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAudioPart(part)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAudioUpload(part, file);
                            }}
                            className="hidden"
                            disabled={uploadingPart !== null}
                          />
                          <span className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                            uploadingPart === part
                              ? 'bg-violet-500/20 text-violet-400'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}>
                            {uploadingPart === part ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                Upload
                              </>
                            )}
                          </span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Upload at least one audio track. Full Mix is recommended.
                </p>
              </div>

              {/* HQ Song Toggle */}
              <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isHQSong}
                  onChange={(e) => setFormData(prev => ({ ...prev, isHQSong: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 text-violet-500 focus:ring-violet-500"
                />
                <div>
                  <span className="text-sm font-medium text-white">HQ Song</span>
                  <p className="text-xs text-slate-400">Available to all zones</p>
                </div>
              </label>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingSong ? 'Update Song' : 'Create Song'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
