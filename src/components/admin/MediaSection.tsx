"use client";

import React from 'react';
import MediaManager from '../MediaManager';

interface MediaSectionProps {
  // Add any props that MediaManager needs
}

export default function MediaSection(props: MediaSectionProps) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <MediaManager />
    </div>
  );
}
