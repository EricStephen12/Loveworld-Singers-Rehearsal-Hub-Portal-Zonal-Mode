"use client";

import React from 'react';
import {
  ArrowLeft, Upload, Youtube, Cloud, Check,
  Film, ListVideo, Search, Trash2, X, Plus
} from 'lucide-react';
import { MediaVideo } from '@/lib/media-videos-service';
import { AdminPlaylist } from '@/lib/admin-playlist-service';
import { MediaCategory } from '@/lib/media-category-service';

interface MediaFormsProps {
  view: string;
  setView: (view: any) => void;
  videoForm: any;
  setVideoForm: (form: any) => void;
  playlistForm: any;
  setPlaylistForm: (form: any) => void;
  categoryForm: any;
  setCategoryForm: (form: any) => void;
  selectedVideo: MediaVideo | null;
  selectedPlaylist: AdminPlaylist | null;
  selectedCategory: MediaCategory | null;
  categories: MediaCategory[];
  playlists: AdminPlaylist[];
  videos: MediaVideo[];
  isSubmitting: boolean;
  zoneColor: string;
  onSaveVideo: () => void;
  onSavePlaylist: () => void;
  onSaveCategory: () => void;
  onVideoUrlChange: (url: string) => void;
  onOpenCloudinary: (type: 'video' | 'image', isBatch?: boolean) => void;
  onToggleVideoInPlaylist?: (videoId: string) => void;
  getPlaylistThumb: (p: AdminPlaylist) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  batchFiles: any[];
  setBatchFiles: (files: any) => void;
  onPublishBatch: () => void;
}

