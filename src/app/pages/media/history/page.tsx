'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { firebaseMediaService, UserWatchHistory, MediaItem } from '../_lib/firebase-media-service'
import YouTubeHeader from '../_components/YouTubeHeader'
import YouTubeSidebar from '../_components/YouTubeSidebar'
import MediaCard from '../_components/MediaCard'
import { History, Trash2, Clock, X } from 'lucide-react'
import { getCloudinaryThumbnailUrl } from '@/utils/cloudinary'

// Helper to deduce duration since we don't store full media object in history immediately
// We need to fetch media items based on history
export default function HistoryPage() {
    const router = useRouter()
    const { user, profile, isLoading: authLoading } = useAuth()

    const [historyItems, setHistoryItems] = useState<{ history: UserWatchHistory, media: MediaItem }[]>([])
    const [loading, setLoading] = useState(true)

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (user?.uid) {
            loadHistory()
        } else if (!authLoading && !user) {
            setLoading(false)
        }
    }, [user?.uid, authLoading])

    const loadHistory = async () => {
        if (!user?.uid) return
        setLoading(true)
        try {
            const history = await firebaseMediaService.getUserWatchHistory(user.uid)

            // Uniqueify by mediaId - keep only the most recent entry
            const uniqueHistory: UserWatchHistory[] = []
            const seenMediaIds = new Set<string>()
            
            history.forEach(h => {
                if (!seenMediaIds.has(h.mediaId)) {
                    uniqueHistory.push(h)
                    seenMediaIds.add(h.mediaId)
                }
            })

            // Fetch associated media details
            const items: { history: UserWatchHistory; media: MediaItem }[] = []

            // Get unique media IDs
            const mediaIds = [...seenMediaIds]
            const mediaList = await firebaseMediaService.getMediaByIds(mediaIds)
            const mediaMap = new Map(mediaList.map(m => [m.id, m]))

            uniqueHistory.forEach(h => {
                const media = mediaMap.get(h.mediaId)
                if (media) {
                    items.push({ history: h, media })
                }
            })

            setHistoryItems(items)
        } catch (error) {
 console.error('Error loading history:', error)
        } finally {
            setLoading(false)
        }
    }

    const clearHistory = async () => {
        if (!user?.uid) return
        if (!confirm('Are you sure you want to clear your entire watch history? This action cannot be undone.')) return
        
        try {
            await firebaseMediaService.clearUserWatchHistory(user.uid)
            setHistoryItems([])
        } catch (error) {
            console.error('Error clearing history:', error)
            alert('Failed to clear history. Please try again.')
        }
    }

    const removeItem = async (historyId: string) => {
        try {
            await firebaseMediaService.removeFromWatchHistory(historyId)
            setHistoryItems(prev => prev.filter(item => item.history.id !== historyId))
        } catch (error) {
            console.error('Error removing item from history:', error)
            alert('Failed to remove item. Please try again.')
        }
    }

    // Mock props for sidebar
    const [viewMode, setViewMode] = useState<'all' | 'shorts'>('all')
    const [selectedCategory, setSelectedCategory] = useState('all')

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4">
                <History className="w-16 h-16 text-slate-800" />
                <p className="text-xl font-bold">Sign in to view your history</p>
                <button
                    onClick={() => router.push('/login')}
                    className="px-8 py-3 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    Sign In
                </button>
            </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-slate-950 text-slate-200 flex flex-col selection:bg-indigo-500/30">
            <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950">
                <YouTubeHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showMobileSearch={showMobileSearch}
                    setShowMobileSearch={setShowMobileSearch}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    userName={profile?.first_name || profile?.display_name || user?.email || undefined}
                />
            </div>

            <div className="flex flex-1 pt-16 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Container */}
                <div className={`fixed lg:relative top-0 left-0 h-screen lg:h-auto z-[110] transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0 lg:w-[72px]'}`}>
                    <YouTubeSidebar
                        sidebarOpen={sidebarOpen}
                        viewMode={viewMode}
                        selectedCategory={selectedCategory}
                        setViewMode={setViewMode}
                        setSelectedCategory={setSelectedCategory}
                        categories={[]}
                        onClose={() => setSidebarOpen(false)}
                    />
                </div>

                <main className="flex-1 max-w-[2100px] mx-auto px-6 pt-6 pb-24 overflow-y-auto custom-scrollbar bg-slate-950">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-10">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/5">
                                    <History className="w-6 h-6 text-indigo-400" />
                                </div>
                                Watch history
                            </h1>
                            {historyItems.length > 0 && (
                                <button
                                    onClick={clearHistory}
                                    className="flex items-center gap-2.5 px-6 py-3 hover:bg-slate-800 rounded-2xl text-[13px] font-bold transition-all text-slate-400 hover:text-slate-100 border border-white/5 active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear History
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex flex-col gap-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex gap-6 animate-pulse">
                                        <div className="w-48 sm:w-72 aspect-video bg-slate-900 rounded-2xl border border-white/5" />
                                        <div className="flex-1 space-y-3 py-2">
                                            <div className="h-5 bg-slate-900 rounded-lg w-3/4" />
                                            <div className="h-4 bg-slate-900 rounded-lg w-1/2" />
                                            <div className="h-3 bg-slate-900 rounded-lg w-full mt-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : historyItems.length === 0 ? (
                            <div className="py-32 text-center bg-slate-900/20 rounded-[32px] border-2 border-dashed border-slate-800">
                                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-6 border border-white/5">
                                    <Clock className="w-10 h-10 text-slate-800" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-100">Your history is clear</h3>
                                <p className="text-slate-500 mt-2 font-medium">Videos you watch will appear here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {historyItems
                                    .filter(item => 
                                        item.media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        item.media.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((item) => {
                                        // Use Cloudinary video frame transformation if possible, else fallback to thumbnail
                                        const videoFrameUrl = getCloudinaryThumbnailUrl(item.media.videoUrl);
                                        const thumbnailUrl = (item.media.videoUrl && item.media.videoUrl.includes('cloudinary.com')) 
                                            ? videoFrameUrl 
                                            : (item.media.thumbnail || videoFrameUrl);

                                        return (
                                            <div 
                                                key={item.history.id} 
                                                className="group flex gap-4 sm:gap-6 p-2 sm:p-3 rounded-[24px] hover:bg-slate-900/60 transition-all cursor-pointer border border-transparent hover:border-white/5 hover:shadow-2xl hover:shadow-indigo-500/5 active:scale-[0.99]" 
                                                onClick={() => router.push(`/pages/media/player/${item.media.id}`)}
                                            >
                                                {/* Thumbnail Container - Compact */}
                                                <div className="relative w-32 sm:w-48 lg:w-56 aspect-video bg-slate-900 rounded-[16px] overflow-hidden flex-shrink-0 shadow-lg border border-white/5 ring-1 ring-white/10">
                                                    <img
                                                        src={thumbnailUrl || '/movie/default-hero.jpeg'}
                                                        alt={item.media.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                        onError={(e) => {
                                                            const fallback = '/movie/default-hero.jpeg';
                                                            if (e.currentTarget.src !== fallback) {
                                                                e.currentTarget.src = fallback;
                                                            }
                                                        }}
                                                    />
                                                    
                                                    {/* Play Overlay */}
                                                    <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-all duration-300">
                                                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    {item.history.progress > 0 && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/40 backdrop-blur-md">
                                                            <div
                                                                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] rounded-r-full"
                                                                style={{ width: `${item.history.progress}%` }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Duration Badge */}
                                                    {item.media.duration && (
                                                        <div className="absolute bottom-1.5 right-1.5 bg-slate-950/90 backdrop-blur-md text-slate-100 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-white/10 shadow-xl">
                                                            {Math.floor(item.media.duration / 60)}:{String(Math.floor(item.media.duration % 60)).padStart(2, '0')}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content Info */}
                                                <div className="flex-1 py-0.5 min-w-0 flex flex-col justify-center">
                                                    <div>
                                                        <div className="flex justify-between items-start gap-2 mb-0.5">
                                                            <h3 className="text-[13px] sm:text-[15px] font-black line-clamp-2 leading-tight text-slate-100 group-hover:text-indigo-300 transition-colors tracking-tight">
                                                                {item.media.title}
                                                            </h3>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    removeItem(item.history.id)
                                                                }}
                                                                className="p-1 hover:bg-red-500/10 rounded-full text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center border border-transparent hover:border-red-500/20 flex-shrink-0"
                                                                title="Remove from history"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5">
                                                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                                                                {item.media.views?.toLocaleString()} views
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">
                                                                {item.history.lastWatched ? new Date(item.history.lastWatched).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                                                            </span>
                                                        </div>

                                                        <p className="text-[11px] sm:text-[12px] text-slate-500 line-clamp-1 sm:line-clamp-2 font-medium leading-relaxed max-w-xl">
                                                            {item.media.description || 'No description available for this session.'}
                                                        </p>
                                                    </div>

                                                    {/* Resume Indicator */}
                                                    {item.history.progress > 0 && item.history.progress < 95 && (
                                                        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-400/80">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {Math.round(item.history.progress)}% Watched
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
