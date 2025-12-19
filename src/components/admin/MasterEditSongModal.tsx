'use client';

import { useState, useRef } from 'react';
import { 
  X, Music, Upload, Loader2, Check, Trash2,
  Save, AlertCircle
} from 'lucide-react';
import { MasterSong, MasterLibraryService } from '@/lib/master-library-service';
import { uploadAudioToCloudinary } from '@/lib/cloudinary-storage';

interface MasterEditSongModalProps {
  song: MasterSong;
  isOpen: boolean;
  onClose: () => void;
  onSongUpdated: (updatedSong: MasterSong) => void;
}

type AudioPartKey = 'full' | 'soprano' | 'alto' | 'tenor' | 'bass';

const AUDIO_PARTS: { key: AudioPartKey; label: string; color: string }[] = [
  { key: 'full', label: 'Full Mix', color: 'purple' },
  { key: 'soprano', label: 'Soprano', color: 'pink' },
  { key: 'alto', label: 'Alto', color: 'rose' },
  { key: 'tenor', label: 'Tenor', color: 'blue' },
  { key: 'bass', label: 'Bass', color: 'indigo' },
];

export function MasterEditSongModal({ 
  song, 
  isOpen, 
  onClose,
  onSongUpdated,
}: MasterEditSongModalProps) {
  const [formData, setFormData] = useState({
    title: song.title || '',
    writer: song.writer || '',
    leadSinger: song.leadSinger || '',
    key: song.key || '',
    tempo: song.tempo || '',
    category: song.category || '',
    lyrics: song.lyrics || '',
  });
  
  const [audioUrls, setAudioUrls] = useState<Record<AudioPartKey, string>>({
    full: song.audioUrls?.full || song.audioFile || '',
    soprano: song.audioUrls?.soprano || '',
    alto: song.audioUrls?.alto || '',
    tenor: song.audioUrls?.tenor || '',
    bass: song.audioUrls?.bass || '',
  });
  
  const [uploadingPart, setUploadingPart] = useState<AudioPartKey | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRefs = useRef<Record<AudioPartKey, HTMLInputElement | null>>({
    full: null,
    soprano: null,
    alto: null,
    tenor: null,
    bass: null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (part: AudioPartKey, file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    
    setUploadingPart(part);
    setUploadProgress(0);
    setError(null);
    
    try {
      const result = await uploadAudioToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (result?.url) {
        setAudioUrls(prev => ({ ...prev, [part]: result.url }));
        setUploadProgress(100);
      } else {
        setError(`Failed to upload ${part} audio`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to upload ${part} audio`);
    } finally {
      setUploadingPart(null);
      setUploadProgress(0);
    }
  };

  const handleRemoveAudio = (part: AudioPartKey) => {
    setAudioUrls(prev => ({ ...prev, [part]: '' }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const updateData: Partial<MasterSong> = {
        title: formData.title.trim(),
        writer: formData.writer.trim(),
        leadSinger: formData.leadSinger.trim(),
        key: formData.key.trim(),
        tempo: formData.tempo.trim(),
        category: formData.category.trim(),
        lyrics: formData.lyrics,
        audioUrls: {
          full: audioUrls.full,
          soprano: audioUrls.soprano,
          alto: audioUrls.alto,
          tenor: audioUrls.tenor,
          bass: audioUrls.bass,
        },
        audioFile: audioUrls.full, // Keep audioFile in sync with full mix
      };
      
      const result = await MasterLibraryService.updateMasterSong(song.id, updateData);
      
      if (result.success) {
        setSuccess(true);
        const updatedSong: MasterSong = {
          ...song,
          ...updateData,
        };
        onSongUpdated(updatedSong);
        
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(result.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[300] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] z-[300] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Edit Song</h2>
              <p className="text-xs text-slate-500">Update song details and audio parts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm">
              <Check size={16} />
              Changes saved successfully!
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Song Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Song title"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Writer</label>
                <input
                  type="text"
                  value={formData.writer}
                  onChange={(e) => handleInputChange('writer', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Song writer"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Lead Singer</label>
                <input
                  type="text"
                  value={formData.leadSinger}
                  onChange={(e) => handleInputChange('leadSinger', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Lead singer"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Worship, Praise"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Key</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => handleInputChange('key', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., C, G, Am"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tempo</label>
                <input
                  type="text"
                  value={formData.tempo}
                  onChange={(e) => handleInputChange('tempo', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 120 BPM"
                />
              </div>
            </div>
          </div>

          {/* Audio Parts Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Audio Parts</h3>
            <p className="text-xs text-slate-500">Upload separate audio tracks for each vocal part. These will be available in AudioLab for practice.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUDIO_PARTS.map(({ key, label, color }) => (
                <div 
                  key={key}
                  className={`relative p-3 rounded-xl border-2 transition-all ${
                    audioUrls[key] 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    {audioUrls[key] && (
                      <Check size={16} className="text-green-600" />
                    )}
                  </div>
                  
                  {uploadingPart === key ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-purple-600" />
                      <span className="text-xs text-slate-600">{uploadProgress}%</span>
                    </div>
                  ) : audioUrls[key] ? (
                    <div className="flex items-center gap-2">
                      <audio 
                        src={audioUrls[key]} 
                        controls 
                        className="h-8 w-full max-w-[140px]"
                        style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}
                      />
                      <button
                        onClick={() => handleRemoveAudio(key)}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRefs.current[key]?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Upload size={14} />
                      Upload
                    </button>
                  )}
                  
                  <input
                    ref={(el) => { fileInputRefs.current[key] = el; }}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(key, file);
                      e.target.value = '';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Lyrics */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">Lyrics</label>
            <textarea
              value={formData.lyrics}
              onChange={(e) => handleInputChange('lyrics', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Enter song lyrics..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
