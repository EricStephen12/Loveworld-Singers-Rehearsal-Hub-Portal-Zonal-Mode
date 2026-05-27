"use client";

import React from 'react';
import {
  Film, Cloud, Plus, Search, List, Grid3x3,
  Edit2, Trash2, ListVideo, Tag, Check, Youtube,
  Tv, Users, ArrowLeft, Video, Settings
} from 'lucide-react';
import { MediaVideo } from '@/lib/media-videos-service';
import { AdminPlaylist } from '@/lib/admin-playlist-service';
import { MediaCategory } from '@/lib/media-category-service';
import { Channel } from '@/lib/channel-service';
import { getCloudinaryThumbnailUrl } from '@/utils/cloudinary';
import CustomLoader from '@/components/CustomLoader';

interface MediaContentListProps {
  type: 'channels' | 'channel-detail' | 'videos' | 'playlists' | 'categories';
  videos: MediaVideo[];
  playlists: AdminPlaylist[];
  categories: MediaCategory[];
  channels: Channel[];
  selectedChannel: Channel | null;
  setSelectedChannel: (channel: Channel | null) => void;
  setView: (view: any) => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  selectedVideoIds: string[];
  setSelectedVideoIds: (ids: string[]) => void;
  zoneColor: string;
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onBatchUpload?: () => void;
  onPlaylistClick?: (playlist: AdminPlaylist) => void;
  getPlaylistThumb: (p: AdminPlaylist) => string;
  isHQAdmin?: boolean;
}

