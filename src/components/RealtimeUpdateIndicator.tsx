'use client';

import { useState, useEffect } from 'react';
import { useUltraFastData } from '@/contexts/UltraFastDataContext';

export default function RealtimeUpdateIndicator() {
  const { songs, praiseNights, categories, media } = useUltraFastData();
  const [showIndicator, setShowIndicator] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Show indicator when data changes
    setShowIndicator(true);
    setLastUpdate(new Date());

    // Hide indicator after 2 seconds
    const timer = setTimeout(() => {
      setShowIndicator(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [songs, praiseNights, categories, media]);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
      <span className="text-sm font-medium">Live Update</span>
      <span className="text-xs opacity-75">
        {lastUpdate.toLocaleTimeString()}
      </span>
    </div>
  );
}
