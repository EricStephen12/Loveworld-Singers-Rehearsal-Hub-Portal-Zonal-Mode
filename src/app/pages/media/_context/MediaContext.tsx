'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { isHQGroup } from '@/config/zones'
import { mediaService as firebaseMediaService } from '../_lib'
import type { MediaItem, Genre } from '../_lib'

interface MediaContextType {
  // Media
  allMedia: MediaItem[]
  featuredMedia: MediaItem[]
  continueWatching: MediaItem[]
  favorites: MediaItem[]

  // Categories
  categories: any[]

  // Playlists
  playlists: any[]
  adminPlaylists: any[]

  // Loading states
  isLoading: boolean
  isLoadingPlaylists: boolean
  isLoadingMore: boolean
  hasMore: boolean

  // Actions
  getMediaByType: (type: MediaItem['type']) => Promise<MediaItem[]>
  getMediaByCategory: (category: string) => Promise<MediaItem[]>
  searchMedia: (query: string) => Promise<MediaItem[]>
  addToFavorites: (mediaId: string) => Promise<void>
  removeFromFavorites: (mediaId: string) => Promise<void>
  saveWatchProgress: (mediaId: string, progress: number) => Promise<void>
  incrementViews: (mediaId: string) => Promise<void>
  refreshMedia: () => Promise<void>
  refreshPlaylists: () => Promise<void>
  loadMore: () => Promise<void>
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export function MediaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { currentZone } = useZone()

  const [allMedia, setAllMedia] = useState<MediaItem[]>([])
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem[]>([])
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([])
  const [favorites, setFavorites] = useState<MediaItem[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [adminPlaylists, setAdminPlaylists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Determine if user is in HQ zone
  const userIsHQ = isHQGroup(currentZone?.id)

  // Load initial data when zone changes
  useEffect(() => {
    loadInitialData()
  }, [currentZone?.id])

  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setContinueWatching([])
      setFavorites([])
    }
  }, [user])

  // Listen for media upload events and refresh
  useEffect(() => {
    const handleMediaUploaded = () => {
      loadInitialData()
      if (user) {
        loadUserData()
      }
    }

    window.addEventListener('mediaUploaded', handleMediaUploaded)
    return () => window.removeEventListener('mediaUploaded', handleMediaUploaded)
  }, [user])

  const loadInitialData = async () => {
    // Load cached media immediately for instant display
    const { MediaCache } = await import('@/utils/media-cache')
    const cacheKey = userIsHQ ? 'hq' : 'regular'
    const cachedMedia = MediaCache.loadMedia(cacheKey)

    if (cachedMedia && cachedMedia.length > 0) {
      setAllMedia(cachedMedia as any)
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }

    // Load fresh data from Firebase in background
    // Filter by zone type: HQ zones see forHQ=true, regular zones see forHQ=false
    try {
      const { getPublicPlaylists } = await import('../_lib/playlist-service')
      const { getPublicAdminPlaylists } = await import('@/lib/admin-playlist-service')
      const { getCategories } = await import('@/lib/media-category-service')

      const [media, featured, categoriesList, pubPlaylists, admPlaylists] = await Promise.all([
        firebaseMediaService.getMediaForZone(userIsHQ, 24),
        firebaseMediaService.getFeaturedMedia(),
        getCategories(),
        getPublicPlaylists(20),
        getPublicAdminPlaylists(userIsHQ)
      ])

      setAllMedia(media)
      setFeaturedMedia(featured)
      setCategories(categoriesList)
      setPlaylists(pubPlaylists)
      setAdminPlaylists(admPlaylists)
      setHasMore(media.length >= 24)

      // Cache the media for next time (with zone-specific key)
      MediaCache.saveMedia(media, cacheKey)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingPlaylists(false)
    }
  }

  const refreshPlaylists = async () => {
    setIsLoadingPlaylists(true)
    try {
      const { getPublicPlaylists } = await import('../_lib/playlist-service')
      const { getPublicAdminPlaylists } = await import('@/lib/admin-playlist-service')

      const [pubPlaylists, admPlaylists] = await Promise.all([
        getPublicPlaylists(20),
        getPublicAdminPlaylists(userIsHQ)
      ])

      setPlaylists(pubPlaylists)
      setAdminPlaylists(admPlaylists)
    } catch (error) {
      console.error('Error refreshing playlists:', error)
    } finally {
      setIsLoadingPlaylists(false)
    }
  }

  // Load more media (pagination)
  const loadMore = async () => {
    if (isLoadingMore || !hasMore || allMedia.length === 0) return

    setIsLoadingMore(true)
    try {
      const lastMedia = allMedia[allMedia.length - 1]
      if (!lastMedia?.createdAt) return

      const moreMedia = await firebaseMediaService.loadMoreMedia(lastMedia.createdAt, 12)

      if (moreMedia.length === 0) {
        setHasMore(false)
      } else {
        setAllMedia(prev => [...prev, ...moreMedia])
        setHasMore(moreMedia.length >= 12)
      }
    } catch (error) {
      console.error('Error loading more media:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const loadUserData = async () => {
    if (!user) return

    try {
      const [continueWatch, userFavorites] = await Promise.all([
        firebaseMediaService.getContinueWatching(user.uid),
        firebaseMediaService.getUserFavorites(user.uid)
      ])

      setContinueWatching(continueWatch)
      setFavorites(userFavorites)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const getMediaByType = async (type: MediaItem['type']) => {
    return await firebaseMediaService.getMediaByType(type)
  }

  const getMediaByCategory = async (category: string) => {
    return await firebaseMediaService.getMediaByGenre(category)
  }

  const searchMedia = async (query: string) => {
    return await firebaseMediaService.searchMedia(query)
  }

  const addToFavorites = async (mediaId: string) => {
    if (!user) return

    try {
      await firebaseMediaService.addToFavorites(user.uid, mediaId)
      await loadUserData() // Refresh favorites
    } catch (error) {
      console.error('Error adding to favorites:', error)
    }
  }

  const removeFromFavorites = async (mediaId: string) => {
    if (!user) return

    try {
      await firebaseMediaService.removeFromFavorites(user.uid, mediaId)
      await loadUserData() // Refresh favorites
    } catch (error) {
      console.error('Error removing from favorites:', error)
    }
  }

  const saveWatchProgress = async (mediaId: string, progress: number) => {
    if (!user) return

    try {
      await firebaseMediaService.saveWatchProgress(user.uid, mediaId, progress)
      await loadUserData() // Refresh continue watching
    } catch (error) {
      console.error('Error saving watch progress:', error)
    }
  }

  const incrementViews = async (mediaId: string) => {
    try {
      await firebaseMediaService.incrementViews(mediaId)
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  const refreshMedia = async () => {
    await loadInitialData()
    if (user) {
      await loadUserData()
    }
  }

  const value: MediaContextType = {
    allMedia,
    featuredMedia,
    continueWatching,
    favorites,
    categories,
    playlists,
    adminPlaylists,
    isLoading,
    isLoadingPlaylists,
    isLoadingMore,
    hasMore,
    getMediaByType,
    getMediaByCategory,
    searchMedia,
    addToFavorites,
    removeFromFavorites,
    saveWatchProgress,
    incrementViews,
    refreshMedia,
    refreshPlaylists,
    loadMore
  }

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
}

export function useMedia() {
  const context = useContext(MediaContext)
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider')
  }
  return context
}
