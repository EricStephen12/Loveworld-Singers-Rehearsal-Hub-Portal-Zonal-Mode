"use client";

import React from 'react';
import { Film, ListVideo, Tag, Youtube, ChevronRight, ArrowLeft, Menu } from 'lucide-react';
import { MediaView } from '@/hooks/useMediaUpload';

interface MediaSidebarProps {
  view: MediaView;
  setView: (view: MediaView) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  zoneColor: string;
  videoCount: number;
  playlistCount: number;
  categoryCount: number;
}

export const MediaSidebar: React.FC<MediaSidebarProps> = ({
  view,
  setView,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  zoneColor,
  videoCount,
  playlistCount,
  categoryCount
}) => {
  const items = [
    { id: 'videos', label: 'Content', icon: Film, count: videoCount },
    { id: 'playlists', label: 'Playlists', icon: ListVideo, count: playlistCount },
    { id: 'categories', label: 'Categories', icon: Tag, count: categoryCount },
  ];

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-[100] lg:sticky lg:top-0 h-screen transition-all duration-300
        ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        ${isMobileMenuOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-gray-100 flex flex-col group
      `}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full hidden lg:flex items-center justify-center shadow-sm transform transition-all duration-200 z-[110] hover:border-gray-300"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ArrowLeft className="w-3 h-3 text-gray-500" />}
        </button>

        <div className="py-8 h-full flex flex-col overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-3 mb-10 px-6 min-h-[40px]">
            <div
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: zoneColor }}
            >
              <Youtube className="w-5 h-5 text-white" />
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <h1 className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap overflow-hidden">
                Studio
              </h1>
            )}
          </div>

          <nav className="space-y-1 flex-1">
            {items.map((item) => {
              const isActive = view === item.id || (view === 'playlist-detail' && item.id === 'playlists');
              const isCollapsed = isSidebarCollapsed && !isMobileMenuOpen;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id as MediaView);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-6 py-3 transition-colors relative
                    ${isActive
                      ? 'font-bold'
                      : 'text-gray-600 hover:bg-gray-50'}
                  `}
                  style={isActive ? {
                    backgroundColor: `${zoneColor}08`,
                    color: zoneColor,
                    borderRight: `3px solid ${zoneColor}`
                  } : {}}
                >
                  <item.icon
                    className="w-5 h-5 flex-shrink-0"
                    style={isActive ? { color: zoneColor } : { color: '#64748b' }}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">
                        {item.label}
                      </span>
                      <span
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        style={isActive ? { color: zoneColor } : { color: '#94a3b8' }}
                      >
                        {item.count}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};
