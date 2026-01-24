"use client";

import React, { useEffect } from 'react';
import { useZone } from '@/hooks/useZone';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';

export function ActivityLogger({ children }: { children?: React.ReactNode }) {
  const { currentZone } = useZone();

  useEffect(() => {
    const handleToast = async (event: CustomEvent) => {
      const { message, type, zoneName, userName, action, section, itemName } = event.detail;
      
      if (!currentZone?.id) return;

      try {
        // Store any toast that has user/zone info
        if (userName || zoneName) {
          await addDoc(collection(db, 'activity_logs'), {
            zoneId: currentZone.id,
            zoneName: zoneName || currentZone.name,
            userName: userName || 'Unknown User',
            message,
            type,
            action: action || 'unknown',
            section: section || 'unknown',
            itemName: itemName || null,
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString()
          });
          
        }
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    };

    window.addEventListener('showToast', handleToast as unknown as EventListener);
    return () => window.removeEventListener('showToast', handleToast as unknown as EventListener);
  }, [currentZone]);

  return <>{children}</>;
}

export default ActivityLogger;
