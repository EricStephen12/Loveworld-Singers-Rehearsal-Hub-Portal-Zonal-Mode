'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMedia } from '../../_context/MediaContext'
import { 
  ArrowLeft, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, 
  Send, MessageCircle, Clock, Play, ListPlus
} from 'lucide-react'
import { firebaseMediaService, MediaItem } from '../../_lib'
import { isYouTubeUrl } from '@/utils/youtube'
import CustomVideoPlayer from '../../_components/CustomVideoPlayer'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { toggleLikeVideo, toggleWatchLater, isVideoLiked, isInWatchLater } from '../../_lib/playlist-service'
import AddToPlaylistModal from '../../_components/AddToPlaylistModal'

interface MediaComment {
  id: string
  mediaId: string
  userId: string
  userName: string
  content: string
  likes: number
  likedBy: string[]
  createdAt: Date
}

export default function PlayerPage() {
  const router = useRouter()
  const params = useParams()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { incrementViews, saveWatchProgress } = useMedia()
  
  // Get userId from user or cached profile (like calendar does)
  const userId = user?.uid || profile?.id
  
  const [media, setMedia] = useState<MediaItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isWatchLater, setIsWatchLater] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  
  // Comments
  const [comments, setComments] = useState<MediaComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(true)

  // Related videos
  const [relatedVideos, setRelatedVideos] = useState<MediaItem[]>([])

  const mediaId = params?.id as string

  useEffect(() => {
    loadMedia()
    loadComments()
    loadRelatedVideos()
  }, [mediaId])
  
  // Check user status when userId becomes available
  useEffect(() => {
    if (userId) {
      checkUserStatus(userId)
    }
  }, [userId, mediaId])

  useEffect(() => {
    if (media) {
      incrementViews(media.id)
      // Set initial like count from media data
      setLikeCount(media.likes || 0)
    }
  }, [media])

  const checkUserStatus = async (uid: string) => {
    try {
      const [liked, watchLater] = await Promise.all([
        isVideoLiked(uid, mediaId),
        isInWatchLater(uid, mediaId)
      ])
      setIsLiked(liked)
      setIsWatchLater(watchLater)
      
      // If user has liked but media.likes is 0, set to at least 1
      if (liked && (media?.likes || 0) === 0) {
        setLikeCount(1)
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    }
  }

  const loadMedia = async () => {
    setIsLoading(true)
    try {
      const mediaData = await firebaseMediaService.getMediaById(mediaId)
      setMedia(mediaData)
    } catch (e) {}
    finally { setIsLoading(false) }
  }

  const loadComments = async () => {
    setCommentsLoading(true)
    try {
      const data = await FirebaseDatabaseService.getCollectionWhere('media_comments', 'mediaId', '==', mediaId)
      const sorted = data
        .map((c: any) => ({
          ...c,
          createdAt: c.createdAt?.toDate?.() || new Date(c.createdAt),
          likedBy: c.likedBy || []
        }))
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
      setComments(sorted)
    } catch (e) {}
    finally { setCommentsLoading(false) }
  }

  const loadRelatedVideos = async () => {
    try {
      const all = await firebaseMediaService.getAllMedia(10)
      setRelatedVideos(all.filter(v => v.id !== mediaId).slice(0, 5))
    } catch (e) {}
  }

  const handleProgress = (progress: { played: number; playedSeconds: number }) => {
    if (Math.floor(progress.playedSeconds) % 10 === 0) {
      saveWatchProgress(mediaId, progress.played * 100)
    }
  }

  // State for auth prompt
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const showAuthRequired = () => {
    setShowAuthPrompt(true)
    setTimeout(() => setShowAuthPrompt(false), 3000)
  }

  const handleLike = async () => {
    if (!userId) {
      showAuthRequired()
      return
    }
    try {
      console.log('👍 Liking video:', mediaId, 'User:', userId)
      const newLiked = await toggleLikeVideo(userId, mediaId, media?.thumbnail)
      console.log('👍 Like result:', newLiked)
      setIsLiked(newLiked)
      setIsDisliked(false)
      // Ensure like count never goes below 0
      setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1))
    } catch (error) {
      console.error('❌ Like error:', error)
    }
  }

  const handleDislike = async () => {
    if (!userId) {
      showAuthRequired()
      return
    }
    setIsDisliked(!isDisliked)
    if (isLiked) { 
      setIsLiked(false)
      // Ensure like count never goes below 0
      setLikeCount(prev => Math.max(0, prev - 1))
      try {
        await toggleLikeVideo(userId, mediaId, media?.thumbnail)
      } catch (error) {
        console.error('❌ Unlike error:', error)
      }
    }
  }

  const handleWatchLater = async () => {
    if (!userId) {
      showAuthRequired()
      return
    }
    try {
      console.log('⏰ Watch later:', mediaId, 'User:', userId)
      const newWatchLater = await toggleWatchLater(userId, mediaId, media?.thumbnail)
      console.log('⏰ Watch later result:', newWatchLater)
      setIsWatchLater(newWatchLater)
    } catch (error) {
      console.error('❌ Watch later error:', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userId || !profile) return
    setIsSubmitting(true)
    try {
      const comment = {
        mediaId,
        userId: userId,
        userName: profile.first_name || 'User',
        content: newComment.trim(),
        likes: 0,
        likedBy: [],
        createdAt: new Date()
      }
      const docId = `comment_${Date.now()}`
      await FirebaseDatabaseService.createDocument('media_comments', docId, comment)
      setComments(prev => [{ ...comment, id: docId }, ...prev])
      setNewComment('')
    } catch (e) {
      console.error('Error submitting comment:', e)
    }
    finally { setIsSubmitting(false) }
  }

  const handleLikeComment = (commentId: string) => {
    if (!userId) return
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const liked = c.likedBy.includes(userId)
        return {
          ...c,
          likes: liked ? c.likes - 1 : c.likes + 1,
          likedBy: liked ? c.likedBy.filter(id => id !== userId) : [...c.likedBy, userId]
        }
      }
      return c
    }))
  }

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (days > 30) return `${Math.floor(days/30)}mo ago`
    if (days > 0) return `${days}d ago`
    if (hrs > 0) return `${hrs}h ago`
    if (mins > 0) return `${mins}m ago`
    return 'Just now'
  }

  const formatViews = (n: number) => {
    if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n/1000).toFixed(1)}K`
    return n.toString()
  }

  // Get playback URL - handle null values from Firestore
  // Check youtubeUrl first, then videoUrl - exclude null, undefined, and string 'null'
  const getValidUrl = (url: string | null | undefined): string | null => {
    if (!url || url === 'null' || url === 'undefined') return null
    return url
  }
  
  const playbackUrl = getValidUrl(media?.youtubeUrl) || getValidUrl(media?.videoUrl) || ''
  const isYouTubeVideo = media?.isYouTube || (playbackUrl && isYouTubeUrl(playbackUrl))
  
  // Debug log
  console.log('Media data:', { 
    id: media?.id, 
    youtubeUrl: media?.youtubeUrl, 
    videoUrl: media?.videoUrl,
    isYouTube: media?.isYouTube,
    playbackUrl 
  })

  // No auth redirect - video player is accessible to everyone

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg">Video not found</p>
        <button onClick={() => router.back()} className="px-5 py-2 bg-red-600 text-white rounded-lg">Go Back</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Auth Prompt Toast */}
      {showAuthPrompt && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div 
            className="flex items-center gap-3 px-4 py-3 bg-[#272727] text-white rounded-xl shadow-lg border border-white/10 cursor-pointer"
            onClick={() => router.push('/auth')}
          >
            <span className="text-sm">Sign in to interact</span>
            <span className="text-xs text-blue-400 font-medium">Sign In</span>
          </div>
        </div>
      )}
      {/* Mobile */}
      <div className="lg:hidden">
        {/* Player */}
        <div className="relative w-full aspect-video bg-black sticky top-0 z-40">
          <button onClick={() => router.back()} className="absolute top-3 left-3 z-50 p-2 bg-black/60 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {playbackUrl ? (
            <CustomVideoPlayer
              url={playbackUrl}
              isYouTube={!!isYouTubeVideo}
              poster={media.backdropImage || media.thumbnail}
              onProgress={handleProgress}
              onEnded={() => saveWatchProgress(mediaId, 100)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-white/60 text-sm">No video URL available</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <h1 className="text-base font-semibold mb-1">{media.title}</h1>
          <p className="text-xs text-gray-400 mb-3">{formatViews(media.views || 0)} views • {media.createdAt ? formatTimeAgo(media.createdAt) : 'Recently'}</p>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg ${isLiked ? 'bg-white text-black' : 'bg-[#272727]'}`}>
              <ThumbsUp className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{formatViews(likeCount)}</span>
            </button>
            <button onClick={handleDislike} className={`py-2.5 px-4 rounded-lg ${isDisliked ? 'bg-white text-black' : 'bg-[#272727]'}`}>
              <ThumbsDown className="w-4 h-4" fill={isDisliked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleWatchLater} className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg ${isWatchLater ? 'bg-blue-600' : 'bg-[#272727]'}`}>
              <Clock className="w-4 h-4" />
            </button>
            <button onClick={() => {
              if (!userId) {
                showAuthRequired()
                return
              }
              setShowPlaylistModal(true)
            }} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#272727]">
              <ListPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Channel */}
          <div className="flex items-center gap-3 py-3 border-y border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
              {media.title.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm">LoveWorld Singers</p>
              <p className="text-xs text-gray-400">Official</p>
            </div>
          </div>

          {/* Description */}
          {media.description && (
            <div className="py-3 bg-[#1a1a1a] rounded-xl mt-3 px-3" onClick={() => setShowFullDescription(!showFullDescription)}>
              <p className={`text-sm text-gray-300 ${showFullDescription ? '' : 'line-clamp-2'}`}>{media.description}</p>
              {media.description.length > 80 && (
                <button className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  {showFullDescription ? <>Less <ChevronUp className="w-3 h-3" /></> : <>More <ChevronDown className="w-3 h-3" /></>}
                </button>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="mt-5">
            <h3 className="font-semibold mb-3">Comments <span className="text-gray-500 font-normal">({comments.length})</span></h3>
            
            {user && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {profile?.first_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add comment..."
                    className="flex-1 bg-transparent border-b border-gray-700 focus:border-white outline-none text-sm py-1"
                  />
                  <button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting} className="p-2 text-blue-500 disabled:text-gray-600">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {commentsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-[#1a1a1a] rounded-lg animate-pulse" />)}</div>
            ) : comments.length > 0 ? (
              <div className="space-y-4 pb-20">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {c.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-0.5">@{c.userName} • {formatTimeAgo(c.createdAt)}</p>
                      <p className="text-sm">{c.content}</p>
                      <button onClick={() => handleLikeComment(c.id)} className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <ThumbsUp className="w-3 h-3" fill={c.likedBy.includes(userId || '') ? 'currentColor' : 'none'} />
                        {c.likes > 0 && c.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex max-w-[1600px] mx-auto gap-6 p-6">
        {/* Main */}
        <div className="flex-1 max-w-[1100px]">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          {/* Player */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
            {playbackUrl && (
              <CustomVideoPlayer
                url={playbackUrl}
                isYouTube={!!isYouTubeVideo}
                poster={media.backdropImage || media.thumbnail}
                onProgress={handleProgress}
                onEnded={() => saveWatchProgress(mediaId, 100)}
              />
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold mt-4">{media.title}</h1>

          {/* Actions */}
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                {media.title.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">LoveWorld Singers</p>
                <p className="text-xs text-gray-400">{formatViews(media.views || 0)} views</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#272727] rounded-full overflow-hidden">
                <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 border-r border-white/10 ${isLiked ? 'bg-white/10' : ''}`}>
                  <ThumbsUp className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                  <span>{formatViews(likeCount)}</span>
                </button>
                <button onClick={handleDislike} className={`px-4 py-2 ${isDisliked ? 'bg-white/10' : ''}`}>
                  <ThumbsDown className="w-5 h-5" fill={isDisliked ? 'currentColor' : 'none'} />
                </button>
              </div>
              <button onClick={handleWatchLater} className={`flex items-center gap-2 px-4 py-2 rounded-full ${isWatchLater ? 'bg-blue-600' : 'bg-[#272727] hover:bg-[#3a3a3a]'}`}>
                <Clock className="w-5 h-5" />
                {isWatchLater ? 'Saved' : 'Watch later'}
              </button>
              <button onClick={() => {
                if (!userId) {
                  showAuthRequired()
                  return
                }
                setShowPlaylistModal(true)
              }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272727] hover:bg-[#3a3a3a]">
                <ListPlus className="w-5 h-5" />
                Save
              </button>
            </div>
          </div>

          {/* Description */}
          {media.description && (
            <div className="bg-[#1a1a1a] rounded-xl p-4 mt-3 cursor-pointer" onClick={() => setShowFullDescription(!showFullDescription)}>
              <p className={`text-sm text-gray-300 ${showFullDescription ? '' : 'line-clamp-2'}`}>{media.description}</p>
              {media.description.length > 150 && (
                <span className="text-sm text-gray-500 mt-1">{showFullDescription ? 'Show less' : '...more'}</span>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">{comments.length} Comments</h3>
            
            {user && (
              <div className="flex gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold flex-shrink-0">
                  {profile?.first_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-transparent border-b border-gray-700 focus:border-white outline-none py-2"
                  />
                  {newComment && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setNewComment('')} className="px-4 py-2 text-sm hover:bg-white/10 rounded-full">Cancel</button>
                      <button onClick={handleSubmitComment} disabled={isSubmitting} className="px-4 py-2 text-sm bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50">Comment</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center font-bold flex-shrink-0">
                    {c.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-medium">@{c.userName}</span> <span className="text-gray-500 text-xs">{formatTimeAgo(c.createdAt)}</span></p>
                    <p className="text-sm mt-1">{c.content}</p>
                    <button onClick={() => handleLikeComment(c.id)} className="flex items-center gap-1 text-sm text-gray-500 mt-2 hover:text-white">
                      <ThumbsUp className="w-4 h-4" fill={c.likedBy.includes(userId || '') ? 'currentColor' : 'none'} />
                      {c.likes > 0 && c.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Related */}
        <div className="w-[360px] flex-shrink-0">
          <h3 className="font-semibold mb-4">Up next</h3>
          <div className="space-y-3">
            {relatedVideos.map(v => (
              <div 
                key={v.id} 
                onClick={() => router.push(`/pages/media/player/${v.id}`)}
                className="flex gap-2 cursor-pointer group"
              >
                <div className="w-40 aspect-video bg-[#1a1a1a] rounded-lg flex-shrink-0 relative overflow-hidden">
                  {v.thumbnail && <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8" fill="white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-2 mb-1">{v.title}</h4>
                  <p className="text-xs text-gray-400">LoveWorld Singers</p>
                  <p className="text-xs text-gray-500">{formatViews(v.views || 0)} views</p>
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
          videoThumbnail={media?.thumbnail}
          userId={userId}
        />
      )}
    </div>
  )
}
