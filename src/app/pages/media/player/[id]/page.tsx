'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMedia } from '../../_context/MediaContext'
import {
  ChevronDown, ThumbsUp, ThumbsDown, Share2, Bell, BellOff,
  Plus, MoreVertical, Send, ArrowLeft, Trash2
} from 'lucide-react'
import { firebaseMediaService, MediaItem } from '../../_lib/firebase-media-service'
import CustomVideoPlayer from '../../_components/CustomVideoPlayer'
import { toggleLikeVideo, isVideoLiked } from '../../_lib/playlist-service'
import { mediaCommentService, MediaComment } from '../../_lib/media-comment-service'
import AddToPlaylistModal from '../../_components/AddToPlaylistModal'
import { NavigationManager } from '@/utils/navigation'

function PlayerContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const { incrementViews, saveWatchProgress, allMedia } = useMedia()

  const mediaId = params?.id as string
  const playlistId = searchParams?.get('playlist')
  const userId = user?.uid

  const [media, setMedia] = useState<MediaItem | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<MediaComment[]>([])
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    loadPageData()
  }, [mediaId])

  useEffect(() => {
    if (!mediaId) return
    const unsubscribe = mediaCommentService.subscribeToComments(mediaId, (data) => {
      setComments(data)
    })
    return () => unsubscribe()
  }, [mediaId])

  useEffect(() => {
    if (userId && mediaId) {
      checkUserStatus()
    }
  }, [userId, mediaId])

  useEffect(() => {
    if (media) {
      incrementViews(media.id)
      setLikeCount(media.likes || 0)
    }
  }, [media?.id])

  const loadPageData = async () => {
    setIsLoading(true)
    try {
      const mediaData = await firebaseMediaService.getMediaById(mediaId)
      setMedia(mediaData)

      const related = await firebaseMediaService.getRelatedMedia(mediaId, 10)
      setRelatedVideos(related)
    } catch (error) {
      console.error('Error loading media:', error)
    }
    setIsLoading(false)
  }


  const checkUserStatus = async () => {
    if (!userId) return
    try {
      const liked = await isVideoLiked(userId, mediaId)
      setIsLiked(liked)
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  const handleLike = async () => {
    if (!userId) {
      alert('Please sign in to like videos')
      return
    }
    try {
      const newState = await toggleLikeVideo(userId, mediaId, media?.thumbnail)
      setIsLiked(newState)
      setLikeCount(prev => newState ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: media?.title,
          url: window.location.href
        })
      } catch (err) {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied!')
    }
  }

  const handleAddComment = async (parentId?: string, parentName?: string) => {
    const text = parentId ? replyText : newComment
    if (!text.trim() || !userId) return

    const userName = profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`.trim()
      : profile?.display_name || user?.displayName || user?.email?.split('@')[0] || 'User'

    try {
      await mediaCommentService.addComment(
        mediaId,
        userId,
        userName,
        user?.email || '',
        text,
        parentId,
        parentName
      )
      if (parentId) {
        setReplyText('')
        setReplyTo(null)
      } else {
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    // Optimistic Update
    const originalComments = [...comments]
    setComments(prev => prev.filter(c => c.id !== commentId))

    try {
      await mediaCommentService.deleteComment(commentId)
    } catch (error) {
      console.error('Error deleting comment:', error)
      setComments(originalComments) // Rollback
      alert('Failed to delete comment. Please try again.')
    }
  }

  const handleToggleCommentLike = async (commentId: string) => {
    if (!userId) {
      alert('Please sign in to like comments')
      return
    }
    try {
      await mediaCommentService.toggleLike(commentId, userId)
    } catch (error) {
      console.error('Error toggling comment like:', error)
    }
  }

  const handleToggleCommentDislike = async (commentId: string) => {
    if (!userId) {
      alert('Please sign in to dislike comments')
      return
    }
    try {
      await mediaCommentService.toggleDislike(commentId, userId)
    } catch (error) {
      console.error('Error toggling comment dislike:', error)
    }
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeAgo = (date: any) => {
    try {
      if (!date) return ''
      const dateObj = date?.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date))
      const now = new Date()
      const diff = now.getTime() - dateObj.getTime()

      const seconds = Math.floor(diff / 1000)
      if (seconds < 60) return 'Just now'

      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes}m ago`

      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`

      const days = Math.floor(hours / 24)
      if (days < 30) return `${days}d ago`

      const months = Math.floor(days / 30)
      if (months < 12) return `${months}mo ago`

      return dateObj.toLocaleDateString()
    } catch {
      return ''
    }
  }

  if (isLoading || !media) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen overflow-y-auto bg-[#0f0f0f] text-white">
      {/* Back Button Overlay - Mobile Friendly */}
      <button
        onClick={() => NavigationManager.safeBack(router)}
        className="fixed top-4 left-4 z-[70] p-2 bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md transition-colors border border-white/10 group active:scale-95"
        title="Go Back"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      {/* Video Player Section */}
      <div className="relative bg-black shadow-2xl">
        <div className="max-w-[1400px] mx-auto w-full aspect-video">
          <CustomVideoPlayer
            url={media.youtubeUrl || media.videoUrl || ''}
            poster={media.thumbnail}
            isYouTube={!!media.youtubeUrl}
            onProgress={(progress) => {
              if (progress.played * 100 > 5 && progress.played * 100 < 95) {
                saveWatchProgress(mediaId, progress.played * 100)
              }
            }}
          />
        </div>
      </div>

      {/* Content Section - Responsive Wrapper */}
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        {/* Main Content Info */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h1 className="text-[18px] sm:text-xl font-bold leading-tight mt-1 mb-1">
            {media.title}
          </h1>

          {/* Views & Date */}
          <p className="text-[13px] sm:text-sm text-[#aaa] mb-4">
            {formatViews(media.views || 0)} views • {getTimeAgo(media.createdAt)}
          </p>

          {/* Channel Row */}
          <div className="flex items-center justify-between mb-4 bg-white/5 p-3 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-black text-xs sm:text-base flex-shrink-0 shadow-lg">
                {media.title.charAt(0).toUpperCase()}
              </div>

              {/* Channel Info */}
              <div>
                <p className="text-[13px] sm:text-[15px] font-bold">Official</p>
                <p className="text-[11px] sm:text-xs text-[#aaa]">Official Media</p>
              </div>
            </div>
          </div>

          {/* Action Buttons Row - Scrollable on mobile */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {/* Like/Dislike Pill */}
            <div className="flex items-center bg-[#272727] rounded-full h-9 flex-shrink-0">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 h-full hover:bg-white/10 rounded-l-full transition-colors ${isLiked ? 'text-white' : 'text-[#aaa]'
                  }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                <span className="text-xs sm:text-sm font-bold">{formatCount(likeCount)}</span>
              </button>
              <div className="w-px h-5 bg-white/10" />
              <button className="flex items-center px-4 h-full hover:bg-white/10 rounded-r-full transition-colors">
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 h-9 bg-[#272727] rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-bold">Share</span>
            </button>

            {/* Save to Playlist */}
            <button
              onClick={() => userId ? setShowPlaylistModal(true) : alert('Sign in to save to playlists')}
              className="flex items-center gap-2 px-4 h-9 bg-[#272727] rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-bold">Save</span>
            </button>

            {/* More */}
            <button className="w-9 h-9 flex items-center justify-center bg-[#272727] rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Description Card */}
          <div className="bg-[#272727] rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold">Description</span>
            </div>
            <p className={`text-sm text-gray-200 leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
              {media.description || 'No description available for this video.'}
            </p>
            {media.description && media.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm font-bold text-white mt-2 hover:underline"
              >
                {showFullDescription ? 'Show less' : 'Show more...'}
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold">Comments <span className="text-[#aaa] font-normal ml-1">{comments.length}</span></h3>
              <button className="text-sm font-bold text-blue-400">Sort by</button>
            </div>

            {/* Add Comment Input */}
            {userId && (
              <div className="flex gap-4 mb-8 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg">
                  {profile?.first_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder-[#aaa] focus:outline-none focus:border-white transition-all"
                    />
                    {newComment && (
                      <div className="flex justify-end gap-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <button
                          onClick={() => setNewComment('')}
                          className="px-4 h-9 text-sm font-bold hover:bg-white/5 rounded-full transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddComment()}
                          className="flex items-center gap-2 px-5 h-9 bg-blue-600 text-sm font-bold rounded-full hover:bg-blue-500 transition-all shadow-lg active:scale-95"
                        >
                          Comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="py-10 text-center text-[#aaa] italic text-sm bg-white/5 rounded-2xl">
                  No comments yet. Share your thoughts!
                </div>
              ) : (
                comments
                  .filter(c => c.parentId === null || c.parentId === undefined) // Main comments first
                  .map((comment) => (
                    <div key={comment.id} className="space-y-4">
                      <div className="flex gap-4 group">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs sm:text-sm flex-shrink-0 shadow-md">
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs sm:text-sm font-bold text-gray-200">{comment.userName}</span>
                            <span className="text-[10px] sm:text-xs text-[#aaa]">{getTimeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-100 leading-normal mb-2 whitespace-pre-wrap">{comment.content}</p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleToggleCommentLike(comment.id)}
                              className="flex items-center gap-1.5 text-[#aaa] hover:text-white transition-colors group/like"
                            >
                              <ThumbsUp className={`w-4 h-4 ${comment.likedBy?.includes(userId || '') ? 'fill-white text-white' : ''}`} />
                              <span className="text-xs font-bold">{comment.likes > 0 ? formatCount(comment.likes) : ''}</span>
                            </button>
                            <button
                              onClick={() => handleToggleCommentDislike(comment.id)}
                              className="flex items-center gap-1.5 text-[#aaa] hover:text-white transition-colors group/dislike"
                            >
                              <ThumbsDown className={`w-4 h-4 ${comment.dislikedBy?.includes(userId || '') ? 'fill-white text-white rotate-0' : ''}`} />
                              <span className="text-xs font-bold">{comment.dislikes > 0 ? formatCount(comment.dislikes) : ''}</span>
                            </button>
                            <button
                              onClick={() => setReplyTo(replyTo?.id === comment.id ? null : { id: comment.id, name: comment.userName })}
                              className="text-xs font-bold text-[#aaa] hover:text-white transition-colors"
                            >
                              Reply
                            </button>
                            {comment.userId === userId && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-[#aaa] hover:text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                                title="Delete comment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Reply Input Box */}
                          {replyTo?.id === comment.id && (
                            <div className="mt-4 flex gap-3 animate-in slide-in-from-left-2 duration-300">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                                {profile?.first_name?.[0].toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  autoFocus
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(comment.id, comment.userName)}
                                  placeholder={`Reply to ${comment.userName}...`}
                                  className="w-full bg-transparent border-b border-white/10 py-1.5 text-xs text-white placeholder-[#aaa] focus:outline-none focus:border-blue-500 transition-all"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <button onClick={() => setReplyTo(null)} className="px-3 py-1 text-[11px] font-bold hover:bg-white/5 rounded-full">Cancel</button>
                                  <button
                                    disabled={!replyText.trim()}
                                    onClick={() => handleAddComment(comment.id, comment.userName)}
                                    className="px-3 py-1 bg-blue-600 text-[11px] font-bold rounded-full hover:bg-blue-500 disabled:opacity-50"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Nested Replies */}
                          {comments.filter(c => c.parentId && String(c.parentId) === String(comment.id)).map(reply => (
                            <div key={reply.id} className="mt-4 ml-2 pl-4 border-l-2 border-white/5 flex gap-3 group/reply">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-700 flex items-center justify-center text-white font-black text-[10px] flex-shrink-0">
                                {reply.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[11px] sm:text-xs font-bold text-gray-300">{reply.userName}</span>
                                  <span className="text-[9px] text-[#aaa]">{getTimeAgo(reply.createdAt)}</span>
                                </div>
                                <p className="text-xs text-gray-200 leading-normal mb-1">{reply.content}</p>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => handleToggleCommentLike(reply.id)} className="flex items-center gap-1 text-[#aaa] hover:text-white transition-colors">
                                    <ThumbsUp className={`w-3 h-3 ${reply.likedBy?.includes(userId || '') ? 'fill-white text-white' : ''}`} />
                                    <span className="text-[10px]">{reply.likes > 0 ? formatCount(reply.likes) : ''}</span>
                                  </button>
                                  {reply.userId === userId && (
                                    <button onClick={() => handleDeleteComment(reply.id)} className="text-[#aaa] hover:text-red-500 transition-colors opacity-0 group-hover/reply:opacity-100">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Related Videos (Tablets & Desktops) */}
        <div className="lg:w-[400px] xl:w-[450px] flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold">Related videos</h3>
            <button className="text-xs font-bold text-[#aaa] hover:text-white">View all</button>
          </div>
          <div className="flex flex-col gap-4">
            {relatedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => router.push(`/pages/media/player/${video.id}`)}
                className="flex gap-3 cursor-pointer group active:scale-[0.98] transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-40 sm:w-48 aspect-video bg-[#272727] rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  <img
                    src={video.thumbnail || '/movie/default-hero.jpeg'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {video.duration && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black/90 text-white text-[10px] font-black px-1 py-0.5 rounded border border-white/5 shadow-lg">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <h4 className="text-[13px] sm:text-sm font-bold line-clamp-2 leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-[#aaa] font-medium mb-0.5">Official</p>
                  <p className="text-[10px] sm:text-xs text-[#aaa] font-medium truncate">
                    {formatViews(video.views || 0)} views • {getTimeAgo(video.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Playlist Modal */}
      {userId && (
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          videoId={mediaId}
          videoThumbnail={media.thumbnail}
          userId={userId}
        />
      )}
    </div>
  )
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <PlayerContent />
    </Suspense>
  )
}
