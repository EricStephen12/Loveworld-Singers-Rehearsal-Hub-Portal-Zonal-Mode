"use client";

import React, { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { sanitizeImageUrl } from '@/utils/image-utils';

import { Clock, Music,  Play, X, Archive, BookOpen, Piano, HandMetal, Volume2, SkipForward, Heart, Sparkles } from "lucide-react";

import SongDetailModal from "@/components/SongDetailModal";
import { ScreenHeader } from "@/components/ScreenHeader";
import SharedDrawer from "@/components/SharedDrawer";
import CustomLoader from "@/components/CustomLoader";
import { PraiseNightSong, PraiseNight } from "@/types/supabase";
import { ArchiveSearch } from "@/components/praise-night/ArchiveSearch";
import { ArchiveCategoryGrid } from "@/components/praise-night/ArchiveCategoryGrid";
import { ArchiveProgramList } from "@/components/praise-night/ArchiveProgramList";
import { GlobalArchiveResults } from "@/components/praise-night/GlobalArchiveResults";
import { PraiseNightHeader } from "@/components/praise-night/PraiseNightHeader";
import { PraiseNightEmptyState } from "@/components/praise-night/PraiseNightEmptyState";
import { PraiseNightBanner } from "@/components/praise-night/PraiseNightBanner";
import { PraiseNightQuickActions } from "@/components/praise-night/PraiseNightQuickActions";
import { PraiseNightStatusFilter } from "@/components/praise-night/PraiseNightStatusFilter";
import { PraiseNightSongList } from "@/components/praise-night/PraiseNightSongList";
import { PraiseNightCategoryDrawer } from "@/components/praise-night/PraiseNightCategoryDrawer";
import { PraiseNightCategoryBar } from "@/components/praise-night/PraiseNightCategoryBar";
import { PraiseNightActiveWidget } from "@/components/praise-night/PraiseNightActiveWidget";
import { PraiseNightSearchResults } from "@/components/praise-night/PraiseNightSearchResults";
import { useRealtimeData } from "@/hooks/useRealtimeData";

import { useRealtimeSong } from "@/hooks/useRealtimeSong";
import { usePraiseNightSongsData } from "@/hooks/usePraiseNightSongsData";
import { FirebaseMetadataService } from "@/lib/firebase-metadata-service";
import { useZone } from '@/hooks/useZone';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';
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
  const { currentZone, userRole, isInitialized, isZoneCoordinator } = useZone();
  const categoryFilter = searchParams?.get('category');
  const pageParam = searchParams?.get('page');
  const songParam = searchParams?.get('song');
  const { currentSong, isPlaying, setCurrentSong, play, isLoading, hasError, audioRef } = useAudio();

  // Modal states
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [isSongDetailOpen, setIsSongDetailOpen] = useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);
  
  // Ref to track if song selection was initiated internally (to prevent URL sync bounce)
  const internalSongChangeRef = useRef<string | null>(null);

  // Navigation state restoration
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

  // Save navigation state whenever category changes
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


  // Use real-time zone-aware data for instant updates
  const { user, profile, isProfileLoading, signOut } = useAuth();
  const { pages: allPraiseNights, loading, error, getCurrentPage, getCurrentSongs, refreshData } = useRealtimeData(currentZone?.id, user?.uid);
  const [currentPraiseNight, setCurrentPraiseNightState] = useState<PraiseNight | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debug dropdown state
  useEffect(() => {
    if (showDropdown) {

    }
  }, [showDropdown, categoryFilter]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [selectedPageCategory, setSelectedPageCategory] = useState<string | null>(null);
  const [pageCategories, setPageCategories] = useState<any[]>([]);
  const [loadingPageCategories, setLoadingPageCategories] = useState(true);

  // Archive search
  const [allArchiveSongs, setAllArchiveSongs] = useState<PraiseNightSong[]>([]);
  const [isGlobalSearchLoading, setIsGlobalSearchLoading] = useState(false);
  const [hasLoadedAllSongs, setHasLoadedAllSongs] = useState(false);

  // Load songs on demand like admin does
  const [allSongsFromFirebase, setAllSongsFromFirebase] = useState<PraiseNightSong[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  // Effect to clear search when category changes
  useEffect(() => {
    setArchiveSearchQuery('');
  }, [selectedPageCategory]);

  const [showActiveMenu, setShowActiveMenu] = useState(false);

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
 console.error(' Error loading page categories:', error);
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
      filtered = filtered.filter(praiseNight => praiseNight.pageCategory === selectedPageCategory);
    }

    // Filter by archive search query if viewing archive details (Threshold: 2 chars)
    if (categoryFilter === 'archive' && archiveSearchQuery.trim().length >= 2 && selectedPageCategory) {
      const query = archiveSearchQuery.toLowerCase();
      filtered = filtered.filter(praiseNight => 
        praiseNight.name?.toLowerCase().includes(query) || 
        praiseNight.date?.toLowerCase().includes(query)
      );
    }

    // Exclude subgroups and sort by creation date (newest first)
    return filtered
      .filter(pn => pn.scope !== 'subgroup')
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [allPraiseNights, categoryFilter, selectedPageCategory, loading, archiveSearchQuery]);

  // Deciding which praise nights to display
  const displayedPraiseNights = filteredPraiseNights;

  // Global search implementation: Fetch all songs for the zone if searching in top-level Archive
  useEffect(() => {
    const fetchAllSongsForSearch = async () => {
      // Only trigger if: 
      // 1. In Archive mode
      // 2. No specific page is selected (top-level search)
      // 3. There is a search query
      // 4. We haven't loaded all songs yet
      if (
        categoryFilter === 'archive' && 
        !pageParam && 
        archiveSearchQuery.trim().length >= 1 && 
        !hasLoadedAllSongs && 
        currentZone?.id
      ) {
        setIsGlobalSearchLoading(true);
        try {
          const songs = await PraiseNightSongsService.getAllSongs(currentZone.id);
          setAllArchiveSongs(songs);
          setHasLoadedAllSongs(true);
        } catch (error) {
  console.error('Error fetching global archive songs:', error);
        } finally {
          setIsGlobalSearchLoading(false);
        }
      }
    };

    fetchAllSongsForSearch();
  }, [categoryFilter, pageParam, archiveSearchQuery, hasLoadedAllSongs, currentZone?.id]);

  // Compute global search results
  const globalSearchResults = useMemo(() => {
    if (categoryFilter !== 'archive' || pageParam || archiveSearchQuery.trim().length < 1) {
      return [];
    }

    const query = archiveSearchQuery.toLowerCase().trim();

    // 1. Find matching programs (pages)
    const matchingPages = allPraiseNights.filter(page => {
      if (page.category !== 'archive') return false;
      const name = page.name?.toLowerCase() || '';
      const date = page.date?.toLowerCase() || '';
      const loc = page.location?.toLowerCase() || '';
      return name.includes(query) || date.includes(query) || loc.includes(query);
    }).map(page => ({
      ...page,
      type: 'page' as const
    }));

    // 2. Filter allArchiveSongs matching the search query
    const matchingSongs = allArchiveSongs.filter(song => {
      // Basic text matching
      const matchesQuery = 
        song.title?.toLowerCase().includes(query) ||
        song.writer?.toLowerCase().includes(query) ||
        song.leadSinger?.toLowerCase().includes(query) ||
        song.lyrics?.toLowerCase().includes(query) ||
        song.conductor?.toLowerCase().includes(query);

      if (!matchesQuery) return false;

      // Ensure it belongs to an archive page (by checking the pages list)
      const parentPage = allPraiseNights.find(p => p.id === song.praiseNightId);
      return parentPage?.category === 'archive';
    }).map(song => {
      // Attach parent page info for display
      const parentPage = allPraiseNights.find(p => p.id === song.praiseNightId);
      return {
        ...song,
        type: 'song' as const,
        parentPageName: parentPage?.name || 'Unknown Program',
        parentPageDate: parentPage?.date || ''
      };
    });

    // Combine results (programs first, then songs)
    return [...matchingPages, ...matchingSongs];
  }, [allPraiseNights, allArchiveSongs, categoryFilter, pageParam, archiveSearchQuery]);

  // Preload data for instant access
  // No preloading needed - data loads fresh on each request

  // Refresh data when page becomes visible (after admin updates)
  // Refresh data when page becomes visible (after admin updates)
  useEffect(() => {
    // OPTIMIZATION: Disabled aggressive visibility refresh to save costs.
    // The useRealtimeData hook now handles TTL caching internally.
    // Manual pull-to-refresh is available if user needs instant update.

    /* 
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        refreshData();

        // Also re-initialize safe area when page becomes visible
        const { SafeAreaManager } = await import('@/utils/safeAreaManager');
        const safeAreaManager = SafeAreaManager.getInstance();
        safeAreaManager.recalculate();
      }
    };

    const handleFocus = async () => {
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

  // Pre-rehearsal access
  useEffect(() => {
    // Wait for zone and profile initialization before enforcing security
    if (!isInitialized || isProfileLoading) return;

    if (categoryFilter === 'pre-rehearsal') {
      const isHQ = currentZone ? isHQGroup(currentZone.id) : false;
      const hasAccess = isZoneCoordinator || profile?.can_access_pre_rehearsal === true;

      // 1. HQ is always hidden/redirected
      // 2. Others must have permission
      if (isHQ || !hasAccess) {
 console.warn(' Access Denied to Pre-Rehearsal category');
        router.replace('/pages/rehearsals');
      }
    }
  }, [categoryFilter, currentZone, isZoneCoordinator, profile, router]);

  // Archive access
  useEffect(() => {
    // Wait for zone and profile initialization before enforcing security
    if (!isInitialized || isProfileLoading) return;

    if (categoryFilter === 'archive') {
      const isSpecialZone = 
        currentZone?.id === 'zone-president' || 
        currentZone?.id === 'zone-president-2' ||
        currentZone?.id === 'zone-director' || 
        currentZone?.id === 'zone-oftp' ||
        currentZone?.id === 'zone-oftd';

      const isAdmin = 
        profile?.role === 'admin' || 
        profile?.role === 'boss' || 
        userRole === 'hq_admin' || 
        userRole === 'super_admin' || 
        userRole === 'boss';

      const hasAccess = isSpecialZone || isZoneCoordinator || isAdmin;

      if (!hasAccess) {
        console.warn(' Access Denied to Archive category');
        router.replace('/pages/rehearsals');
      }
    }
  }, [categoryFilter, currentZone, isZoneCoordinator, profile, userRole, router]);

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
        if (targetPage.scope === 'subgroup') {
          router.replace(`/pages/subgroup-rehearsal?id=${targetPage.id}`);
          return;
        }
        setCurrentPraiseNightState(targetPage);

      } else {

      }
    }
  }, [pageParam, allPraiseNights]);

  // Handle song parameter from URL
  useEffect(() => {
    if (currentPraiseNight && allSongsFromFirebase.length > 0) {
      const decodedUrlSong = songParam ? decodeURIComponent(songParam) : null;
      
      // If we just changed the song internally, and the URL hasn't caught up yet,
      // ignore any mismatch to prevent the "bounce-back" glitch.
      if (internalSongChangeRef.current && internalSongChangeRef.current !== decodedUrlSong) {
        return;
      }
      
      // If the URL has caught up (or we aren't waiting for it), clear the ref
      if (internalSongChangeRef.current === decodedUrlSong) {
        internalSongChangeRef.current = null;
      }

      if (songParam) {
        const targetSong = allSongsFromFirebase.find(song => song.title === decodedUrlSong);

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






  // Reset filter to 'heard' only when switching to a different page (not when just loading)
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
    return sanitizeImageUrl(currentPraiseNight?.bannerImage, 'banner');
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

  // Refresh functionality (clears cache but preserves auth)
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

  // Handle song click
  const handleSongClick = (song: any, index: number) => {
    // Track internal change to prevent URL sync bounce
    internalSongChangeRef.current = song.title;
    
    // Update URL with song parameter and page parameter for global search
    const params = new URLSearchParams(window.location.search);
    params.set('song', song.title);
    
    //  Global search context fix: If song has a praiseNightId and it's different from current
    if (song.praiseNightId && song.praiseNightId !== currentPraiseNight?.id) {
      params.set('page', song.praiseNightId);
    }
    
    router.push(`?${params.toString()}`);

    // Dispatch event to hide mini player
    window.dispatchEvent(new CustomEvent('songDetailOpen'));
  };

  // Handle song card click when outside modal - opens modal AND updates URL
  const handleSongSwitch = (song: any, index: number) => {
    // Track internal change to prevent URL sync bounce
    internalSongChangeRef.current = song.title;

    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set('song', song.title);
    
    //  Global search context fix: If song has a praiseNightId and it's different from current
    if (song.praiseNightId && song.praiseNightId !== currentPraiseNight?.id) {
      params.set('page', song.praiseNightId);
    }
    
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
      if (allSongsFromFirebase.length === 0) {
        setSongsLoading(true);
      }
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

  // REALTIME SONG UPDATES: Subscribe to individual song changes
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


  // Use custom hook for song data processing
  const {
    songCategories,
    categoriesWithActiveSongs,
    mainCategories,
    filteredSongs,
    categoryCounts
  } = usePraiseNightSongsData({
    finalSongData,
    activeCategory,
    activeFilter,
    currentPraiseNight,
    setActiveCategory
  });

  const categoryHeardCount = categoryCounts.heard;
  const categoryUnheardCount = categoryCounts.unheard;
  const categoryTotalCount = categoryCounts.total;

  // No more FAB categories - all moved to main bar
  const otherCategories: string[] = [];

  const switchPraiseNight = (praiseNight: PraiseNight) => {
    if (praiseNight.scope === 'subgroup') {
      router.push(`/pages/subgroup-rehearsal?id=${praiseNight.id}`);
      return;
    }
    setCurrentPraiseNightState(praiseNight);
    setShowDropdown(false);
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set('page', praiseNight.id.toString());
    params.delete('song'); // Clear song when switching page
    router.push(`?${params.toString()}`);
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
  // SPECIAL CASE: Don't show global empty state if we are in 'archive' and have categories or search results
  const isArchiveBrowsing = categoryFilter === 'archive' && !pageParam && (pageCategories.length > 0 || archiveSearchQuery.trim().length > 0);
  
  if (!loading && (!allPraiseNights || allPraiseNights.length === 0 || (filteredPraiseNights.length === 0 && !isArchiveBrowsing))) {
    return (
      <PraiseNightEmptyState 
        categoryFilter={categoryFilter}
        zoneColor={zoneColor}
      />
    );
  }

  // Show loading screen while data is being fetched OR restoration is pending
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
        
        }
      `}</style>

        {/* Fixed Header - Full Width */}
        <PraiseNightHeader 
          categoryFilter={categoryFilter}
          pageParam={pageParam}
          currentPraiseNight={currentPraiseNight}
          selectedPageCategory={selectedPageCategory}
          setSelectedPageCategory={setSelectedPageCategory}
          archiveSearchQuery={archiveSearchQuery}
          setArchiveSearchQuery={setArchiveSearchQuery}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          timeLeft={timeLeft}
          formatNumber={formatNumber}
          displayedPraiseNights={displayedPraiseNights}
          switchPraiseNight={switchPraiseNight}
          loading={loading}
          searchInputRef={searchInputRef}
        />

        <PraiseNightSearchResults 
          isSearchOpen={isSearchOpen}
          searchQuery={searchQuery}
          typedSearchResults={typedSearchResults}
          finalSongData={finalSongData}
          handleSongClick={handleSongClick}
          setActiveCategory={setActiveCategory}
          setIsSearchOpen={setIsSearchOpen}
          setSearchQuery={setSearchQuery}
        />

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch">
          <div className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-4 relative mobile-content-with-bottom-nav">            {/* Archive Cards Grid - Special layout for archive category */}
            {categoryFilter === 'archive' && !pageParam ? (
              <div className="mb-6 px-1">
                
                {/* Archive Search & Breadcrumbs */}
                <ArchiveSearch 
                  selectedPageCategory={selectedPageCategory}
                  setSelectedPageCategory={setSelectedPageCategory}
                  archiveSearchQuery={archiveSearchQuery}
                  setArchiveSearchQuery={setArchiveSearchQuery}
                />

                <GlobalArchiveResults 
                  archiveSearchQuery={archiveSearchQuery}
                  isGlobalSearchLoading={isGlobalSearchLoading}
                  globalSearchResults={globalSearchResults}
                  pageCategories={pageCategories}
                  handleSongClick={handleSongClick}
                />

                {/* Show skeleton while loading page categories */}
                {loadingPageCategories && !selectedPageCategory && !archiveSearchQuery.trim() && (
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
                {!loadingPageCategories && !selectedPageCategory && (pageCategories.length > 0 || archiveSearchQuery.trim().length > 0) && (
                  <ArchiveCategoryGrid 
                    pageCategories={pageCategories}
                    archiveSearchQuery={archiveSearchQuery}
                    allPraiseNights={allPraiseNights}
                    setSelectedPageCategory={setSelectedPageCategory}
                  />
                )}

                <ArchiveProgramList 
                  loading={loading}
                  loadingPageCategories={loadingPageCategories}
                  selectedPageCategory={selectedPageCategory}
                  pageCategories={pageCategories}
                  filteredPraiseNights={filteredPraiseNights}
                  displayedPraiseNights={displayedPraiseNights}
                  currentPraiseNight={currentPraiseNight}
                  categoryFilter={categoryFilter}
                  archiveSearchQuery={archiveSearchQuery}
                  setArchiveSearchQuery={setArchiveSearchQuery}
                  setSelectedPageCategory={setSelectedPageCategory}
                />

                {!loadingPageCategories && pageCategories.length === 0 && (
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
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(categoryFilter !== 'archive' || !!pageParam) && currentPraiseNight && (
                  <PraiseNightBanner ecardSrc={ecardSrc} />
                )}

                {(categoryFilter !== 'archive' || !!pageParam) && currentPraiseNight && filteredPraiseNights.length > 0 && !(categoryFilter === 'pre-rehearsal' && filteredPraiseNights.length === 0) && (
                  <PraiseNightQuickActions />
                )}

                {/* Status Filter buttons/pills with category-specific count - Show for archive individual pages */}
                {currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && (
                  <PraiseNightStatusFilter 
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    activeCategory={activeCategory}
                    categoryHeardCount={categoryHeardCount}
                    categoryUnheardCount={categoryUnheardCount}
                  />
                )}

                {/* Song Title Cards - Scrollable - Show for archive individual pages */}
                {currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && (
                  <PraiseNightSongList 
                    songsLoading={songsLoading}
                    filteredSongs={filteredSongs}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    activeCategory={activeCategory}
                    categoryTotalCount={categoryTotalCount}
                    categoryHeardCount={categoryHeardCount}
                    categoryUnheardCount={categoryUnheardCount}
                    activeFilter={activeFilter}
                    zoneColor={zoneColor}
                    currentPraiseNight={currentPraiseNight}
                    handleSongClick={handleSongClick}
                  />
                )}
              </div>
            )}

            {/* Add bottom padding to prevent content from being hidden behind sticky categories and safe areas */}
            <div className="h-20"></div> {/* Spacer for fixed bottom elements */}
          </div>
        </div>
        {/* End of Scrollable Content */}


      < SharedDrawer
        open={isMenuOpen}
        onClose={toggleMenu}
        title="Menu"
        items={menuItems}
        key={`drawer-${categoryFilter}`} // Force re-render when category changes
      />

      <PraiseNightCategoryBar 
        categoryFilter={categoryFilter}
        pageParam={pageParam}
        mainCategories={mainCategories}
        activeCategory={activeCategory}
        handleCategorySelect={handleCategorySelect}
        finalSongData={finalSongData}
        zoneColor={zoneColor}
      />

      {/* Category Filter Drawer */}
      <PraiseNightCategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        otherCategories={otherCategories}
        activeCategory={activeCategory}
        handleCategorySelect={handleCategorySelect}
        finalSongData={finalSongData}
      />

      {/* Floating Active Song Widget */}
      <PraiseNightActiveWidget 
        finalSongData={finalSongData}
        isSongDetailOpen={isSongDetailOpen}
        showActiveMenu={showActiveMenu}
        setShowActiveMenu={setShowActiveMenu}
        handleSongClick={handleSongClick}
      />

      {/* Song Detail Modal */}
      {
        isSongDetailOpen && selectedSong && (() => {
          // Use realtime song data if available AND it matches the selected song (prevents stale data during transitions)
          // Otherwise fall back to the song from finalSongData
          const matchingRealtimeData = realtimeSongData && realtimeSongData.id === selectedSong.id ? realtimeSongData : null;
          const latestSongData = matchingRealtimeData || finalSongData.find(s => s.id === selectedSong.id) || selectedSong;

          return (
            <SongDetailModal
              selectedSong={latestSongData}
              isOpen={isSongDetailOpen}
              onClose={handleCloseSongDetail}
              currentFilter={activeFilter}
              songs={finalSongData}
              activeCategory={activeCategory}
              onSongChange={(newSong) => {
                // Track internal change to prevent URL sync bounce
                internalSongChangeRef.current = newSong.title;
                setSelectedSong(newSong);

                // Sync URL with the new song to prevent "bounce back" glitch from URL-to-state effect
                const params = new URLSearchParams(window.location.search);
                params.set('song', newSong.title);
                // Use replace to avoid bloating history during internal modal navigation
                router.replace(`?${params.toString()}`, { scroll: false });
                
                // Don't auto-play here since the modal handles it
              }}
            />
          );
        })()}
    </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <PraiseNightPageContent />
    </Suspense>
  );
}