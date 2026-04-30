"use client";

import React from 'react';
import { useMediaUpload } from '@/hooks/useMediaUpload';

// Modularized Components
import { MediaSidebar } from './media/MediaSidebar';
import { MediaContentList } from './media/MediaContentList';
import { MediaForms } from './media/MediaForms';
import { MediaModals } from './media/MediaModals';

export default function MediaUploadSection() {
  const mu = useMediaUpload();

  // Cloudinary Widget Helper
  const openCloudinaryWidget = (type: 'video' | 'image', isBatch: boolean = false) => {
    if (typeof window === 'undefined' || !(window as any).cloudinary) return;

    const options: any = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      sources: ['local', 'url'],
      multiple: isBatch,
      resourceType: type,
      clientAllowedFormats: type === 'video' ? ['mp4', 'mov', 'avi'] : ['jpg', 'png', 'jpeg', 'webp'],
      maxFileSize: type === 'video' ? 100000000 : 10000000, // 100MB for video, 10MB for image
    };

    const widget = (window as any).cloudinary.createUploadWidget(
      options,
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          if (isBatch) {
            mu.setBatchFiles((prev: any) => [...prev, {
              url: result.info.secure_url,
              title: result.info.original_filename || 'Untitled Video',
              public_id: result.info.public_id
            }]);
            mu.setView('batch-upload');
          } else if (type === 'video') {
            mu.setVideoForm({ ...mu.videoForm, videoUrl: result.info.secure_url, isYouTube: false });
          } else {
            mu.setVideoForm({ ...mu.videoForm, thumbnail: result.info.secure_url });
          }
        }
      }
    );
    widget.open();
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar Navigation */}
      <MediaSidebar
        view={mu.view}
        setView={mu.setView}
        isSidebarCollapsed={mu.isSidebarCollapsed}
        setIsSidebarCollapsed={mu.setIsSidebarCollapsed}
        isMobileMenuOpen={mu.isMobileMenuOpen}
        setIsMobileMenuOpen={mu.setIsMobileMenuOpen}
        zoneColor={mu.zoneColor}
        videoCount={mu.videos.length}
        playlistCount={mu.playlists.length}
        categoryCount={mu.categories.length}
      />

      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
        {/* Mobile Header (Studio Context) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => mu.setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Studio</h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: mu.zoneColor }}></div>
          </div>
        </div>

        {/* Main Content Area */}
        {['videos', 'playlists', 'categories'].includes(mu.view) ? (
          <MediaContentList
            type={mu.view as any}
            videos={mu.videos}
            playlists={mu.playlists}
            categories={mu.categories}
            isLoading={mu.isLoading}
            searchQuery={mu.searchQuery}
            setSearchQuery={mu.setSearchQuery}
            viewMode={mu.viewMode}
            setViewMode={mu.setViewMode}
            selectedVideoIds={mu.selectedVideoIds}
            setSelectedVideoIds={mu.setSelectedVideoIds}
            zoneColor={mu.zoneColor}
            onAdd={() => {
              if (mu.view === 'videos') { mu.resetVideoForm(); mu.setView('add-video'); }
              else if (mu.view === 'playlists') { mu.resetPlaylistForm(); mu.setView('add-playlist'); }
              else if (mu.view === 'categories') { mu.resetCategoryForm(); mu.setView('add-category'); }
            }}
            onEdit={(item) => {
              if (mu.view === 'videos') mu.handleEditVideo(item);
              else if (mu.view === 'playlists') { mu.setSelectedPlaylist(item); mu.setPlaylistForm(item); mu.setView('edit-playlist'); }
              else if (mu.view === 'categories') { mu.setSelectedCategory(item); mu.setCategoryForm(item); mu.setView('edit-category'); }
            }}
            onDelete={(confirm) => mu.setDeleteConfirm(confirm)}
            onBatchUpload={() => openCloudinaryWidget('video', true)}
            onPlaylistClick={(playlist) => { mu.setSelectedPlaylist(playlist); mu.setView('playlist-detail'); }}
            getPlaylistThumb={mu.getPlaylistThumb}
          />
        ) : (
          <MediaForms
            view={mu.view}
            setView={mu.setView}
            videoForm={mu.videoForm}
            setVideoForm={mu.setVideoForm}
            playlistForm={mu.playlistForm}
            setPlaylistForm={mu.setPlaylistForm}
            categoryForm={mu.categoryForm}
            setCategoryForm={mu.setCategoryForm}
            selectedVideo={mu.selectedVideo}
            selectedPlaylist={mu.selectedPlaylist}
            selectedCategory={mu.selectedCategory}
            categories={mu.categories}
            playlists={mu.playlists}
            videos={mu.videos}
            isSubmitting={mu.isSubmitting}
            zoneColor={mu.zoneColor}
            onSaveVideo={mu.handleSaveVideo}
            onSavePlaylist={mu.handleSavePlaylist}
            onSaveCategory={mu.handleSaveCategory}
            onVideoUrlChange={mu.handleVideoUrlChange}
            onOpenCloudinary={openCloudinaryWidget}
            onToggleVideoInPlaylist={mu.handleToggleVideoInPlaylist}
            getPlaylistThumb={mu.getPlaylistThumb}
            searchQuery={mu.searchQuery}
            setSearchQuery={mu.setSearchQuery}
            batchFiles={mu.batchFiles}
            setBatchFiles={mu.setBatchFiles}
            onPublishBatch={mu.handlePublishBatch}
          />
        )}

        {/* Modals & Notifications */}
        <MediaModals
          deleteConfirm={mu.deleteConfirm}
          onCloseDelete={() => mu.setDeleteConfirm(null)}
          onConfirmDelete={(id) => {
            if (mu.deleteConfirm?.type === 'video') mu.handleDeleteVideo(id);
            else if (mu.deleteConfirm?.type === 'playlist') mu.handleDeletePlaylist(id);
            else if (mu.deleteConfirm?.type === 'category') mu.handleDeleteCategory(id);
          }}
          toast={mu.toast}
          selectedVideoIds={mu.selectedVideoIds}
          onCancelSelection={() => { mu.setSelectedVideoIds([]); mu.setIsBulkPlaylistOpen(false); }}
          isBulkPlaylistOpen={mu.isBulkPlaylistOpen}
          setIsBulkPlaylistOpen={mu.setIsBulkPlaylistOpen}
          playlists={mu.playlists}
          onBulkAddToPlaylist={mu.handleBulkAddToPlaylist}
          onBulkDelete={mu.handleBulkDelete}
          zoneColor={mu.zoneColor}
        />
      </div>
    </div>
  );
}
