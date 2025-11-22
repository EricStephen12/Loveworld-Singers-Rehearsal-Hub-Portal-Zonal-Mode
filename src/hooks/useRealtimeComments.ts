"use client";

import { useState, useEffect, useCallback } from 'react';
import { FirebaseCommentService } from '@/lib/firebase-comment-service';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  type: 'comment' | 'solfa' | 'lyrics';
}

interface UseRealtimeCommentsProps {
  songId: string | null;
  enabled?: boolean;
}

export function useRealtimeComments({ songId, enabled = true }: UseRealtimeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments without any caching (real-time)
  const fetchComments = useCallback(async () => {
    if (!songId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching real-time comments for song:', songId);
      
      // Fetch directly from Firebase without cache
      const freshComments = await FirebaseCommentService.getCommentsBySongId(parseInt(songId));
      
      console.log('✅ Real-time comments fetched:', freshComments.length);
      setComments(freshComments as any);
    } catch (error) {
      console.error('❌ Error fetching real-time comments:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [songId, enabled]);

  // Real-time refresh every 1 second for comments
  useEffect(() => {
    if (!songId || !enabled) return;

    // Initial fetch
    fetchComments();

    // Set up real-time polling
    const interval = setInterval(() => {
      fetchComments();
    }, 1000); // 1 second for real-time updates

    return () => clearInterval(interval);
  }, [songId, enabled, fetchComments]);

  // Manual refresh function
  const refreshComments = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    refreshComments
  };
}