export const MediaForms: React.FC<MediaFormsProps> = ({
  view,
  setView,
  videoForm,
  setVideoForm,
  playlistForm,
  setPlaylistForm,
  categoryForm,
  setCategoryForm,
  selectedVideo,
  selectedPlaylist,
  selectedCategory,
  categories,
  playlists,
  videos,
  isSubmitting,
  zoneColor,
  onSaveVideo,
  onSavePlaylist,
  onSaveCategory,
  onVideoUrlChange,
  onOpenCloudinary,
  onToggleVideoInPlaylist,
  getPlaylistThumb,
  searchQuery,
  setSearchQuery,
  batchFiles,
  setBatchFiles,
  onPublishBatch
}) => {
  const darkenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  if (view === 'add-video' || view === 'edit-video') {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <button onClick={() => setView('videos')} className="flex items-center gap-2 text-gray-400 mb-8 group transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Back to Content</span>
        </button>

        <div className="flex items-center gap-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{selectedVideo ? 'Video details' : 'Upload video'}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Thumbnail</label>
              <div onClick={() => onOpenCloudinary('image')} className="relative aspect-video bg-gray-50 rounded border border-gray-200 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group" style={{ borderColor: videoForm.thumbnail ? zoneColor : undefined }}>
                {videoForm.thumbnail ? (
                  <>
                    <img src={videoForm.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Upload className="w-8 h-8 text-white" /></div>
                  </>
                ) : (
                  <><Upload className="w-8 h-8 text-gray-300 mb-2" /><p className="text-xs font-medium text-gray-400">Upload thumbnail</p></>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Video Source</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setVideoForm({ ...videoForm, isYouTube: true, videoUrl: '', thumbnail: '' })} className={`py-3 rounded border text-xs font-bold transition-all flex flex-col items-center gap-2 ${videoForm.isYouTube ? 'bg-purple-50' : 'bg-white'}`} style={{ borderColor: videoForm.isYouTube ? zoneColor : '#E5E7EB', color: videoForm.isYouTube ? zoneColor : '#9CA3AF' }}>
                  <Youtube className="w-5 h-5" /> YOUTUBE
                </button>
                <button onClick={() => setVideoForm({ ...videoForm, isYouTube: false, videoUrl: '', thumbnail: '' })} className={`py-3 rounded border text-xs font-bold transition-all flex flex-col items-center gap-2 ${!videoForm.isYouTube ? 'bg-purple-50' : 'bg-white'}`} style={{ borderColor: !videoForm.isYouTube ? zoneColor : '#E5E7EB', color: !videoForm.isYouTube ? zoneColor : '#9CA3AF' }}>
                  <Cloud className="w-5 h-5" /> DIRECT
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{videoForm.isYouTube ? 'Video link' : 'Video file'}</label>
              {videoForm.isYouTube ? (
                <input type="url" value={videoForm.videoUrl} onChange={(e) => onVideoUrlChange(e.target.value)} placeholder="Paste YouTube link here..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium" />
              ) : (
                <div onClick={() => !videoForm.videoUrl && onOpenCloudinary('video')} className={`p-4 rounded border flex items-center gap-4 transition-all cursor-pointer ${videoForm.videoUrl ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${videoForm.videoUrl ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400 border border-gray-200'}`}>{videoForm.videoUrl ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}</div>
                  <div><p className={`text-xs font-bold ${videoForm.videoUrl ? 'text-green-700' : 'text-gray-700'}`}>{videoForm.videoUrl ? 'Video uploaded' : 'Click to upload video'}</p></div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Title (required)</label>
              <input type="text" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="Add a title that describes your video" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
              <textarea value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} placeholder="Tell viewers about your video" rows={4} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
                <select value={videoForm.type} onChange={(e) => setVideoForm({ ...videoForm, type: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium">
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Collections</label>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-40 overflow-y-auto space-y-1">
                  {playlists.map(playlist => (
                    <label key={playlist.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                      <input type="checkbox" checked={videoForm.playlistIds.includes(playlist.id)} onChange={(e) => {
                        const ids = e.target.checked ? [...videoForm.playlistIds, playlist.id] : videoForm.playlistIds.filter((id: string) => id !== playlist.id);
                        setVideoForm({ ...videoForm, playlistIds: ids });
                      }} className="w-3.5 h-3.5 rounded border-gray-300" style={{ accentColor: zoneColor }} />
                      <span className="text-sm font-medium text-gray-700">{playlist.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setView('videos')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold transition-colors">CANCEL</button>
              <button onClick={onSaveVideo} disabled={isSubmitting || !videoForm.title || !videoForm.videoUrl} className="px-6 py-2 text-white rounded text-sm font-bold shadow-sm transition-all disabled:opacity-50" style={{ backgroundColor: zoneColor }}>{isSubmitting ? 'SAVING...' : selectedVideo ? 'SAVE' : 'PUBLISH'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'add-playlist' || view === 'edit-playlist') {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <button onClick={() => setView('playlists')} className="flex items-center gap-2 text-gray-400 mb-8 group transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Back to Playlists</span>
        </button>
        <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Playlist Name</label>
            <input type="text" value={playlistForm.name} onChange={(e) => setPlaylistForm({ ...playlistForm, name: e.target.value })} placeholder="e.g., Sunday Service Highlights" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea value={playlistForm.description} onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })} rows={4} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setView('playlists')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold">CANCEL</button>
            <button onClick={onSavePlaylist} disabled={isSubmitting || !playlistForm.name} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold shadow-sm transition-all disabled:opacity-50">{isSubmitting ? 'SAVING...' : selectedPlaylist ? 'SAVE' : 'CREATE'}</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'playlist-detail' && selectedPlaylist) {
    const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setView('playlists')} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-8 group transition-colors"><ArrowLeft className="w-5 h-5" /><span className="font-bold uppercase tracking-widest text-[11px]">Back to Playlists</span></button>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="relative aspect-video">
                  {getPlaylistThumb(selectedPlaylist) ? <img src={getPlaylistThumb(selectedPlaylist)} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><ListVideo className="w-12 h-12" /></div>}
                </div>
                <div className="p-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedPlaylist.name}</h1>
                  <p className="text-sm text-gray-500 mb-6">{selectedPlaylist.description || 'No description'}</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Manage Content</h3>
                  <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter videos..." className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none" /></div>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto scrollbar-hide">
                  {filteredVideos.map(video => {
                    const isIn = selectedPlaylist.videoIds.includes(video.id);
                    return (
                      <div key={video.id} onClick={() => onToggleVideoInPlaylist?.(video.id)} className={`p-2 rounded border transition-all cursor-pointer flex items-center gap-3`} style={{ borderColor: isIn ? zoneColor : '#F3F4F6', backgroundColor: isIn ? `${zoneColor}08` : '#F9FAFB99' }}>
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 transition-all ${isIn ? 'text-white' : 'bg-white text-gray-300 border'}`} style={{ backgroundColor: isIn ? zoneColor : undefined }}>{isIn ? <Check className="w-5 h-5" /> : <Plus className="w-4 h-4" />}</div>
                        <div className="w-14 aspect-video rounded overflow-hidden flex-shrink-0 border border-gray-200"><img src={video.thumbnail} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0"><h4 className={`text-[11px] font-bold truncate`} style={{ color: isIn ? darkenColor(zoneColor, 40) : '#374151' }}>{video.title}</h4></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'batch-upload') {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pt-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Batch Upload</h1><p className="text-sm text-gray-500">Review and publish your {batchFiles.length} uploaded videos</p></div>
          <div className="flex gap-3">
            <button onClick={() => onOpenCloudinary('video', true)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> ADD MORE</button>
            <button onClick={onPublishBatch} disabled={isSubmitting || batchFiles.length === 0} className="px-6 py-2 text-white rounded font-bold shadow-sm transition-all" style={{ backgroundColor: zoneColor }}>{isSubmitting ? 'PUBLISHING...' : `PUBLISH ALL (${batchFiles.length})`}</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batchFiles.map((file, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col group">
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <video src={file.url} className="w-full h-full object-cover" muted />
                <button onClick={() => setBatchFiles(batchFiles.filter((_: any, i: number) => i !== idx))} className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Video Title</label><input type="text" value={file.title} onChange={(e) => {
                const newFiles = [...batchFiles];
                newFiles[idx].title = e.target.value;
                setBatchFiles(newFiles);
              }} className="w-full mt-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded text-sm font-medium focus:outline-none" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'add-category' || view === 'edit-category') {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <button onClick={() => setView('categories')} className="flex items-center gap-2 text-gray-400 mb-8 group transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Back to Categories</span>
        </button>
        <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category Name</label>
            <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g., Music Videos" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={4} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setView('categories')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold">CANCEL</button>
            <button onClick={onSaveCategory} disabled={isSubmitting || !categoryForm.name} className="px-6 py-2 text-white rounded text-sm font-bold shadow-sm transition-all" style={{ backgroundColor: zoneColor }}>{isSubmitting ? 'SAVING...' : selectedCategory ? 'SAVE' : 'CREATE'}</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
