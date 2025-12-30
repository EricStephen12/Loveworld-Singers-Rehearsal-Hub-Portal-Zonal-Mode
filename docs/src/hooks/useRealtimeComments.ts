'use client'

import { useState, useEffect, useCallback } from 'react'

import { FirebaseCommentService } from '@/lib/firebase-comment-service'

interface Comment {
  id: string
  author: string
  content: string
  date: string
  type: 'comment' | 'solfa' | 'lyrics'
}

interface UseRealtimeCommentsProps {
  songId: string | null
  enabled?: boolean
}

export function useRealtimeComments({ songId, enabled = true }: UseRealtimeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!songId || !enabled) return

    setLoading(true)
    setError(null)

    try {
      const freshComments = await FirebaseCommentService.getCommentsBySongId(parseInt(songId))
      setComments(freshComments as any)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }, [songId, enabled])

  useEffect(() => {
    if (!songId || !enabled) return

    fetchComments()
    const interval = setInterval(fetchComments, 1000)
    return () => clearInterval(interval)
  }, [songId, enabled, fetchComments])

  return {
    comments,
    loading,
    error,
    refreshComments: fetchComments
  }
}
