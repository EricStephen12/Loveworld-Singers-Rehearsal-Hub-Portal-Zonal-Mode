// Test component to verify Supabase integration
"use client";

import React from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';

export default function SupabaseTest() {
  const { pages, loading, error } = useSupabaseData();

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-600 font-medium">Loading Supabase data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-red-600 font-medium">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        <span className="text-green-600 font-medium">✅ Supabase Connected!</span>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-green-700">
          <strong>Pages loaded:</strong> {pages.length}
        </p>
        <div className="text-sm text-green-700">
          <strong>Pages:</strong>
          <ul className="ml-4 mt-1 space-y-1">
            {pages.map(page => (
              <li key={page.id} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {page.name} ({page.songs.length} songs)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

