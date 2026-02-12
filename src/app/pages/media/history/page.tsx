'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { firebaseMediaService, UserWatchHistory, MediaItem } from '../_lib/firebase-media-service'
import YouTubeHeader from '../_components/YouTubeHeader'
import YouTubeSidebar from '../_components/YouTubeSidebar'
import MediaCard from '../_components/MediaCard'
import { History, Trash2, Clock, X } from 'lucide-react'

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

            // Fetch associated media details
            // Optimally we'd do this in a batch or the service would return hydrated items
            // For now, let's fetch them
            const items: { history: UserWatchHistory; media: MediaItem }[] = []

            // Get unique media IDs
            const mediaIds = [...new Set(history.map(h => h.mediaId))]
            const mediaList = await firebaseMediaService.getMediaByIds(mediaIds)
            const mediaMap = new Map(mediaList.map(m => [m.id, m]))

            history.forEach(h => {
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
        if (!confirm('Are you sure you want to clear your watch history?')) return
        // Implement clear history logic in service if needed, or delete one by one
        // For MVP, maybe just alert not implemented or delete local state
        alert('Clear history functionality coming soon!')
    }

    // Mock props for sidebar
    const [viewMode, setViewMode] = useState<'all' | 'shorts'>('all')
    const [selectedCategory, setSelectedCategory] = useState('all')

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center flex-col gap-4">
                <History className="w-16 h-16 text-white/20" />
                <p className="text-xl font-bold">Sign in to view your history</p>
                <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-2 bg-blue-600 rounded-full font-bold hover:bg-blue-500 transition-colors"
                >
                    Sign In
                </button>
            </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-[#0f0f0f] text-white flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]">
                <YouTubeHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showMobileSearch={showMobileSearch}
                    setShowMobileSearch={setShowMobileSearch}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    userName={profile?.first_name || profile?.display_name || user?.email || undefined}
                />
            </div>

            <div className="flex flex-1 pt-14 lg:pt-0">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
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

                <main className="flex-1 max-w-[2100px] mx-auto px-4 py-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <History className="w-8 h-8" />
                                Watch history
                            </h1>
                            {historyItems.length > 0 && (
                                <button
                                    onClick={clearHistory}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full text-sm font-medium transition-colors text-[#aaa] hover:text-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear all watch history
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="w-40 h-24 bg-[#272727] rounded-xl" />
                                        <div className="flex-1 space-y-2 py-2">
                                            <div className="h-4 bg-[#272727] rounded w-3/4" />
                                            <div className="h-3 bg-[#272727] rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : historyItems.length === 0 ? (
                            <div className="py-20 text-center text-[#aaa]">
                                <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No watch history yet.</p>
                                <p className="text-sm">Videos you watch will appear here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {historyItems.map((item) => (
                                    <div key={item.history.id} className="group flex gap-4 pr-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/pages/media/player/${item.media.id}`)}>
                                        {/* Thumbnail */}
                                        <div className="relative w-40 sm:w-64 aspect-video bg-[#272727] rounded-xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.media.thumbnail || '/movie/default-hero.jpeg'}
                                                alt={item.media.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {item.history.progress > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                                    <div
                                                        className="h-full bg-red-600"
                                                        style={{ width: `${item.history.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                            {item.media.duration && (
                                                <div className="absolute bottom-1.5 right-1.5 bg-black/90 text-white text-[10px] font-bold px-1 py-0.5 rounded">
                                                    {Math.floor(item.media.duration / 60)}:{String(Math.floor(item.media.duration % 60)).padStart(2, '0')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 py-2 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm sm:text-lg font-bold line-clamp-2 leading-tight mb-1 text-white group-hover:text-blue-400 transition-colors">
                                                    {item.media.title}
                                                </h3>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        // Handle remove from history
                                                    }}
                                                    className="p-2 -mr-2 text-[#aaa] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove from history"
                                                >
                                                    <X href="" className="w-5 h-5 pointer-events-none" />
                                                    {/* Using X icon logic placeholder */}
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs sm:text-sm text-[#aaa] mb-2">
                                                Official • {item.media.views} views
                                            </p>
                                            <p className="text-xs text-[#888] line-clamp-2 hidden sm:block">
                                                {item.media.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
