// Firebase Comment Service for Loveworld Praise App
// Handles comments for songs and pages

import { FirebaseDatabaseService } from './firebase-database'
import type { Comment } from '../types/supabase'

export class FirebaseCommentService {
  // Create a new comment
  static async createComment(commentData: {
    song_id: number
    user_id: string
    user_name: string
    content: string
    parent_id?: number
  }): Promise<Comment | null> {
    try {
      const comment = {
        id: Date.now(), // Simple ID generation
        song_id: commentData.song_id,
        user_id: commentData.user_id,
        user_name: commentData.user_name,
        content: commentData.content,
        parent_id: commentData.parent_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
        is_edited: false
      }

      await FirebaseDatabaseService.createDocument('comments', comment.id.toString(), comment)
      return comment as unknown as Comment
    } catch (error) {
      console.error('Error creating comment:', error)
      return null
    }
  }

  // Get comments for a song
  static async getCommentsBySongId(songId: number): Promise<Comment[]> {
    try {
      const comments = await FirebaseDatabaseService.getCollection('comments')
      return comments.filter((comment: any) => comment.song_id === songId)
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) as unknown as Comment[]
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  // Update a comment
  static async updateComment(commentId: number, updates: Partial<Comment>): Promise<boolean> {
    try {
      await FirebaseDatabaseService.updateDocument('comments', commentId.toString(), {
        ...updates,
        updated_at: new Date().toISOString(),
        is_edited: true
      })
      return true
    } catch (error) {
      console.error('Error updating comment:', error)
      return false
    }
  }

  // Delete a comment
  static async deleteComment(commentId: number): Promise<boolean> {
    try {
      await FirebaseDatabaseService.deleteDocument('comments', commentId.toString())
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }

  // Like a comment
  static async likeComment(commentId: number, userId: string): Promise<boolean> {
    try {
      const comment = await FirebaseDatabaseService.getDocument('comments', commentId.toString())
      if (!comment) return false

      const commentData = comment as any
      const likedBy = commentData.liked_by || []
      if (likedBy.includes(userId)) {
        // Unlike
        const updatedLikedBy = likedBy.filter((id: any) => id !== userId)
        await FirebaseDatabaseService.updateDocument('comments', commentId.toString(), {
          likes: commentData.likes - 1,
          liked_by: updatedLikedBy,
          updated_at: new Date().toISOString()
        })
      } else {
        // Like
        await FirebaseDatabaseService.updateDocument('comments', commentId.toString(), {
          likes: commentData.likes + 1,
          liked_by: [...likedBy, userId],
          updated_at: new Date().toISOString()
        })
      }
      return true
    } catch (error) {
      console.error('Error liking comment:', error)
      return false
    }
  }
}



