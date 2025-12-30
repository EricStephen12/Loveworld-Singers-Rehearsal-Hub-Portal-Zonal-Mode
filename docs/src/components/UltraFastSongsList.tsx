'use client';

import { useUltraFastSupabase } from '@/hooks/useUltraFastSupabase';
import { useState } from 'react';

export default function UltraFastSongsList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ultra-fast Supabase hook with real-time updates
  const {
    data: songs,
    loading,
    error,
    isRealtime,
    refresh,
    optimisticUpdate,
  } = useUltraFastSupabase({
    table: 'songs',
    select: '*, praise_nights(*), categories(*)',
    filters: searchTerm ? { title: `%${searchTerm}%` } : {},
    orderBy: { column: 'created_at', ascending: false },
    enableRealtime: true,
    cacheTime: 10000, // 10 seconds cache
  });

  // Optimistic delete function
  const handleDelete = async (songId: string) => {
    // Optimistically remove from UI immediately
    optimisticUpdate([{ id: songId }], 'delete');
    
    try {
      // For now, just refresh to get correct data
      // In a real implementation, you would call a delete API here
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
      // Refresh to get correct data
      refresh();
    }
  };

  if (loading && !songs.length) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error}
        <button 
          onClick={refresh}
          className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time indicator */}
      {isRealtime && (
        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping mr-2"></div>
          Live updates active
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Songs list */}
      <div className="space-y-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{song.title}</h3>
                <p className="text-sm text-gray-600">
                  {song.praise_nights?.name} • {song.categories?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(song.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDelete(song.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!loading && songs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No songs found matching your search.' : 'No songs available.'}
        </div>
      )}

      {/* Refresh button */}
      <div className="text-center">
        <button
          onClick={refresh}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh Songs
        </button>
      </div>
    </div>
  );
}
