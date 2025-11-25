'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { mediaService as firebaseMediaService } from '../_lib'
import type { MediaItem, Genre, UserWatchHistory } from '../_lib'

interface MediaContextType {
  // Media
  allMedia: MediaItem[]
  featuredMedia: MediaItem[]
  continueWatching: MediaItem[]
  favorites: MediaItem[]
  
  // Genres
  genres: Genre[]
  
  // Loading states
  isLoading: boolean
  
  // Actions
  getMediaByType: (type: MediaItem['type']) => Promise<MediaItem[]>
  getMediaByGenre: (genre: string) => Promise<MediaItem[]>
  searchMedia: (query: string) => Promise<MediaItem[]>
  addToFavorites: (mediaId: string) => Promise<void>
  removeFromFavorites: (mediaId: string) => Promise<void>
  saveWatchProgress: (mediaId: string, progress: number) => Promise<void>
  incrementViews: (mediaId: string) => Promise<void>
  refreshMedia: () => Promise<void>
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export function MediaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  
  const [allMedia, setAllMedia] = useState<MediaItem[]>([])
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem[]>([])
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([])
  const [favorites, setFavorites] = useState<MediaItem[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

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
      console.log('📺 New media uploaded, refreshing...')
      loadInitialData()
      if (user) {
        loadUserData()
      }
    }

    window.addEventListener('mediaUploaded', handleMediaUploaded)
    return () => window.removeEventListener('mediaUploaded', handleMediaUploaded)
  }, [user])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const [media, featured, genresList] = await Promise.all([
        firebaseMediaService.getAllMedia(),
        firebaseMediaService.getFeaturedMedia(),
        firebaseMediaService.getAllGenres()
      ])
      
      setAllMedia(media)
      setFeaturedMedia(featured)
      setGenres(genresList)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setIsLoading(false)
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

  const getMediaByGenre = async (genre: string) => {
    return await firebaseMediaService.getMediaByGenre(genre)
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
    genres,
    isLoading,
    getMediaByType,
    getMediaByGenre,
    searchMedia,
    addToFavorites,
    removeFromFavorites,
    saveWatchProgress,
    incrementViews,
    refreshMedia
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
