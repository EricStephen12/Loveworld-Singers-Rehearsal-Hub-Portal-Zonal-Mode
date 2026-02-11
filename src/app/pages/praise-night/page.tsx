"use client";

import React, { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

import { ChevronRight, ChevronLeft, Search, Clock, Music, User, BookOpen, Timer, Mic, ChevronDown, ChevronUp, Play, X, Users, Calendar, Heart, Sparkles, CheckCircle, Info, ArrowLeft, SkipForward, Piano, HandMetal, Volume2, Flag, Archive, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SongDetailModal from "@/components/SongDetailModal";
import { ScreenHeader } from "@/components/ScreenHeader";
import SharedDrawer from "@/components/SharedDrawer";
import CustomLoader from "@/components/CustomLoader";
import AudioWave from "@/components/AudioWave";
import { PraiseNightSong, PraiseNight } from "@/types/supabase";
import { useRealtimeData } from "@/hooks/useRealtimeData";

import { useRealtimeSong } from "@/hooks/useRealtimeSong";
import { FirebaseMetadataService } from "@/lib/firebase-metadata-service";
import { useZone } from '@/hooks/useZone';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { isHQGroup } from '@/config/zones';
import { getMenuItems } from "@/config/menuItems";
import { useAudio } from "@/contexts/AudioContext";
import { usePageSearch, PageSearchResult } from "@/hooks/usePageSearch";
import { useAuth } from "@/hooks/useAuth";
import { useServerCountdown } from "@/hooks/useServerCountdown";
import { handleAppRefresh } from "@/utils/refresh-utils";
import { lowDataOptimizer } from "@/utils/low-data-optimizer";
import { useFeatureTracking } from "@/hooks/useAnalyticsTracking";
import { NavigationManager } from "@/utils/navigation";
import { navigationStateManager } from "@/utils/navigation-state";

function PraiseNightPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentZone, userRole, isInitialized } = useZone();
  const categoryFilter = searchParams?.get('category');
  const pageParam = searchParams?.get('page');
  const songParam = searchParams?.get('song');
  const { currentSong, isPlaying, setCurrentSong, play, isLoading, hasError, audioRef } = useAudio();

  // 🏥 Song detail modal states (moved up to avoid TDZ errors)
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [isSongDetailOpen, setIsSongDetailOpen] = useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);

  // 🔄 Navigation State Restoration: Restore last category if missing from URL
  useEffect(() => {
    // Only restore if:
    // 1. Zone is initialized (prevents wrong zone data)
    // 2. No category in URL (user returned without params)
    // 3. Not already loading
    if (isInitialized && !categoryFilter && currentZone?.id) {
      const savedState = navigationStateManager.getNavigationState(currentZone.id);

      if (savedState && savedState.path === '/pages/praise-night' && savedState.query.category) {


        // Use replace to avoid adding extra history entry
        const restoredUrl = navigationStateManager.buildUrlFromState(savedState);
        router.replace(restoredUrl);
      } else {
        // No saved state, default to 'ongoing' (safe fallback)

        router.replace('/pages/praise-night?category=ongoing');
      }
    }
  }, [isInitialized, categoryFilter, currentZone?.id, router]);

  // 💾 Save navigation state whenever category changes
  useEffect(() => {
    if (categoryFilter && currentZone?.id) {
      const query: Record<string, string> = { category: categoryFilter };

      // Include page if present
      if (pageParam) {
        query.page = pageParam;
      }

      navigationStateManager.saveNavigationState('/pages/praise-night', query, currentZone.id);

    }
  }, [categoryFilter, pageParam, currentZone?.id]);

  // Track praise night usage
  useFeatureTracking('praise_night');

  // Get zone color for theming
  const zoneColor = currentZone?.themeColor || '#9333EA';

  // Helper function to get color classes based on zone color
  const getZoneColorClasses = (variant: 'solid' | 'light' | 'ring' | 'text' | 'hover' = 'solid') => {
    const colorMap: Record<string, Record<string, string>> = {
      '#10B981': { solid: 'bg-emerald-600', light: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-400', text: 'text-emerald-600', hover: 'hover:bg-emerald-700' },
      '#3B82F6': { solid: 'bg-blue-600', light: 'bg-blue-100 text-blue-700', ring: 'ring-blue-400', text: 'text-blue-600', hover: 'hover:bg-blue-700' },
      '#F59E0B': { solid: 'bg-amber-600', light: 'bg-amber-100 text-amber-700', ring: 'ring-amber-400', text: 'text-amber-600', hover: 'hover:bg-amber-700' },
      '#EF4444': { solid: 'bg-red-600', light: 'bg-red-100 text-red-700', ring: 'ring-red-400', text: 'text-red-600', hover: 'hover:bg-red-700' },
      '#8B5CF6': { solid: 'bg-violet-600', light: 'bg-violet-100 text-violet-700', ring: 'ring-violet-400', text: 'text-violet-600', hover: 'hover:bg-violet-700' },
      '#EC4899': { solid: 'bg-pink-600', light: 'bg-pink-100 text-pink-700', ring: 'ring-pink-400', text: 'text-pink-600', hover: 'hover:bg-pink-700' },
      '#14B8A6': { solid: 'bg-teal-600', light: 'bg-teal-100 text-teal-700', ring: 'ring-teal-400', text: 'text-teal-600', hover: 'hover:bg-teal-700' },
      '#6366F1': { solid: 'bg-indigo-600', light: 'bg-indigo-100 text-indigo-700', ring: 'ring-indigo-400', text: 'text-indigo-600', hover: 'hover:bg-indigo-700' },
      '#F97316': { solid: 'bg-orange-600', light: 'bg-orange-100 text-orange-700', ring: 'ring-orange-400', text: 'text-orange-600', hover: 'hover:bg-orange-700' },
      '#84CC16': { solid: 'bg-lime-600', light: 'bg-lime-100 text-lime-700', ring: 'ring-lime-400', text: 'text-lime-600', hover: 'hover:bg-lime-700' },
      '#06B6D4': { solid: 'bg-cyan-600', light: 'bg-cyan-100 text-cyan-700', ring: 'ring-cyan-400', text: 'text-cyan-600', hover: 'hover:bg-cyan-700' },
      '#A855F7': { solid: 'bg-purple-600', light: 'bg-purple-100 text-purple-700', ring: 'ring-purple-400', text: 'text-purple-600', hover: 'hover:bg-purple-700' },
      '#22D3EE': { solid: 'bg-sky-600', light: 'bg-sky-100 text-sky-700', ring: 'ring-sky-400', text: 'text-sky-600', hover: 'hover:bg-sky-700' },
      '#FB923C': { solid: 'bg-orange-500', light: 'bg-orange-100 text-orange-700', ring: 'ring-orange-400', text: 'text-orange-600', hover: 'hover:bg-orange-600' },
      '#DC2626': { solid: 'bg-red-700', light: 'bg-red-100 text-red-800', ring: 'ring-red-500', text: 'text-red-700', hover: 'hover:bg-red-800' },
      '#059669': { solid: 'bg-emerald-700', light: 'bg-emerald-100 text-emerald-800', ring: 'ring-emerald-500', text: 'text-emerald-700', hover: 'hover:bg-emerald-800' },
      '#7C3AED': { solid: 'bg-violet-700', light: 'bg-violet-100 text-violet-800', ring: 'ring-violet-500', text: 'text-violet-700', hover: 'hover:bg-violet-800' },
      '#9333EA': { solid: 'bg-purple-600', light: 'bg-purple-100 text-purple-700', ring: 'ring-purple-400', text: 'text-purple-600', hover: 'hover:bg-purple-700' },
    };
    return colorMap[zoneColor]?.[variant] || colorMap['#9333EA'][variant];
  };

  // Use real-time zone-aware data for instant updates
  const { pages: allPraiseNights, loading, error, getCurrentPage, getCurrentSongs, refreshData } = useRealtimeData(currentZone?.id);
  const { signOut } = useAuth();
  const [currentPraiseNight, setCurrentPraiseNightState] = useState<PraiseNight | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debug dropdown state
  useEffect(() => {
    if (showDropdown) {

    }
  }, [showDropdown, categoryFilter]);

  // Re-initialize safe area when category changes (fixes bottom bar cut-off issue)
  useEffect(() => {
    const reinitializeSafeArea = async () => {
      // Force re-calculation of safe area when navigating between categories
      if (typeof window !== 'undefined') {
        // Import and use SafeAreaManager for manual recalculation
        const { SafeAreaManager } = await import('@/utils/safeAreaManager');
        const safeAreaManager = SafeAreaManager.getInstance();
        safeAreaManager.recalculate();

        // Also trigger resize event for additional compatibility
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);


      }
    };

    // Re-initialize when category changes
    if (categoryFilter) {
      reinitializeSafeArea();
    }
  }, [categoryFilter]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPageCategory, setSelectedPageCategory] = useState<string | null>(null);
  const [pageCategories, setPageCategories] = useState<any[]>([]);
  const [loadingPageCategories, setLoadingPageCategories] = useState(true);

  // Load songs on demand like admin does
  const [allSongsFromFirebase, setAllSongsFromFirebase] = useState<PraiseNightSong[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);

  // Load page categories (zone-aware) with caching
  useEffect(() => {
    const loadPageCategories = async () => {
      if (!currentZone?.id) {

        return;
      }

      // Check cache first (5 minute TTL for page categories - they rarely change)
      const cacheKey = `page-categories-${currentZone.id}`;
      const cached = lowDataOptimizer.get(cacheKey);
      if (cached) {

        setPageCategories(cached);
        setLoadingPageCategories(false);
        return;
      }

      setLoadingPageCategories(true);
      try {

        // Use getPageCategories which handles both HQ (unfiltered) and zone (filtered) cases
        const categories = await ZoneDatabaseService.getPageCategories(currentZone.id);

        setPageCategories(categories);

        // Cache for 5 minutes
        lowDataOptimizer.set(cacheKey, categories);
      } catch (error) {
        console.error('❌ Error loading page categories:', error);
        setPageCategories([]);
      } finally {
        setLoadingPageCategories(false);
      }
    };
    loadPageCategories();
  }, [currentZone?.id]);

  // Filter praise nights by category if specified
  const filteredPraiseNights = useMemo(() => {
    if (loading || !allPraiseNights) return [];

    let filtered = allPraiseNights;

    // Filter by category (archive, ongoing, etc.)
    if (categoryFilter) {
      filtered = filtered.filter(praiseNight => praiseNight.category === categoryFilter);

    } else {
      // When no category filter, exclude unassigned pages from regular view
      filtered = filtered.filter(praiseNight => praiseNight.category !== 'unassigned');
    }

    // Filter by page category if selected
    if (selectedPageCategory) {

      const beforeCount = filtered.length;
      filtered = filtered.filter(praiseNight => {
        const matches = praiseNight.pageCategory === selectedPageCategory;
        if (!matches) {

        }
        return matches;
      });

    }

    return filtered;
  }, [allPraiseNights, categoryFilter, selectedPageCategory, loading]);

  // Preload data for instant access
  // No preloading needed - data loads fresh on each request

  // Refresh data when page becomes visible (after admin updates)
  // Refresh data when page becomes visible (after admin updates)
  useEffect(() => {
    // 🛑 OPTIMIZATION: Disabled aggressive visibility refresh to save costs.
    // The useRealtimeData hook now handles TTL caching internally.
    // Manual pull-to-refresh is available if user needs instant update.

    /* 
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing data...');
        refreshData();

        // Also re-initialize safe area when page becomes visible
        const { SafeAreaManager } = await import('@/utils/safeAreaManager');
        const safeAreaManager = SafeAreaManager.getInstance();
        safeAreaManager.recalculate();
      }
    };

    const handleFocus = async () => {
      console.log('🔄 Page focused, refreshing data...');
      refreshData();

      // Re-initialize safe area when page gains focus
      const { SafeAreaManager } = await import('@/utils/safeAreaManager');
      const safeAreaManager = SafeAreaManager.getInstance();
      safeAreaManager.recalculate();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    */
  }, []); // Removed refreshData dependency naturally

  // ✅ SECURITY: Enforce Pre-Rehearsal Access Control
  const { isZoneCoordinator } = useZone();
  const { profile } = useAuth();

  useEffect(() => {
    if (categoryFilter === 'pre-rehearsal') {
      const isHQ = currentZone ? isHQGroup(currentZone.id) : false;
      const hasAccess = isZoneCoordinator || profile?.can_access_pre_rehearsal === true;

      // 1. HQ is always hidden/redirected
      // 2. Others must have permission
      if (isHQ || !hasAccess) {
        console.warn('🚫 Access Denied to Pre-Rehearsal category');
        router.replace('/pages/rehearsals');
      }
    }
  }, [categoryFilter, currentZone, isZoneCoordinator, profile, router]);

  // Periodic refresh to ensure data stays up to date (optimized interval)
  useEffect(() => {
    const refreshInterval = setInterval(() => {

      refreshData();
    }, 60000); // Refresh every 60 seconds (reduced from 30s to save Firebase reads)

    return () => {
      clearInterval(refreshInterval);
    };
  }, [refreshData]);

  // Handle page parameter from search results
  useEffect(() => {
    if (pageParam && allPraiseNights.length > 0) {
      // Handle both number IDs and Firebase document IDs
      const targetPage = allPraiseNights.find(page =>
        page.id === pageParam ||
        page.id === pageParam.toString() ||
        page.id === parseInt(pageParam).toString()
      );
      if (targetPage) {
        setCurrentPraiseNightState(targetPage);

      } else {

      }
    }
  }, [pageParam, allPraiseNights]);

  // Handle song parameter from URL
  useEffect(() => {
    if (currentPraiseNight && allSongsFromFirebase.length > 0) {
      if (songParam) {
        const decodedSong = decodeURIComponent(songParam);
        const targetSong = allSongsFromFirebase.find(song => song.title === decodedSong);

        if (targetSong && selectedSong?.id !== targetSong.id) {
          const songIndex = allSongsFromFirebase.indexOf(targetSong);
          // Set internal state to open modal
          setSelectedSongIndex(songIndex);
          setSelectedSong({ ...targetSong, imageIndex: songIndex });
          setIsSongDetailOpen(true);

          // Ensure it's the current song in the audio player if not already
          if (currentSong?.id !== targetSong.id) {
            setCurrentSong(targetSong, false);
          }


        }
      } else if (isSongDetailOpen) {
        // If song parameter disappeared (Back button), close the modal
        setIsSongDetailOpen(false);
        setSelectedSong(null);

      }
    }
  }, [songParam, currentPraiseNight, allSongsFromFirebase, isSongDetailOpen, selectedSong?.id, currentSong?.id, setCurrentSong]);

  // Auto-select first page only when no page is selected OR category changes
  useEffect(() => {
    // Check if we need to auto-select or re-select
    const categoryMismatch = currentPraiseNight && categoryFilter && currentPraiseNight.category !== categoryFilter;

    if (filteredPraiseNights.length > 0 && (!currentPraiseNight || categoryMismatch) && !pageParam) {
      // Only auto-select if no page parameter is overriding it
      const firstPage = filteredPraiseNights[0];
      setCurrentPraiseNightState(firstPage);

    }
  }, [filteredPraiseNights, currentPraiseNight, pageParam, categoryFilter]);

  // Debug page selection
  useEffect(() => {

  }, [categoryFilter, pageParam, currentPraiseNight, filteredPraiseNights, allPraiseNights]);

  // Auto-select a page with countdown data if current page has none
  useEffect(() => {
    if (currentPraiseNight && !currentPraiseNight.countdown && allPraiseNights.length > 0) {
      const pageWithCountdown = allPraiseNights.find(p => p.countdown && (p.countdown.days > 0 || p.countdown.hours > 0 || p.countdown.minutes > 0 || p.countdown.seconds > 0));
      if (pageWithCountdown) {

        setCurrentPraiseNightState(pageWithCountdown);
      }
    }
  }, [currentPraiseNight, allPraiseNights]);

  // Real-time data automatically loads songs, so we don't need the manual loading effect anymore

  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Audio context (moved to top)
  const [activeTab, setActiveTab] = useState('lyrics');

  // Filter states
  const [activeFilter, setActiveFilter] = useState<'heard' | 'unheard'>('heard');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);






  // ✅ Reset filter to 'heard' only when switching to a different page (not when just loading)
  const [previousPageId, setPreviousPageId] = useState<string | null>(null);
  useEffect(() => {
    if (currentPraiseNight && currentPraiseNight.id !== previousPageId) {
      setActiveFilter('heard');
      setPreviousPageId(currentPraiseNight.id);
    }
  }, [currentPraiseNight, previousPageId]);

  // Song detail modal states (moved to top)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);


  // Listen for global mini player events
  React.useEffect(() => {
    const handleOpenFullPlayer = (event: CustomEvent) => {
      const song = event.detail.song;
      if (song) {
        setSelectedSong(song);
        setIsSongDetailOpen(true);
        // Dispatch event to hide mini player
        window.dispatchEvent(new CustomEvent('songDetailOpen'));
      }
    };

    window.addEventListener('openFullPlayer', handleOpenFullPlayer as EventListener);

    return () => {
      window.removeEventListener('openFullPlayer', handleOpenFullPlayer as EventListener);
    };
  }, []);


  // Use the banner image from the database, fallback to default
  const ecardSrc = useMemo(() => {
    if (!currentPraiseNight) return "/Ecards/1000876785.png";



    // Use the bannerImage from the database if available
    if (currentPraiseNight.bannerImage) {

      return currentPraiseNight.bannerImage;
    }



    // Fallback to default image
    return "/Ecards/1000876785.png";
  }, [currentPraiseNight]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const handleLogout = async () => {
    try {
      await signOut()
      // Don't use router.push - signOut already handles redirect
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // ✅ Refresh functionality (clears cache but preserves auth)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await handleAppRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }


  const menuItems = getMenuItems(handleLogout, handleRefresh)

  // Server-side countdown timer that syncs with server time
  const { timeLeft, isLoading: countdownLoading, error: countdownError } = useServerCountdown({
    countdownData: currentPraiseNight?.countdown,
    praiseNightId: currentPraiseNight?.id
  })

  // Debug what's being passed to useServerCountdown


  // Debug countdown timer output


  // Debug countdown and rehearsal count data
  useEffect(() => {

  }, [currentPraiseNight, timeLeft, countdownLoading, countdownError, categoryFilter, filteredPraiseNights.length]);


  // Handle category selection and close drawer
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setIsCategoryDrawerOpen(false);

    // Smooth scroll for better UX
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle song card click - now JUST updates URL to trigger the sync effect
  const handleSongClick = (song: any, index: number) => {


    // Update URL with song parameter
    const params = new URLSearchParams(window.location.search);
    params.set('song', song.title);
    router.push(`?${params.toString()}`);

    // Dispatch event to hide mini player
    window.dispatchEvent(new CustomEvent('songDetailOpen'));
  };

  // Handle song card click when outside modal - opens modal AND updates URL
  const handleSongSwitch = (song: any, index: number) => {


    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set('song', song.title);
    router.push(`?${params.toString()}`);

    // Set the current song with auto-play enabled (only if it has audio)
    if (song.audioFile && song.audioFile.trim() !== '') {
      setCurrentSong(song, true); // Enable auto-play
    } else {
      setCurrentSong(song, false); // No auto-play
    }

    // Dispatch event to hide mini player
    window.dispatchEvent(new CustomEvent('songDetailOpen'));
  };

  // Get image for song based on index
  const getSongImage = (index: number) => {
    const images = [
      "/images/DSC_6155_scaled.jpg",
      "/images/DSC_6303_scaled.jpg",
      "/images/DSC_6446_scaled.jpg",
      "/images/DSC_6506_scaled.jpg",
      "/images/DSC_6516_scaled.jpg",
      "/images/DSC_6636_1_scaled.jpg",
      "/images/DSC_6638_scaled.jpg",
      "/images/DSC_6644_scaled.jpg",
      "/images/DSC_6658_1_scaled.jpg",
      "/images/DSC_6676_scaled.jpg"
    ];
    return images[index % images.length]; // Cycle through images if more songs than images
  };

  // Handle closing song detail
  const handleCloseSongDetail = () => {
    // If we have a song parameter, go back to remove it while keeping other params
    if (songParam) {
      NavigationManager.handleBack(router);
    } else {
      // Fallback if somehow there's no param
      setIsSongDetailOpen(false);
      setSelectedSong(null);
    }

    // Dispatch event to show mini player (if song is playing)
    window.dispatchEvent(new CustomEvent('songDetailClose'));
  };

  // NAVIGATION SAFETY - Close dropdown when navigation is attempted
  useEffect(() => {
    const handleBeforeUnload = () => {
      setShowDropdown(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Format single digit numbers with leading zero
  const formatNumber = (num: number) => {
    if (isNaN(num) || num === undefined || num === null) return '00';
    return num < 10 ? `0${num}` : num.toString();
  }

  // Icon mapping for categories
  const getCategoryIcon = (categoryName: string) => {
    // Simple category to icon mapping
    const categoryIconMap: { [key: string]: any } = {
      'worship': Heart,
      'praise': Sparkles,
      'hymn': BookOpen,
      'contemporary': Music,
      'traditional': Piano,
      'gospel': HandMetal,
      'ballad': Volume2,
      'fast': SkipForward,
      'slow': Clock,
      'medium': Play,
      'default': Music
    };

    const normalizedCategory = categoryName.toLowerCase();
    return categoryIconMap[normalizedCategory] || Music; // Default icon
  };

  // Load songs when a page is selected OR when real-time metadata changes
  const [songMetadataTimestamp, setSongMetadataTimestamp] = useState<number>(0);

  // 1. Subscribe to song metadata changes for the current page
  useEffect(() => {
    if (!currentPraiseNight || !currentZone?.id) return;


    const unsubscribe = FirebaseMetadataService.subscribeToPraiseNightSongsMetadata(
      currentZone.id,
      currentPraiseNight.id,
      (timestamp: number) => {

        setSongMetadataTimestamp(timestamp);
      }
    );

    return () => {

      unsubscribe();
    };
  }, [currentPraiseNight?.id, currentZone?.id]);

  // 1b. Subscribe to PRAISE NIGHT metadata (for category order, etc.)
  useEffect(() => {
    if (!currentZone?.id) return;

    // Subscribe to general praise_nights metadata
    const unsubscribe = FirebaseMetadataService.subscribeToMetadata(
      currentZone.id,
      'praise_nights',
      (timestamp) => {

        refreshData();
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentZone?.id]); // refreshData removed to prevent listener recreation

  // 1c. Sync currentPraiseNightState with allPraiseNights updates
  useEffect(() => {
    if (currentPraiseNight && allPraiseNights.length > 0) {
      const updatedPage = allPraiseNights.find(p => p.id === currentPraiseNight.id);

      // Deep comparison to avoid infinite loops (simplified check for key props)
      if (updatedPage && (
        updatedPage.categoryOrder?.join(',') !== currentPraiseNight.categoryOrder?.join(',') ||
        updatedPage.name !== currentPraiseNight.name ||
        updatedPage.category !== currentPraiseNight.category
      )) {

        setCurrentPraiseNightState(updatedPage);
      }
    }
  }, [allPraiseNights, currentPraiseNight]);

  // 2. Fetch songs when page changes OR metadata timestamp updates
  useEffect(() => {
    if (currentPraiseNight) {
      setSongsLoading(true);
      // Force refresh (second arg = true) to bypass useAdminData cache
      // This ensures we get the latest data when metadata triggers this effect
      getCurrentSongs(currentPraiseNight.id, true).then(songs => {

        setAllSongsFromFirebase(songs);
        setSongsLoading(false);
      }).catch(error => {
        console.error('Error loading songs:', error);
        setAllSongsFromFirebase([]);
        setSongsLoading(false);
      });
    } else {
      setAllSongsFromFirebase([]);
    }
  }, [currentPraiseNight?.id, songMetadataTimestamp, getCurrentSongs]);

  // 🔥 REALTIME SONG UPDATES: Subscribe to individual song changes
  // This enables instant lyrics updates when admins edit songs
  const {
    song: realtimeSongData,
    loading: realtimeSongLoading
  } = useRealtimeSong(
    currentZone?.id,
    currentPraiseNight?.id,
    selectedSong?.id
  );

  // Use the songs directly since they're already filtered by page
  const finalSongData = useMemo(() => {


    return allSongsFromFirebase;
  }, [currentPraiseNight, allSongsFromFirebase]);

  const isDataLoaded = !loading && !songsLoading && currentPraiseNight !== null;

  // Debug logging for song data


  // Song categories - get from Supabase data (supports both single and multiple categories)
  const songCategories = useMemo(() => {
    // Use finalSongData instead of currentPraiseNight.songs for more reliable data
    const songsToUse = finalSongData.length > 0 ? finalSongData : (currentPraiseNight?.songs || []);

    if (songsToUse.length === 0) {

      return [];
    }

    // Collect categories from both single category and categories array
    const allCategories: string[] = [];
    songsToUse.forEach(song => {
      if (song.categories && Array.isArray(song.categories)) {
        // New multi-category songs
        allCategories.push(...song.categories.filter(cat => cat && cat.trim()));
      } else if (song.category && song.category.trim()) {
        // Old single category songs
        allCategories.push(song.category);
      }
    });

    const uniqueCategories = [...new Set(allCategories)];

    // Debug logging
    console.log('🎵 Available categories from songs:', uniqueCategories);
    console.log('🎵 Songs used for categories:', songsToUse.length);
    console.log('🎵 All songs data:', songsToUse.map(song => ({
      title: song.title,
      category: song.category,
      categories: song.categories,
      status: song.status
    })));

    return uniqueCategories;
  }, [finalSongData, currentPraiseNight?.songs]);

  // Categories that currently have at least one active song
  const categoriesWithActiveSongs = useMemo(() => {
    const activeCategories = finalSongData
      .filter((song: any) => song.isActive && song.category)
      .map((song: any) => song.category);
    return Array.from(new Set(activeCategories));
  }, [finalSongData]);

  // All categories in horizontal bar with auto-scroll (prioritize categories that have active songs)
  const mainCategories = useMemo(() => {
    const base = [...songCategories];
    if (base.length === 0) return base;

    const order = currentPraiseNight?.categoryOrder || [];

    return base.sort((a, b) => {
      // 1. Active categories ALWAYS first (highest priority)
      const aActive = categoriesWithActiveSongs.includes(a);
      const bActive = categoriesWithActiveSongs.includes(b);

      if (aActive !== bActive) {
        return aActive ? -1 : 1;
      }

      // 2. Manual order from categoryOrder (second priority)
      const aOrderIndex = order.indexOf(a);
      const bOrderIndex = order.indexOf(b);

      const hasAOrder = aOrderIndex !== -1;
      const hasBOrder = bOrderIndex !== -1;

      if (hasAOrder && hasBOrder) {
        return aOrderIndex - bOrderIndex;
      } else if (hasAOrder) {
        return -1; // Items in order list come before items not in it
      } else if (hasBOrder) {
        return 1;
      }

      // 3. Alphabetical (fallback)
      return a.localeCompare(b);
    });
  }, [songCategories, categoriesWithActiveSongs, currentPraiseNight?.categoryOrder]);

  // No more FAB categories - all moved to main bar
  const otherCategories: string[] = [];

  // Debug logging for categories
  console.log(' Category bar data:', {
    songCategories: songCategories,
    mainCategories: mainCategories,
    otherCategories: otherCategories,
    activeCategory: activeCategory
  });


  // ✅ Prefer auto-selecting a category that has active songs; otherwise fall back to first
  useEffect(() => {
    if (!activeCategory) {
      const preferred = mainCategories.find((cat) => categoriesWithActiveSongs.includes(cat));
      if (preferred) {
        setActiveCategory(preferred);
        return;
      }
      if (songCategories.length > 0) {
        setActiveCategory(songCategories[0]);
      }
    } else if (!songCategories.includes(activeCategory)) {
      // If current activeCategory no longer exists (page switched), reset with preference
      const preferred = mainCategories.find((cat) => categoriesWithActiveSongs.includes(cat));
      if (preferred) {
        setActiveCategory(preferred);
      } else if (songCategories.length > 0) {
        setActiveCategory(songCategories[0]);
      } else {
        setActiveCategory('');
      }
    }
  }, [activeCategory, mainCategories, categoriesWithActiveSongs, songCategories]);

  // Fallback data if no centralized songs available
  const fallbackSongData = [
    // New Praise Songs
    {
      title: "Mighty God",
      status: "heard",
      category: "New Praise Songs",
      singer: "Sarah Johnson",
      lyrics: {
        verse1: "Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee\nThou changest not, Thy compassions they fail not\nAs Thou hast been Thou forever wilt be",
        chorus: "Great is Thy faithfulness\nGreat is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided",
        verse2: "Summer and winter, and springtime and harvest\nSun, moon and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love",
        bridge: "Pardon for sin and a peace that endureth\nThine own dear presence to cheer and to guide\nStrength for today and bright hope for tomorrow\nBlessings all mine, with ten thousand beside"
      },
      leadSinger: "Sarah Johnson",
      writtenBy: "Pastor Chris Oyakhilome",
      key: "G Major",
      tempo: "72 BPM",
      comments: "This song should be sung with deep reverence and heartfelt emotion. Allow the congregation to really feel the weight of God's amazing grace."
    }
  ];

  // Update data when praise night changes
  useEffect(() => {
    // This will trigger a re-render when currentPraiseNight changes
    // The getCurrentSongs() call will get the new data
  }, [currentPraiseNight]);

  // Helper function to check if song belongs to category (supports both single and multiple categories)
  const songBelongsToCategory = (song: any, targetCategory: string) => {
    // Check new categories array first
    if (song.categories && Array.isArray(song.categories) && song.categories.length > 0) {
      return song.categories.some((cat: string) => cat.trim() === targetCategory.trim());
    }
    // Fallback to old single category
    return (song.category || '').trim() === targetCategory.trim();
  };

  // Filter songs based on selected category and status
  const filteredSongs = finalSongData.filter(song => {
    const matchesCategory = songBelongsToCategory(song, activeCategory);
    const matchesStatus = song.status === activeFilter;

    // Debug logging


    return matchesCategory && matchesStatus;
  });

  // Get counts for current category
  const categoryHeardCount = finalSongData.filter(song => {
    return songBelongsToCategory(song, activeCategory) && song.status === 'heard';
  }).length;

  const categoryUnheardCount = finalSongData.filter(song => {
    return songBelongsToCategory(song, activeCategory) && song.status === 'unheard';
  }).length;

  const categoryTotalCount = categoryHeardCount + categoryUnheardCount;

  const switchPraiseNight = (praiseNight: PraiseNight) => {
    setCurrentPraiseNightState(praiseNight);
    setShowDropdown(false);
    // Real-time data automatically includes all songs, no need to load manually
  };

  // Search input focus from header search button
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Use page-specific search hook with actual songs data
  const { searchQuery, setSearchQuery, searchResults, hasResults } = usePageSearch(
    currentPraiseNight ? {
      ...currentPraiseNight,
      songs: allSongsFromFirebase
    } : null
  );

  const typedSearchResults = searchResults as PageSearchResult[];

  const onHeaderSearchClick = () => {
    setIsSearchOpen(true);
    const el = searchInputRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus after scroll animation
      setTimeout(() => el.focus(), 300);
    }
  };

  const onCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery(''); // Clear search query when closing
  };

  // Debug loading and error states


  // Show loading state only when initially loading with no data
  if (loading && allPraiseNights.length === 0 && !currentPraiseNight) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading program...</p>
        </div>
      </div>
    );
  }

  // Show error state - but allow navigation
  if (error) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading data</p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
        {/* Header with back button */}
        <ScreenHeader
          title="Error"
          showBackButton={true}
          backPath="/pages/rehearsals"
          rightImageSrc="/logo.png"
        />

      </div>
    );
  }



  // Show empty state when there's no data for the current category (but not when still loading)
  if (!loading && (!allPraiseNights || allPraiseNights.length === 0 || filteredPraiseNights.length === 0)) {

    return (
      <div
        className="h-screen flex flex-col safe-area-bottom overflow-y-auto"
        style={{
          background: `linear-gradient(135deg, ${zoneColor}15, #ffffff)`,
        }}
      >
        {/* Simple Header - Back button and title */}
        <div className="flex-shrink-0 w-full">
          <ScreenHeader
            title={categoryFilter === 'ongoing' ? 'Ongoing Sessions' :
              categoryFilter === 'archive' ? 'Archives' :
                categoryFilter === 'pre-rehearsal' ? 'Pre-Rehearsal' : 'Praise Night'}
            showBackButton={true}
            backPath="/pages/rehearsals"
            rightImageSrc="/logo.png"
          />
        </div>


        {/* Empty State Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm mx-auto">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              {categoryFilter === 'ongoing' ? (
                <Clock className="w-10 h-10 text-purple-600" />
              ) : categoryFilter === 'archive' ? (
                <Archive className="w-10 h-10 text-purple-600" />
              ) : categoryFilter === 'pre-rehearsal' ? (
                <Calendar className="w-10 h-10 text-purple-600" />
              ) : (
                <Music className="w-10 h-10 text-purple-600" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {categoryFilter === 'ongoing' ? 'No Ongoing Sessions' :
                categoryFilter === 'archive' ? 'No Archived Sessions' :
                  categoryFilter === 'pre-rehearsal' ? 'No Pre-Rehearsal Sessions' :
                    'No Sessions Available'}
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {categoryFilter === 'ongoing' ? 'Ongoing sessions will appear here when they are active and ready for rehearsal.' :
                categoryFilter === 'archive' ? 'Archived sessions will appear here when they are completed and moved to archive.' :
                  categoryFilter === 'pre-rehearsal' ? 'Pre-rehearsal sessions will appear here when they are scheduled for preparation.' :
                    'Create your first session to get started with your praise and worship program.'}
            </p>

            {/* Back Button */}
            <button
              onClick={() => {

              }}
              className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: zoneColor,
                filter: 'brightness(0.95)',
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rehearsals
            </button>
          </div>
        </div>

        {/* No SharedDrawer in empty state - just back button for navigation */}
      </div>
    );
  }

  // ✅ Show loading screen while data is being fetched OR restoration is pending
  // This prevents the "default" content from flashing before the URL matches the state
  const isRestoring = isInitialized && !categoryFilter && currentZone?.id;

  if (loading || !isInitialized || isRestoring || (filteredPraiseNights.length === 0 && !currentPraiseNight && allPraiseNights.length === 0)) {
    return (
      <div
        className="h-screen safe-area-bottom flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${zoneColor}12, #fdfbff)` }}
      >
        <CustomLoader />
      </div>
    );
  }

  return (
    <div
      className="h-screen safe-area-bottom overflow-y-auto"
      style={{ background: `linear-gradient(135deg, ${zoneColor}12, #fdfbff)` }}
    >
      {/* Main Content with Apple-style reveal effect */}
      <div
        className={`
          h-full flex flex-col
          transition-all duration-300 ease-out
          ${isMenuOpen
            ? 'translate-x-72 scale-[0.88] rounded-2xl shadow-2xl origin-left overflow-hidden'
            : 'translate-x-0 scale-100 rounded-none'
          }
        `}
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
      >
        <style jsx global>{`
        html { scroll-behavior: smooth; }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out 0.4s both;
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.95); }
        }
        
        .breathe-animation {
          animation: breathe 2s ease-in-out infinite;
        }
        
        @keyframes pulse-border {
          0%, 100% { 
            border-color: rgb(147 51 234);
            box-shadow: 0 0 0 2px rgb(147 51 234);
          }
          50% { 
            border-color: rgb(196 181 253);
            box-shadow: 0 0 0 2px rgb(196 181 253);
          }
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
          width: 200%;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        
        /* Allow manual scrolling by pausing animation on scroll */
        .animate-scroll.manual-scroll {
          animation-play-state: paused;
        }
        
        /* Alternative approach - use transform instead of animation for better manual control */
        .animate-scroll-alt {
          width: 200%;
          animation: none;
        }
        
        .animate-scroll-alt.auto-scroll {
          animation: scroll 20s linear infinite;
        }
        
        /* Custom scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 2px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>


        {/* ✅ Fixed Header - Full Width */}
        <div className="flex-shrink-0 w-full relative z-[60]">
          <div className="relative bg-white/80 backdrop-blur-xl border-b border-gray-100/50 min-h-[60px] sm:min-h-[70px]">
            {/* Normal Header Content */}
            <div className={`transition-all duration-300 ease-out ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <ScreenHeader
                title={categoryFilter === 'archive' ? 'Archives' :
                  categoryFilter === 'pre-rehearsal' && filteredPraiseNights.length === 0 ? 'Pre-Rehearsal' :
                    (currentPraiseNight?.name || '')}
                showBackButton={true}
                backPath="/pages/rehearsals"
                showMenuButton={false}
                rightImageSrc="/logo.png"
                leftButtons={categoryFilter !== 'archive' && !pageParam && (
                  <button
                    aria-label="Switch Praise Night"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition border border-slate-200 touch-optimized"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
                rightButtons={categoryFilter !== 'archive' && (
                  <button
                    onClick={() => setIsSearchOpen((v) => !v)}
                    aria-label="Toggle search"
                    className="p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 active:scale-95 hover:bg-gray-100/70 active:bg-gray-200/90 touch-optimized"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  >
                    <Search className="w-5 h-5 text-gray-600 transition-all duration-200" />
                  </button>
                )}
                timer={currentPraiseNight && currentPraiseNight.countdown && categoryFilter !== 'archive' && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
                  <div className="flex items-center gap-0.5 text-xs">
                    <span className="font-bold text-gray-700">{formatNumber(timeLeft.days)}d</span>
                    <span className="text-gray-500 font-bold">:</span>
                    <span className="font-bold text-gray-700">{formatNumber(timeLeft.hours)}h</span>
                    <span className="text-gray-500 font-bold">:</span>
                    <span className="font-bold text-gray-700">{formatNumber(timeLeft.minutes)}m</span>
                    <span className="text-gray-500 font-bold">:</span>
                    <span className="font-bold text-gray-700">{formatNumber(timeLeft.seconds)}s</span>
                  </div>
                )}
              />
            </div>

            {/* Header Search Overlay */}
            <div className={`absolute inset-0 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out ${isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
              }`}>
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 h-full">
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    placeholder="Search songs, lyrics, solfas, writer, lead singer..."
                    inputMode="search"
                    aria-label="Search"
                    className="w-full text-lg bg-transparent px-0 py-3 text-gray-800 placeholder-gray-400 border-0 outline-none appearance-none shadow-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none font-poppins-medium"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  />
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-300/40" />
                  <div className="absolute left-0 bottom-0 h-0.5 bg-purple-500 w-full shadow-sm"
                    style={{ boxShadow: '0 0 8px rgba(147, 51, 234, 0.4)' }} />
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                  }}
                  aria-label="Close search"
                  className="p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 active:scale-95 hover:bg-gray-100/70 active:bg-gray-200/90 ml-4"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                >
                  <X className="w-6 h-6 text-gray-700 transition-all duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Overlay */}

        {
          isSearchOpen && (
            <div className="fixed left-0 right-0 top-16 z-[65] bg-white border border-gray-200 shadow-lg max-h-96 overflow-y-auto">
              <div className="mx-auto max-w-2xl lg:max-w-6xl xl:max-w-7xl px-4 py-2">
                <div className="text-xs text-gray-500 mb-2 font-medium">
                  {searchQuery ? (
                    `${typedSearchResults.length} result${typedSearchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  ) : (
                    'Start typing to search songs, artists, or events...'
                  )}
                </div>
                {typedSearchResults.length > 0 ? (
                  <div className="space-y-1">
                    {typedSearchResults.map((result) => {
                      // Handle song results differently - open modal directly
                      if (result.type === 'song') {
                        return (
                          <button
                            key={result.id}
                            onClick={() => {
                              // Find the song in the current data and open modal
                              const song = finalSongData.find(s => s.title === result.title);
                              if (song) {
                                const songIndex = finalSongData.indexOf(song);
                                handleSongClick(song, songIndex);
                              }
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left block p-3 rounded-xl hover:bg-gray-100/70 active:bg-gray-200/90 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {(result.type as string) === 'song' && <Music className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                                  {(result.type as string) === 'category' && <Flag className="w-4 h-4 text-green-600 flex-shrink-0" />}
                                  <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">
                                    {result.title}
                                  </h4>
                                  {result.status && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${result.status === 'heard'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-orange-100 text-orange-700'
                                      }`}>
                                      {result.status}
                                    </span>
                                  )}
                                </div>
                                {result.subtitle && (
                                  <p className="text-xs text-purple-600 font-medium mb-0.5">
                                    {result.subtitle}
                                  </p>
                                )}
                                {result.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {result.description}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2" />
                            </div>
                          </button>
                        );
                      } else {
                        // For category results, filter by category
                        return (
                          <button
                            key={result.id}
                            onClick={() => {
                              setActiveCategory(result.category || '');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left block p-3 rounded-xl hover:bg-gray-100/70 active:bg-gray-200/90 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {(result.type as string) === 'song' && <Music className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                                  {(result.type as string) === 'category' && <Flag className="w-4 h-4 text-green-600 flex-shrink-0" />}
                                  <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">
                                    {result.title}
                                  </h4>
                                  {result.status && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${result.status === 'heard'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-orange-100 text-orange-700'
                                      }`}>
                                      {result.status}
                                    </span>
                                  )}
                                </div>
                                {result.subtitle && (
                                  <p className="text-xs text-purple-600 font-medium mb-0.5">
                                    {result.subtitle}
                                  </p>
                                )}
                                {result.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {result.description}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2" />
                            </div>
                          </button>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No results found</p>
                    <p className="text-xs text-gray-400 mt-1">Try searching for songs, artists, or events</p>
                  </div>
                )}
              </div>
            </div>
          )
        }

        {/* Header-level Praise Night Dropdown - Hide for archive and when viewing specific page */}
        {
          showDropdown && categoryFilter !== 'archive' && !pageParam && (
            <>
              <div
                className="fixed inset-0 bg-black/20 z-[75]"
                onClick={() => setShowDropdown(false)}
                onTouchStart={() => setShowDropdown(false)}
              />
              <div className="fixed right-3 left-3 sm:right-4 sm:left-auto top-16 sm:top-16 z-[80] w-auto sm:w-64 max-w-2xl mx-auto sm:mx-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="px-3 sm:px-4 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                    </div>
                    <div className="text-slate-500 text-sm mb-2 font-medium">
                      Loading sessions...
                    </div>
                  </div>
                ) : filteredPraiseNights.length > 0 ? (
                  filteredPraiseNights.map((praiseNight) => (
                    <button
                      key={praiseNight.id}
                      onClick={() => switchPraiseNight(praiseNight)}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-slate-50 transition-colors ${praiseNight.id === currentPraiseNight?.id ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : ''
                        }`}
                    >
                      <div className="font-semibold text-sm sm:text-base">{praiseNight.name}</div>
                      <div className="text-xs sm:text-sm text-slate-600">{praiseNight.location} • {praiseNight.date}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 sm:px-4 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      {categoryFilter === 'pre-rehearsal' ? (
                        <Clock className="w-8 h-8 text-slate-400" />
                      ) : categoryFilter === 'archive' ? (
                        <Archive className="w-8 h-8 text-slate-400" />
                      ) : (
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-slate-500 text-sm mb-2 font-medium">
                      {categoryFilter === 'pre-rehearsal' && 'No Pre-Rehearsal sessions yet'}
                      {categoryFilter === 'ongoing' && 'No Ongoing sessions yet'}
                      {categoryFilter === 'archive' && 'No Archived sessions yet'}
                      {categoryFilter === 'unassigned' && 'No Unassigned sessions yet'}
                      {!categoryFilter && 'No sessions available'}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {categoryFilter === 'pre-rehearsal' && 'Pre-rehearsal sessions will appear here when scheduled'}
                      {categoryFilter === 'ongoing' && 'Ongoing sessions will appear here when active'}
                      {categoryFilter === 'archive' && 'Archived sessions will appear here when completed'}
                      {categoryFilter === 'unassigned' && 'Unassigned sessions will appear here when created'}
                      {!categoryFilter && 'Create your first session to get started'}
                    </div>
                  </div>
                )}
              </div>
            </>
          )
        }



        {/* ✅ Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch">
          <div className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-4 relative mobile-content-with-bottom-nav">
            {/* Archive Cards Grid - Special layout for archive category */}
            {categoryFilter === 'archive' && (
              <div className="mb-6">
                {/* Show skeleton while loading page categories */}
                {loadingPageCategories && !selectedPageCategory && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border-2 border-slate-200 rounded-xl p-6">
                          <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-3"></div>
                          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show page categories if in archive and no category selected AND categories exist */}
                {!loadingPageCategories && categoryFilter === 'archive' && !selectedPageCategory && pageCategories.length > 0 && filteredPraiseNights.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Browse by Category</h3>
                      <span className="text-sm text-slate-500">{pageCategories.length} categories</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {pageCategories.map((category) => {
                        // Count pages in this category
                        const pagesInCategory = allPraiseNights.filter(p => {
                          const isArchive = p.category === 'archive';
                          const matchesCategory = p.pageCategory === category.name;

                          return isArchive && matchesCategory;
                        });
                        const pageCount = pagesInCategory.length;



                        // Show all categories, even with 0 pages (for testing)
                        return (
                          <button
                            key={category.id}
                            onClick={() => {

                            }}
                            className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-200 text-left"
                          >
                            {category.image && (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-40 object-cover rounded-lg mb-4"
                              />
                            )}
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">{category.name}</h4>
                            <p className="text-sm text-slate-500 mb-3 line-clamp-2">{category.description}</p>
                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show back button if page category is selected */}
                {selectedPageCategory && (
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedPageCategory(null)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Categories
                    </button>
                  </div>
                )}

                {/* Show skeleton while loading pages */}
                {loading && selectedPageCategory && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
                        <div className="p-3">
                          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show pages if: 1) category is selected, OR 2) no page categories exist (show all archived pages) */}
                {!loading && !loadingPageCategories && (selectedPageCategory || pageCategories.length === 0) && filteredPraiseNights.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {filteredPraiseNights.map((praiseNight) => (
                      <button
                        key={praiseNight.id}
                        onClick={() => {
                          // Navigate to praise-night page with this specific page's data
                          // Use Next.js router to avoid full page reload
                          router.push(`/pages/praise-night?page=${praiseNight.id}`);
                        }}
                        className={`group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${currentPraiseNight?.id === praiseNight.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                      >
                        {/* Banner Image */}
                        <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                          {praiseNight.bannerImage ? (
                            <img
                              src={praiseNight.bannerImage}
                              alt={praiseNight.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('❌ Banner image failed to load:', praiseNight.bannerImage);
                                // Fallback to gradient if image fails to load
                                e.currentTarget.style.display = 'none';
                              }}
                              onLoad={() => {
                                console.log('✅ Banner image loaded successfully:', praiseNight.bannerImage);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">PN{praiseNight.id}</span>
                            </div>
                          )}
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>

                        {/* Page Info */}
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">{praiseNight.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{praiseNight.date}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{praiseNight.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : selectedPageCategory ? (
                  <div className="text-center py-12">
                    <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No pages in this category</h3>
                    <p className="text-slate-500">
                      No archived pages have been assigned to "{selectedPageCategory}" yet
                    </p>
                  </div>
                ) : !loadingPageCategories && pageCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Page Categories</h3>
                    <p className="text-slate-500 mb-4">
                      Page categories help organize your archived programs.
                    </p>
                    <p className="text-sm text-slate-400">
                      Create page categories in the Admin Panel → Page Categories section
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* E-card with embedded switcher below (single image, no slide) - Hide for archive */}
            {categoryFilter !== 'archive' && currentPraiseNight && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-2 sm:mb-3 max-w-md sm:max-w-lg mx-auto shadow-2xl shadow-black/20 ring-1 ring-black/5 breathe-animation">
                <div className="relative h-35 sm:h-43 md:h-51">
                  <Image
                    src={ecardSrc}
                    alt="Praise Night E-card"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                    className="object-cover object-center"
                    priority={false}
                    onError={(e) => {
                      console.error('Image failed to load:', ecardSrc);
                      // Fallback to default image
                      e.currentTarget.src = "/Ecards/1000876785.png";
                    }}
                    onLoad={() => {

                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </div>
            )}

            {/* Pills under timer - Hide for archive, pre-rehearsal when empty, and when no content */}
            {categoryFilter !== 'archive' && currentPraiseNight && filteredPraiseNights.length > 0 && !(categoryFilter === 'pre-rehearsal' && filteredPraiseNights.length === 0) && (
              <div className="mb-4 sm:mb-6">
                <div
                  className="-mx-3 px-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    target.style.animationPlayState = 'paused';
                    clearTimeout((target as any).scrollTimeout);
                    (target as any).scrollTimeout = setTimeout(() => {
                      target.style.animationPlayState = 'running';
                    }, 2000);
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 animate-scroll">
                    {/* First set of pills */}
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100">
                        <Music className="w-3.5 h-3.5 text-purple-600" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium">Songs Schedule</span>
                    </button>

                    <button
                      onClick={() => router.push('/pages/audiolab')}
                      className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100">
                        <Mic className="w-3.5 h-3.5 text-purple-600" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium">Audio Lab</span>
                    </button>

                    <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium">Solfas</span>
                    </button>

                    <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium">Sheet Music</span>
                    </button>

                    {/* Duplicate set for seamless scrolling */}
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100">
                        <Music className="w-3.5 h-3.5 text-purple-600" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium">Songs Schedule</span>
                    </button>

                    <button
                      onClick={() => router.push('/pages/audiolab')}
                      className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100">
                        <Mic className="w-3.5 h-3.5 text-purple-600" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium">Audio Lab</span>
                    </button>

                    <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium">Solfas</span>
                    </button>

                    <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium">Sheet Music</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Status Filter buttons/pills with category-specific count - Show for archive individual pages */}
            {currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && (
              <div className="mb-4 sm:mb-6 px-4">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveFilter('heard')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-sm border whitespace-nowrap ${activeFilter === 'heard'
                      ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                      }`}
                  >
                    Heard ({categoryHeardCount})
                  </button>

                  <div className="flex-1 text-center max-w-[55%] sm:max-w-none">
                    {/* Mobile: show first 3 words then ... if too long */}
                    <span className="block sm:hidden text-black text-xs font-medium truncate">
                      {(() => {
                        if (!activeCategory) return '';
                        const words = activeCategory.split(' ').filter(Boolean);
                        const firstThree = words.slice(0, 3).join(' ');
                        return words.length > 3 ? `${firstThree}...` : firstThree;
                      })()}
                    </span>
                    {/* Desktop / tablet: show full category */}
                    <span className="hidden sm:inline text-black text-sm font-medium">
                      {activeCategory}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveFilter('unheard')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-sm border whitespace-nowrap ${activeFilter === 'unheard'
                      ? 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                      }`}
                  >
                    Unheard ({categoryUnheardCount})
                  </button>
                </div>
              </div>
            )}

            {/* Song Title Cards - Scrollable - Show for archive individual pages */}
            {currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && (
              <div className="px-1 py-4 max-h-96 lg:max-h-none overflow-y-auto">
                {/* ✅ CRITICAL FIX: Show loading skeleton while fetching, not empty state */}
                {songsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="border-0 rounded-2xl p-3 lg:p-4 shadow-sm bg-white animate-pulse">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-200"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                          <div className="w-12 h-6 bg-slate-200 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredSongs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="text-slate-500 text-sm mb-2 font-medium">
                      {!currentPraiseNight && 'No praise night selected'}
                      {currentPraiseNight && !activeCategory && 'No category selected'}
                      {currentPraiseNight && activeCategory && categoryTotalCount === 0 && `No songs in ${activeCategory} category yet`}
                      {currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'heard' && categoryHeardCount === 0 && `No heard songs in ${activeCategory} yet`}
                      {currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'unheard' && categoryUnheardCount === 0 && `No unheard songs in ${activeCategory} yet`}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {!currentPraiseNight && 'Select a praise night from the dropdown above'}
                      {currentPraiseNight && !activeCategory && 'Select a category from the bottom navigation'}
                      {currentPraiseNight && activeCategory && categoryTotalCount === 0 && 'Songs will appear here when added to this category'}
                      {currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'heard' && categoryHeardCount === 0 && 'Songs will appear here when marked as heard'}
                      {currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'unheard' && categoryUnheardCount === 0 && 'Songs will appear here when marked as unheard'}
                    </div>
                  </div>
                ) : (
                  <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
                    {filteredSongs.map((song, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          // Open modal without auto-play
                          handleSongClick(song, index);
                        }}
                        className={`border-0 rounded-2xl p-3 lg:p-4 shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.97] group mb-3 lg:mb-0 w-full cursor-pointer touch-optimized ${(song as any).isActive
                          ? 'ring-4 ring-green-500 shadow-lg shadow-green-200/50 bg-white hover:bg-gray-50 animate-pulse-ring' // Admin marked as ACTIVE - blinking green border
                          : (() => {
                            const isActive = currentSong?.id === song.id;
                            if (isActive) {

                            }
                            return isActive;
                          })()
                            ? 'ring-2 shadow-lg' // Playing - use zone color
                            : 'bg-white hover:bg-gray-50 ring-1 ring-black/5'
                          }`}
                        style={(() => {
                          const isActive = currentSong?.id === song.id;
                          if (isActive) {
                            return {
                              backgroundColor: `${zoneColor}40`,
                              borderColor: zoneColor,
                              boxShadow: `0 0 0 2px ${zoneColor}, 0 10px 15px -3px ${zoneColor}30, 0 4px 6px -2px ${zoneColor}20`
                            };
                          }
                          return {};
                        })()}
                      >
                        {/* Song Header - Rehearsal Style */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div
                              className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm"
                              style={{ backgroundColor: `${zoneColor}20` }}
                            >
                              {currentSong?.id === song.id && isPlaying ? (
                                <AudioWave className="h-6 w-6" />
                              ) : (
                                <span
                                  className="text-sm lg:text-base font-semibold"
                                  style={{ color: zoneColor }}
                                >
                                  {index + 1}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-900 text-sm lg:text-base group-hover:text-black leading-tight">
                                {song.title}
                              </h3>
                              <p className="text-xs lg:text-sm text-slate-500 mt-0.5 leading-tight font-bold">
                                Singer: {song.leadSinger || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Rehearsal Count */}
                            <div
                              className="px-2 py-1 rounded-full"
                              style={{ backgroundColor: `${zoneColor}20` }}
                            >
                              <span
                                className="text-xs font-bold"
                                style={{ color: zoneColor }}
                              >
                                x{song.rehearsalCount ?? 0}
                              </span>
                            </div>
                            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add bottom padding to prevent content from being hidden behind sticky categories and safe areas */}
            <div className="h-20"></div> {/* Spacer for fixed bottom elements */}
          </div>
        </div>
        {/* ✅ End of Scrollable Content */}
      </div > {/* End Apple-style animated container */}

      < SharedDrawer
        open={isMenuOpen}
        onClose={toggleMenu}
        title="Menu"
        items={menuItems}
        key={`drawer-${categoryFilter}`
        } // Force re-render when category changes
      />

      {/* ✅ Category Bar for Individual Archive Pages with Horizontal Scroll */}
      {
        categoryFilter === 'archive' && pageParam && (
          <div
            className="bottom-bar-enhanced flex-shrink-0 z-[100] backdrop-blur-md shadow-sm border-t border-gray-200/50 w-full"
            style={{
              background: `linear-gradient(to top, ${zoneColor}20, ${zoneColor}10, rgba(255, 255, 255, 0.2))`
            }}
          >
            <div className="w-full flex items-center px-3 sm:px-4 lg:px-6 py-4 gap-2">
              {/* Category buttons with horizontal scroll */}
              <div
                className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              >
                <div className="flex gap-2 min-w-max px-1">
                  {mainCategories.map((category, index) => {
                    const hasActiveSong = finalSongData.some((song: any) => song.category === category && song.isActive);
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`flex-shrink-0 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-200 text-center whitespace-nowrap category-button ${hasActiveSong
                          ? 'bg-green-600 text-white border-2 border-green-700 shadow-md'
                          : activeCategory === category
                            ? 'text-white shadow-md'
                            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
                          }`}
                        style={activeCategory === category && !hasActiveSong ? {
                          backgroundColor: zoneColor,
                          boxShadow: `0 4px 6px -1px ${zoneColor}40, 0 2px 4px -1px ${zoneColor}20`
                        } : {}}
                      >
                        <span className="block leading-tight">{category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* ✅ Fixed Bottom Bar with Horizontal Scrolling Categories */}
      {
        filteredPraiseNights.length > 0 && categoryFilter !== 'archive' && (
          <div
            className="bottom-bar-enhanced flex-shrink-0 z-[100] backdrop-blur-md shadow-sm border-t border-gray-200/50 w-full"
            style={{
              background: `linear-gradient(to top, ${zoneColor}20, ${zoneColor}10, rgba(255, 255, 255, 0.2))`
            }}
          >
            <div className="w-full flex items-center px-3 sm:px-4 lg:px-6 py-4 gap-2">
              {/* Category buttons with horizontal scroll */}
              <div
                className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              >
                <div className="flex gap-2 min-w-max px-1">
                  {mainCategories.map((category, index) => {
                    const hasActiveSong = finalSongData.some((song: any) => song.category === category && song.isActive);
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`flex-shrink-0 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-200 text-center whitespace-nowrap category-button ${hasActiveSong
                          ? 'bg-green-600 text-white border-2 border-green-700 shadow-md'
                          : activeCategory === category
                            ? 'text-white shadow-md'
                            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
                          }`}
                        style={activeCategory === category && !hasActiveSong ? {
                          backgroundColor: zoneColor,
                          boxShadow: `0 4px 6px -1px ${zoneColor}40, 0 2px 4px -1px ${zoneColor}20`
                        } : {}}
                      >
                        <span className="block leading-tight">{category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )
      }

      {/* Category Filter Drawer */}
      {
        isCategoryDrawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
              onClick={() => setIsCategoryDrawerOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 animate-slide-up modal-bottom-safe">
              <div className="px-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
                  <button
                    onClick={() => setIsCategoryDrawerOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Total Songs Count */}
                <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">{finalSongData.length} Total Scheduled Songs</p>
                </div>

                {/* Category Options */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {otherCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeCategory === category
                        ? 'bg-purple-100 border-2 border-purple-300 text-purple-800'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                        }`}
                    >
                      <div className="font-medium text-slate-900 text-sm leading-tight">{category}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-tight">
                        {finalSongData.filter(song => song.category === category).length} songs
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      }

      {/* Song Detail Modal */}
      {
        isSongDetailOpen && selectedSong && (() => {
          // Use realtime song data if available (for instant lyrics updates)
          // Otherwise fall back to the song from finalSongData
          const latestSongData = realtimeSongData || finalSongData.find(s => s.id === selectedSong.id) || selectedSong;



          return (
            <SongDetailModal
              selectedSong={latestSongData}
              isOpen={isSongDetailOpen}
              onClose={handleCloseSongDetail}
              currentFilter={activeFilter}
              songs={finalSongData}
              onSongChange={(newSong) => {
                setSelectedSong(newSong);
                // Don't auto-play here since the modal handles it
              }}
            />
          );
        })()
      }

    </div >
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <PraiseNightPageContent />
    </Suspense>
  );
}