export const MediaContentList: React.FC<MediaContentListProps> = ({
  type,
  videos,
  playlists,
  categories,
  channels,
  selectedChannel,
  setSelectedChannel,
  setView,
  isLoading,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  selectedVideoIds,
  setSelectedVideoIds,
  zoneColor,
  onAdd,
  onEdit,
  onDelete,
  onBatchUpload,
  onPlaylistClick,
  getPlaylistThumb,
  isHQAdmin
}) => {
  const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render Channels View
  if (type === 'channels') {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Channels</h1>
            <p className="text-xs md:text-sm text-gray-500">Manage your YouTube-style broadcasting channels</p>
          </div>
          {isHQAdmin && (
            <button
              onClick={onAdd}
              className="w-full sm:w-auto px-4 py-2 hover:opacity-90 text-white rounded font-medium transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
              style={{ backgroundColor: zoneColor }}
            >
              <Plus className="w-5 h-5" /> NEW CHANNEL
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-1 rounded-lg mb-6 shadow-sm">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels..."
              className="w-full pl-10 pr-4 py-2 bg-transparent rounded-lg focus:outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center"><CustomLoader message="Loading channels..." /></div>
        ) : filteredChannels.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Tv className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No channels found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChannels.map(channel => (
              <div
                key={channel.id}
                onClick={() => {
                  setSelectedChannel(channel);
                  setView('channel-detail');
                }}
                className="group bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden border-b border-gray-100">
                  {channel.thumbnail ? (
                    <img src={channel.thumbnail} alt={channel.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-400">
                      <Tv className="w-12 h-12" />
                    </div>
                  )}
                  {channel.isHQOnly && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded shadow-sm">HQ ONLY</span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 mb-1">{channel.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{channel.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[11px] font-semibold text-gray-400">
                    <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> {channel.videoCount || 0} Videos</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {channel.subscriberCount || 0} Subs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Channel Detail View
  if (type === 'channel-detail' && selectedChannel) {
    const channelVideos = videos.filter(v => v.channelId === selectedChannel.id);
    const filteredChanVideos = channelVideos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <button
          onClick={() => {
            setSelectedChannel(null);
            setView('channels');
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-purple-600 mb-6 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Back to Channels</span>
        </button>

        {/* Channel Banner / Header Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-150 shadow-inner">
            {selectedChannel.thumbnail ? (
              <img src={selectedChannel.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-400"><Tv className="w-12 h-12" /></div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{selectedChannel.name}</h1>
              {selectedChannel.isHQOnly && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded">HQ ONLY</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4 max-w-xl leading-relaxed">{selectedChannel.description || 'No description provided for this channel.'}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-gray-400">
              <span className="flex items-center gap-1.5"><Video className="w-4 h-4 text-purple-500" /> {selectedChannel.videoCount || 0} Videos</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-purple-500" /> {selectedChannel.subscriberCount || 0} Subscribers</span>
            </div>
          </div>
          <div className="flex gap-2 self-stretch md:self-auto flex-col sm:flex-row md:flex-col justify-center">
            <button
              onClick={() => onEdit(selectedChannel)}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" /> EDIT PROFILE
            </button>
            <button
              onClick={() => onDelete({ type: 'channel', id: selectedChannel.id, name: selectedChannel.name })}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> DELETE CHANNEL
            </button>
          </div>
        </div>

        {/* Video Upload Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Videos in Channel</h2>
            <p className="text-xs text-gray-500">Add or manage uploads for this channel</p>
          </div>
          <button
            onClick={onAdd}
            className="w-full sm:w-auto px-4 py-2 hover:opacity-90 text-white rounded font-medium transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            style={{ backgroundColor: zoneColor }}
          >
            <Plus className="w-5 h-5" /> POST VIDEO
          </button>
        </div>

        {/* Channel Video Search / List */}
        <div className="bg-white border border-gray-200 p-1 rounded-lg mb-6 shadow-sm">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos in this channel..."
              className="w-full pl-10 pr-4 py-2 bg-transparent rounded-lg focus:outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center"><CustomLoader message="Loading videos..." /></div>
        ) : filteredChanVideos.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No videos in this channel yet</h3>
            <p className="text-xs text-gray-400 mt-1">Click "Post Video" to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[60px_1fr_60px] md:grid-cols-[100px_1fr_100px_100px_60px] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div>Video</div>
              <div>Title</div>
              <div className="hidden md:block">Visibility</div>
              <div className="hidden md:block">Date</div>
              <div className="text-right">Actions</div>
            </div>
            {filteredChanVideos.map(video => (
              <div
                key={video.id}
                className="grid grid-cols-[60px_1fr_60px] md:grid-cols-[100px_1fr_100px_100px_60px] gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 items-center"
              >
                <div className="relative aspect-video rounded overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={video.thumbnail || getCloudinaryThumbnailUrl(video.videoUrl || '')}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/movie/default-hero.jpeg'; }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{video.title}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{video.type}</div>
                </div>
                <div className="hidden md:block">
                  <span className="px-2 py-0.5 text-[8px] font-bold uppercase rounded border bg-purple-50 text-purple-600 border-purple-100">Public</span>
                </div>
                <div className="hidden md:block text-[10px] text-gray-400">{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}</div>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEdit(video)} className="p-2 hover:bg-gray-100 text-gray-400 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete({ type: 'video', id: video.id, name: video.title })} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Videos View
  if (type === 'videos') {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Content</h1>
            <p className="text-xs md:text-sm text-gray-500">Manage all uploaded videos across channels and collections</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onBatchUpload}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded font-medium transition-all flex items-center justify-center gap-2 shadow-sm text-xs md:text-sm"
            >
              <Cloud className="w-4 h-4 md:w-5 md:h-5" /> <span className="whitespace-nowrap">UPLOAD BATCH</span>
            </button>
            <button
              onClick={onAdd}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 hover:opacity-90 text-white rounded font-medium transition-all flex items-center justify-center gap-2 shadow-sm text-xs md:text-sm"
              style={{ backgroundColor: zoneColor }}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" /> <span className="whitespace-nowrap">CREATE</span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-1 rounded-lg mb-6 shadow-sm flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors"
              style={{ color: searchQuery ? zoneColor : undefined }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or description..."
              className="w-full pl-10 pr-4 py-2 bg-transparent rounded-lg focus:outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-1 bg-gray-50 rounded p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-all ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              style={viewMode === 'table' ? { color: zoneColor } : {}}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              style={viewMode === 'grid' ? { color: zoneColor } : {}}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center"><CustomLoader message="Loading..." /></div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20 bg-white/30 rounded-[40px] border-2 border-dashed border-slate-200">
            <Film className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No videos found</h3>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[40px_60px_1fr_60px] md:grid-cols-[40px_100px_1fr_100px_100px_60px] lg:grid-cols-[40px_100px_1fr_120px_100px_100px_100px_60px] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVideoIds.length === filteredVideos.length && filteredVideos.length > 0}
                  onChange={(e) => setSelectedVideoIds(e.target.checked ? filteredVideos.map(v => v.id) : [])}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-offset-0"
                  style={{ accentColor: zoneColor }}
                />
              </div>
              <div>Video</div>
              <div>Title</div>
              <div className="hidden lg:block">Channel</div>
              <div className="hidden md:block">Visibility</div>
              <div className="hidden lg:block">Collections</div>
              <div className="hidden md:block">Date</div>
              <div className="text-right">Actions</div>
            </div>
            {filteredVideos.map(video => {
              const isSelected = selectedVideoIds.includes(video.id);
              const videoPlaylists = playlists.filter(p => p.videoIds.includes(video.id));
              return (
                <div
                  key={video.id}
                  className={`grid grid-cols-[40px_60px_1fr_60px] md:grid-cols-[40px_100px_1fr_100px_100px_60px] lg:grid-cols-[40px_100px_1fr_120px_100px_100px_100px_60px] gap-3 px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 items-center`}
                  style={isSelected ? { backgroundColor: `${zoneColor}08` } : {}}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        setSelectedVideoIds(e.target.checked ? [...selectedVideoIds, video.id] : selectedVideoIds.filter(id => id !== video.id));
                      }}
                      className="w-4 h-4 rounded border-gray-300 focus:ring-offset-0"
                      style={{ accentColor: zoneColor }}
                    />
                  </div>
                  <div className="relative aspect-video rounded overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={video.thumbnail || getCloudinaryThumbnailUrl(video.videoUrl || '')}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/movie/default-hero.jpeg'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{video.title}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{video.type}</div>
                  </div>
                  <div className="hidden lg:block text-xs font-semibold text-purple-700 truncate">{video.channelName || 'No Channel'}</div>
                  <div className="hidden md:block">
                    <span className="px-2 py-0.5 text-[8px] font-bold uppercase rounded border" style={{ backgroundColor: `${zoneColor}10`, color: zoneColor, borderColor: `${zoneColor}20` }}>Public</span>
                  </div>
                  <div className="hidden lg:block text-[10px] font-medium text-gray-500">{videoPlaylists.length > 0 ? `${videoPlaylists.length} Collections` : '—'}</div>
                  <div className="hidden md:block text-[10px] text-gray-400">{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}</div>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(video)} className="p-2 hover:bg-gray-100 text-gray-400 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete({ type: 'video', id: video.id, name: video.title })} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredVideos.map(video => {
              const isSelected = selectedVideoIds.includes(video.id);
              return (
                <div
                  key={video.id}
                  className={`group bg-white rounded-lg border transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md ${isSelected ? 'ring-2 border-transparent' : 'border-gray-200'}`}
                  style={isSelected ? { '--tw-ring-color': zoneColor, borderColor: zoneColor } as any : {}}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail || getCloudinaryThumbnailUrl(video.videoUrl || '')}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/movie/default-hero.jpeg'; }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVideoIds(isSelected ? selectedVideoIds.filter(id => id !== video.id) : [...selectedVideoIds, video.id]);
                      }}
                      className={`absolute top-2 left-2 z-10 w-6 h-6 rounded border flex items-center justify-center transition-all duration-200 ${isSelected ? 'shadow-sm' : 'bg-black/20 border-white/40 opacity-0 group-hover:opacity-100'}`}
                      style={isSelected ? { backgroundColor: zoneColor, borderColor: zoneColor } : {}}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                    {video.isYouTube && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 text-white text-[9px] font-bold rounded flex items-center gap-1 shadow-sm" style={{ backgroundColor: zoneColor }}>
                        <Youtube className="w-3 h-3" /> YOUTUBE
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-bold uppercase tracking-wider rounded border border-gray-200">{video.type}</span>
                      {video.channelName && (
                        <span className="text-[10px] font-bold text-purple-600 truncate max-w-[100px]">{video.channelName}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-4">{video.title}</h3>
                    <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => onEdit(video)} className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-2"><Edit2 className="w-3 h-3" /> DETAILS</button>
                      <button onClick={() => onDelete({ type: 'video', id: video.id, name: video.title })} className="w-8 h-8 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded flex items-center justify-center transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (type === 'playlists') {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Playlists</h1>
            <p className="text-xs md:text-sm text-gray-500">Group your videos into theme-based collections</p>
          </div>
          <button
            onClick={onAdd}
            className="w-full sm:w-auto px-4 py-2 hover:opacity-90 text-white rounded font-medium transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            style={{ backgroundColor: zoneColor }}
          >
            <Plus className="w-5 h-5" /> NEW PLAYLIST
          </button>
        </div>

        <div className="bg-white border border-gray-200 p-1 rounded-lg mb-6 shadow-sm flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playlists..."
              className="w-full pl-10 pr-4 py-2 bg-transparent rounded-lg focus:outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center"><CustomLoader message="Loading playlists..." /></div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <ListVideo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No playlists found</h3>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[80px_1fr_60px] md:grid-cols-[100px_1fr_100px_120px_80px] lg:grid-cols-[100px_1fr_100px_100px_120px_80px] gap-4 px-4 md:px-6 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div>Playlist</div>
              <div>Title</div>
              <div className="hidden md:block">Visibility</div>
              <div className="hidden lg:block">Videos</div>
              <div className="hidden md:block">Last updated</div>
              <div className="text-right">Actions</div>
            </div>
            {filteredPlaylists.map(playlist => {
              const thumb = getPlaylistThumb(playlist);
              return (
                <div
                  key={playlist.id}
                  onClick={() => onPlaylistClick?.(playlist)}
                  className="grid grid-cols-[80px_1fr_60px] md:grid-cols-[100px_1fr_100px_120px_80px] lg:grid-cols-[100px_1fr_100px_100px_120px_80px] gap-4 px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 items-center cursor-pointer group"
                >
                  <div className="relative aspect-video rounded overflow-hidden border border-gray-200 bg-gray-100">
                    {thumb ? <img src={thumb} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ListVideo className="w-6 h-6" /></div>}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{playlist.name}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">{playlist.description || 'No description'}</div>
                  </div>
                  <div className="hidden md:block">
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded border ${playlist.isPublic ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{playlist.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="hidden lg:block text-[11px] font-medium text-gray-600">{playlist.videoIds.length} video{playlist.videoIds.length !== 1 ? 's' : ''}</div>
                  <div className="hidden md:block text-[10px] text-gray-400">{playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : 'N/A'}</div>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(playlist); }} className="p-2 hover:bg-gray-100 text-gray-400 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete({ type: 'playlist', id: playlist.id, name: playlist.name }); }} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (type === 'categories') {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-xs md:text-sm text-gray-500">Define labels for organizing your content</p>
          </div>
          <button
            onClick={onAdd}
            className="w-full sm:w-auto px-4 py-2 hover:opacity-90 text-white rounded font-medium transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            style={{ backgroundColor: zoneColor }}
          >
            <Plus className="w-5 h-5" /> NEW CATEGORY
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center"><CustomLoader message="Loading categories..." /></div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No categories found</h3>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[1fr_200px_80px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div>Category Name</div>
              <div>Slug</div>
              <div className="text-right">Actions</div>
            </div>
            {categories.map(category => (
              <div key={category.id} className="grid grid-cols-[1fr_200px_80px] gap-4 px-6 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 truncate">{category.name}</div>
                    <div className="text-[10px] text-gray-400 truncate">{category.description || 'No description'}</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{category.slug}</div>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEdit(category)} className="p-2 hover:bg-gray-100 text-gray-400 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete({ type: 'category', id: category.id, name: category.name })} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
