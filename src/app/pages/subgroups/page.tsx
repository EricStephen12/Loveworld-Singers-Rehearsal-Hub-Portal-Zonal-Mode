"use client";

import React, { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { sanitizeImageUrl } from '@/utils/image-utils';

import { ChevronRight, ChevronLeft, Search, Clock, Music, User, BookOpen, Timer, Mic, ChevronDown, ChevronUp, Play, X, Users, Calendar, Heart, Sparkles, CheckCircle, Info, ArrowLeft, SkipForward, Piano, HandMetal, Volume2, Flag, Archive, RefreshCw, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SongDetailModal from "@/components/SongDetailModal";
import { ScreenHeader } from "@/components/ScreenHeader";
import SharedDrawer from "@/components/SharedDrawer";
import CustomLoader from "@/components/CustomLoader";
import AudioWave from "@/components/AudioWave";
import RehearsalScopeBadge from "@/components/RehearsalScopeBadge";
import { PraiseNightSong, PraiseNight } from "@/types/supabase";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { useRealtimeSong } from "@/hooks/useRealtimeSong";

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
import { useSubGroup } from "@/hooks/useSubGroup";

function SubGroupHubPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentZone, userRole, isInitialized, isZoneCoordinator } = useZone();
  const categoryFilter = searchParams?.get('category');
  const pageParam = searchParams?.get('page');
  const songParam = searchParams?.get('song');
  const { currentSong, isPlaying, setCurrentSong, play, isLoading, hasError, audioRef } = useAudio();

  // 🏥 Song detail modal states
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [isSongDetailOpen, setIsSongDetailOpen] = useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);
  
  const internalSongChangeRef = useRef<string | null>(null);

  // Navigation State Restoration
  useEffect(() => {
    if (isInitialized && !categoryFilter && currentZone?.id) {
      const savedState = navigationStateManager.getNavigationState(`subgroup-${currentZone.id}`);

      if (savedState && savedState.path === '/pages/subgroups' && savedState.query.category) {
        const restoredUrl = navigationStateManager.buildUrlFromState(savedState);
        router.replace(restoredUrl);
      } else {
        router.replace('/pages/subgroups?category=ongoing');
      }
    }
  }, [isInitialized, categoryFilter, currentZone?.id, router]);

  // Save navigation state
  useEffect(() => {
    if (categoryFilter && currentZone?.id) {
      const query: Record<string, string> = { category: categoryFilter };
      if (pageParam) query.page = pageParam;
      navigationStateManager.saveNavigationState('/pages/subgroups', query, `subgroup-${currentZone.id}`);
    }
  }, [categoryFilter, pageParam, currentZone?.id]);

  const { isSubGroupCoordinator, coordinatedSubGroups, isLoading: subGroupLoading } = useSubGroup();

  useFeatureTracking('subgroup_hub');

  const zoneColor = currentZone?.themeColor || '#9333EA';

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

  const { user, profile, isProfileLoading, signOut } = useAuth();
  const { pages: allPraiseNights, loading, error, getCurrentSongs, refreshData } = useRealtimeData(currentZone?.id, user?.uid);
  const [currentPraiseNight, setCurrentPraiseNightState] = useState<PraiseNight | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [selectedPageCategory, setSelectedPageCategory] = useState<string | null>(null);
  const [pageCategories, setPageCategories] = useState<any[]>([]);
  const [loadingPageCategories, setLoadingPageCategories] = useState(true);
  const [allArchiveSongs, setAllArchiveSongs] = useState<PraiseNightSong[]>([]);
  const [isGlobalSearchLoading, setIsGlobalSearchLoading] = useState(false);
  const [hasLoadedAllSongs, setHasLoadedAllSongs] = useState(false);
  const [allSongsFromFirebase, setAllSongsFromFirebase] = useState<PraiseNightSong[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [showActiveMenu, setShowActiveMenu] = useState(false);

  useEffect(() => {
    const loadPageCategories = async () => {
      if (!currentZone?.id) return;
      const cacheKey = `subgroup-page-categories-${currentZone.id}`;
      const cached = lowDataOptimizer.get(cacheKey);
      if (cached) {
        setPageCategories(cached);
        setLoadingPageCategories(false);
        return;
      }
      setLoadingPageCategories(true);
      try {
        const categories = await ZoneDatabaseService.getPageCategories(currentZone.id);
        setPageCategories(categories);
        lowDataOptimizer.set(cacheKey, categories);
      } catch (error) {
        console.error('Error loading page categories:', error);
        setPageCategories([]);
      } finally {
        setLoadingPageCategories(false);
      }
    };
    loadPageCategories();
  }, [currentZone?.id]);

  const filteredSubGroupPages = useMemo(() => {
    if (loading || !allPraiseNights) return [];
    let filtered = allPraiseNights;
    
    // EXCLUSIVITY: Only show subgroup scoped pages
    filtered = filtered.filter(pn => pn.scope === 'subgroup');

    if (categoryFilter) {
      filtered = filtered.filter(praiseNight => praiseNight.category === categoryFilter);
    } else {
      filtered = filtered.filter(praiseNight => praiseNight.category !== 'unassigned');
    }

    if (selectedPageCategory) {
      filtered = filtered.filter(praiseNight => praiseNight.pageCategory === selectedPageCategory);
    }

    if (categoryFilter === 'archive' && archiveSearchQuery.trim() !== '' && selectedPageCategory) {
      const query = archiveSearchQuery.toLowerCase();
      filtered = filtered.filter(praiseNight => 
        praiseNight.name?.toLowerCase().includes(query) || 
        praiseNight.date?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allPraiseNights, categoryFilter, selectedPageCategory, loading, archiveSearchQuery]);

  useEffect(() => {
    if (
      categoryFilter === 'archive' && 
      !pageParam && 
      archiveSearchQuery.trim().length >= 2 && 
      !hasLoadedAllSongs && 
      currentZone?.id
    ) {
      setIsGlobalSearchLoading(true);
      try {
        PraiseNightSongsService.getAllSongs(currentZone.id).then(songs => {
          // Filter songs that belong to subgroup pages
          const subGroupPageIds = allPraiseNights.filter(p => p.scope === 'subgroup').map(p => p.id);
          const subgroupSongs = songs.filter(s => subGroupPageIds.includes(s.praiseNightId));
          setAllArchiveSongs(subgroupSongs);
          setHasLoadedAllSongs(true);
        });
      } catch (error) {
        console.error('Error fetching global archive songs:', error);
      } finally {
        setIsGlobalSearchLoading(false);
      }
    }
  }, [categoryFilter, pageParam, archiveSearchQuery, hasLoadedAllSongs, currentZone?.id, allPraiseNights]);

  const globalSearchResults = useMemo(() => {
    if (categoryFilter !== 'archive' || pageParam || archiveSearchQuery.trim().length < 2) return [];
    const query = archiveSearchQuery.toLowerCase().trim();
    return allArchiveSongs.filter(song => {
      const matchesQuery = 
        song.title?.toLowerCase().includes(query) ||
        song.writer?.toLowerCase().includes(query) ||
        song.leadSinger?.toLowerCase().includes(query) ||
        song.lyrics?.toLowerCase().includes(query);
      if (!matchesQuery) return false;
      const parentPage = allPraiseNights.find(p => p.id === song.praiseNightId);
      return parentPage?.category === 'archive' && parentPage?.scope === 'subgroup';
    }).map(song => {
      const parentPage = allPraiseNights.find(p => p.id === song.praiseNightId);
      return { ...song, parentPageName: parentPage?.name || 'Unknown Hub', parentPageDate: parentPage?.date || '' };
    });
  }, [archiveSearchQuery, allArchiveSongs, allPraiseNights, categoryFilter, pageParam]);

  useEffect(() => {
    if (pageParam && filteredSubGroupPages.length > 0) {
      const targetPage = filteredSubGroupPages.find(page => page.id === pageParam);
      if (targetPage) setCurrentPraiseNightState(targetPage);
    }
  }, [pageParam, filteredSubGroupPages]);

  useEffect(() => {
    if (currentPraiseNight && allSongsFromFirebase.length > 0) {
      const decodedUrlSong = songParam ? decodeURIComponent(songParam) : null;
      if (internalSongChangeRef.current && internalSongChangeRef.current !== decodedUrlSong) return;
      if (internalSongChangeRef.current === decodedUrlSong) internalSongChangeRef.current = null;

      if (songParam) {
        const targetSong = allSongsFromFirebase.find(song => song.title === decodedUrlSong);
        if (targetSong && selectedSong?.id !== targetSong.id) {
          const songIndex = allSongsFromFirebase.indexOf(targetSong);
          setSelectedSongIndex(songIndex);
          setSelectedSong({ ...targetSong, imageIndex: songIndex });
          setIsSongDetailOpen(true);
          if (currentSong?.id !== targetSong.id) setCurrentSong(targetSong, false);
        }
      } else if (isSongDetailOpen) {
        setIsSongDetailOpen(false);
        setSelectedSong(null);
      }
    }
  }, [songParam, currentPraiseNight, allSongsFromFirebase, isSongDetailOpen, selectedSong?.id, currentSong?.id, setCurrentSong]);

  useEffect(() => {
    const categoryMismatch = currentPraiseNight && categoryFilter && currentPraiseNight.category !== categoryFilter;
    if (filteredSubGroupPages.length > 0 && (!currentPraiseNight || categoryMismatch) && !pageParam) {
      setCurrentPraiseNightState(filteredSubGroupPages[0]);
    }
  }, [filteredSubGroupPages, currentPraiseNight, pageParam, categoryFilter]);

  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('lyrics');
  const [activeFilter, setActiveFilter] = useState<'heard' | 'unheard'>('heard');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && currentPraiseNight) {
      const unsubscribe = FirebaseMetadataService.subscribeToPraiseNightSongsMetadata(
        currentZone!.id,
        currentPraiseNight.id,
        (timestamp) => {
          getCurrentSongs(currentPraiseNight.id, true).then(songs => {
            setAllSongsFromFirebase(songs);
          });
        }
      );
      return () => unsubscribe();
    }
  }, [currentPraiseNight?.id, currentZone?.id, isInitialized, getCurrentSongs]);

  useEffect(() => {
    if (currentPraiseNight) {
      setSongsLoading(true);
      getCurrentSongs(currentPraiseNight.id, true).then(songs => {
        setAllSongsFromFirebase(songs);
        setSongsLoading(false);
      }).catch(err => {
        console.error('Error loading songs:', err);
        setAllSongsFromFirebase([]);
        setSongsLoading(false);
      });
    }
  }, [currentPraiseNight?.id, getCurrentSongs]);

  const songCategories = useMemo(() => {
    const songsToUse = allSongsFromFirebase.length > 0 ? allSongsFromFirebase : (currentPraiseNight?.songs || []);
    if (songsToUse.length === 0) return [];
    const allCategories: string[] = [];
    songsToUse.forEach(song => {
      if (song.categories && Array.isArray(song.categories)) {
        allCategories.push(...song.categories.filter(cat => cat && cat.trim()));
      } else if (song.category && song.category.trim()) {
        allCategories.push(song.category);
      }
    });
    return [...new Set(allCategories)];
  }, [allSongsFromFirebase, currentPraiseNight?.songs]);

  const categoriesWithActiveSongs = useMemo(() => {
    return allSongsFromFirebase.filter((song: any) => song.isActive && song.category).map((song: any) => song.category);
  }, [allSongsFromFirebase]);

  const mainCategories = useMemo(() => {
    const base = [...songCategories];
    if (base.length === 0) return base;
    const order = currentPraiseNight?.categoryOrder || [];
    return base.sort((a, b) => {
      const aActive = categoriesWithActiveSongs.includes(a);
      const bActive = categoriesWithActiveSongs.includes(b);
      if (aActive !== bActive) return aActive ? -1 : 1;
      const aOrderIndex = order.indexOf(a);
      const bOrderIndex = order.indexOf(b);
      if (aOrderIndex !== -1 && bOrderIndex !== -1) return aOrderIndex - bOrderIndex;
      if (aOrderIndex !== -1) return -1;
      if (bOrderIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [songCategories, categoriesWithActiveSongs, currentPraiseNight?.categoryOrder]);

  const otherCategories: string[] = [];

  useEffect(() => {
    if (!activeCategory) {
      const preferred = mainCategories.find((cat) => categoriesWithActiveSongs.includes(cat));
      if (preferred) setActiveCategory(preferred); else if (songCategories.length > 0) setActiveCategory(songCategories[0]);
    } else if (!songCategories.includes(activeCategory)) {
      const preferred = mainCategories.find((cat) => categoriesWithActiveSongs.includes(cat));
      if (preferred) setActiveCategory(preferred); else if (songCategories.length > 0) setActiveCategory(songCategories[0]); else setActiveCategory('');
    }
  }, [activeCategory, mainCategories, categoriesWithActiveSongs, songCategories]);

  const songBelongsToCategory = (song: any, targetCategory: string) => {
    if (song.categories && Array.isArray(song.categories) && song.categories.length > 0) {
      return song.categories.some((cat: string) => cat.trim() === targetCategory.trim());
    }
    return (song.category || '').trim() === targetCategory.trim();
  };

  const filteredSongs = allSongsFromFirebase.filter(song => {
    return songBelongsToCategory(song, activeCategory) && song.status === activeFilter;
  });

  const categoryHeardCount = allSongsFromFirebase.filter(song => songBelongsToCategory(song, activeCategory) && song.status === 'heard').length;
  const categoryUnheardCount = allSongsFromFirebase.filter(song => songBelongsToCategory(song, activeCategory) && song.status === 'unheard').length;
  const categoryTotalCount = categoryHeardCount + categoryUnheardCount;

  const ecardSrc = useMemo(() => sanitizeImageUrl(currentPraiseNight?.bannerImage, 'banner'), [currentPraiseNight]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleLogout = async () => { try { await signOut(); } catch (err) { console.error('Logout error:', err); } };
  const handleRefresh = async () => { setIsRefreshing(true); try { await handleAppRefresh(); } finally { setIsRefreshing(false); } };
  const menuItems = getMenuItems(handleLogout, handleRefresh, isSubGroupCoordinator);

  const { timeLeft, isLoading: countdownLoading } = useServerCountdown({
    countdownData: currentPraiseNight?.countdown,
    praiseNightId: currentPraiseNight?.id
  });

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setIsCategoryDrawerOpen(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSongClick = (song: any, index: number) => {
    internalSongChangeRef.current = song.title;
    const params = new URLSearchParams(window.location.search);
    params.set('song', song.title);
    if (song.praiseNightId && song.praiseNightId !== currentPraiseNight?.id) params.set('page', song.praiseNightId);
    router.push(`?${params.toString()}`);
    window.dispatchEvent(new CustomEvent('songDetailOpen'));
  };

  const handleCloseSongDetail = () => {
    if (songParam) NavigationManager.handleBack(router); else { setIsSongDetailOpen(false); setSelectedSong(null); }
    window.dispatchEvent(new CustomEvent('songDetailClose'));
  };

  const formatNumber = (num: number) => {
    if (isNaN(num) || num === undefined || num === null) return '00';
    return num < 10 ? `0${num}` : num.toString();
  };

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Use page-specific search hook with actual songs data
  const { searchQuery, setSearchQuery, searchResults, hasResults } = usePageSearch(
    currentPraiseNight ? {
      ...currentPraiseNight,
      songs: allSongsFromFirebase
    } : null
  );

  const typedSearchResults = searchResults as PageSearchResult[];

  const {
    song: realtimeSongDetailData,
  } = useRealtimeSong(currentZone?.id, currentPraiseNight?.id, selectedSong?.id);

  const onHeaderSearchClick = () => {
    setIsSearchOpen(true);
    const el = searchInputRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => el.focus(), 300);
    }
  };

  if (loading && allPraiseNights.length === 0 && !currentPraiseNight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading Subgroup Hub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading Hub</p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
        <ScreenHeader title="Error" showBackButton={true} backPath="/pages/rehearsals" rightImageSrc="/logo.png" />
      </div>
    );
  }

  if (!loading && (!allPraiseNights || allPraiseNights.length === 0 || filteredSubGroupPages.length === 0)) {
    return (
      <div className="h-screen flex flex-col safe-area-bottom overflow-y-auto" style={{ background: `linear-gradient(135deg, ${zoneColor}15, #ffffff)` }}>
        <ScreenHeader
          title={categoryFilter === 'ongoing' ? 'Subgroup Ongoing' : categoryFilter === 'archive' ? 'Subgroup Archives' : 'Subgroup Hub'}
          showBackButton={true} backPath="/pages/rehearsals" rightImageSrc="/logo.png"
        />
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
                <Users className="w-10 h-10 text-purple-600" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2 font-poppins-semibold">
              {categoryFilter === 'ongoing' ? 'No Subgroup Ongoing' :
                categoryFilter === 'archive' ? 'No Subgroup Archives' :
                categoryFilter === 'pre-rehearsal' ? 'No Pre-Rehearsal' :
                  'Subgroup Hub'}
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-6 leading-relaxed font-outfit-medium">
              {categoryFilter === 'ongoing' ? 'Subgroup ongoing sessions will appear here when they are active and ready for rehearsal.' :
                categoryFilter === 'archive' ? 'Subgroup archived sessions will appear here when they are completed and moved to archive.' :
                categoryFilter === 'pre-rehearsal' ? 'Pre-rehearsal sessions will appear here when they are scheduled for preparation.' :
                'Choose a category to get started with your subgroup rehearsal programs.'}
            </p>

            {/* Back Button */}
            <button
              onClick={() => router.push('/pages/rehearsals')}
              className="inline-flex items-center px-6 py-3 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95 shadow-xl shadow-black/10"
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
      </div>
    );
  }

  return (
    <div className="h-screen safe-area-bottom overflow-y-auto" style={{ background: `linear-gradient(135deg, ${zoneColor}12, #fdfbff)` }}>
      <style jsx global>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll 20s linear infinite; width: 200%; }
        .animate-scroll:hover { animation-play-state: paused; }
        .breathe-animation { animation: breathe 2s ease-in-out infinite; }
        @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.95); } }
        .animate-pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
        @keyframes pulse-ring { 0%, 100% { box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.5); } 50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); } }
      `}</style>

      <div className={`h-full flex flex-col transition-all duration-300 ease-out ${isMenuOpen ? 'translate-x-72 scale-[0.88] rounded-2xl shadow-2xl origin-left overflow-hidden' : 'translate-x-0 scale-100 rounded-none'}`} onClick={() => isMenuOpen && setIsMenuOpen(false)}>
        <div className="flex-shrink-0 w-full relative z-[60]">
          <div className="relative bg-white/80 backdrop-blur-xl border-b border-gray-100/50 min-h-[60px] sm:min-h-[70px]">
            <div className={`transition-all duration-300 ease-out ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <ScreenHeader
                title={categoryFilter === 'archive' ? (pageParam ? (currentPraiseNight?.name || 'Archive Hub') : 'Subgroup Archives') : (currentPraiseNight?.name || 'Subgroup Hub')}
                showBackButton={true} backPath={categoryFilter === 'archive' && pageParam ? `/pages/subgroups?category=archive` : "/pages/rehearsals"}
                onBackClick={categoryFilter === 'archive' && !pageParam && selectedPageCategory ? () => { setSelectedPageCategory(null); setArchiveSearchQuery(''); } : undefined}
                showMenuButton={false} rightImageSrc="/logo.png"
                leftButtons={(
                  <div className="flex items-center gap-1.5">
                    {categoryFilter !== 'archive' && !pageParam && (
                      <button onClick={() => setShowDropdown(!showDropdown)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition border border-slate-200">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                    {isSubGroupCoordinator && (
                      <button 
                        onClick={() => router.push('/subgroup-admin')}
                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition border border-indigo-200"
                        title="Subgroup Admin Panel"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                rightButtons={(categoryFilter !== 'archive' || pageParam) && (
                  <button onClick={() => setIsSearchOpen(true)} className="p-2.5 rounded-full hover:bg-gray-100 transition-all">
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                timer={currentPraiseNight && currentPraiseNight.countdown && categoryFilter !== 'archive' && !countdownLoading && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
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
            <div className={`absolute inset-0 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out ${isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 h-full">
                <input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search subgroup songs, artists..." className="w-full text-lg bg-transparent px-0 py-3 text-gray-800 outline-none" />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-2.5 rounded-full hover:bg-gray-100 ml-4">
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="fixed left-0 right-0 top-16 z-[65] bg-white border border-gray-200 shadow-lg max-h-96 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-4 py-2">
              <div className="text-xs text-gray-500 mb-2 font-medium">{searchQuery ? `${typedSearchResults.length} result(s) for "${searchQuery}"` : 'Start typing to search...'}</div>
              {typedSearchResults.length > 0 ? (
                <div className="space-y-1">
                  {typedSearchResults.map((result) => (
                    <button key={result.id} onClick={() => { if (result.type === 'song') { const song = allSongsFromFirebase.find(s => s.title === result.title); if (song) handleSongClick(song, allSongsFromFirebase.indexOf(song)); } else setActiveCategory(result.category || ''); setIsSearchOpen(false); setSearchQuery(''); }} className="w-full text-left block p-3 rounded-xl hover:bg-gray-100 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {result.type === 'song' ? <Music className="w-4 h-4 text-purple-600 flex-shrink-0" /> : <Flag className="w-4 h-4 text-green-600 flex-shrink-0" />}
                            <h4 className="font-medium text-gray-900 text-sm truncate">{result.title}</h4>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : <div className="py-6 text-center"><Search className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">No results found</p></div>}
            </div>
          </div>
        )}

        {showDropdown && categoryFilter !== 'archive' && (
          <>
            <div className="fixed inset-0 bg-black/20 z-[75]" onClick={() => setShowDropdown(false)} />
            <div className="fixed right-3 left-3 sm:right-4 sm:left-auto top-16 z-[80] w-auto sm:w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
              <div className="flex flex-col">
                {filteredSubGroupPages.map((page) => (
                  <button key={page.id} onClick={() => { setCurrentPraiseNightState(page); setShowDropdown(false); const params = new URLSearchParams(window.location.search); params.set('page', page.id.toString()); params.delete('song'); router.push(`?${params.toString()}`); }} className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${page.id === currentPraiseNight?.id ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : ''}`}>
                    <div className="font-semibold text-sm mb-1">{page.name}</div>
                    <div className="text-xs text-slate-600">{page.date}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-3 sm:px-4 py-2 sm:py-4">
            {categoryFilter === 'archive' && !pageParam ? (
              <div className="mb-6 px-1">
                <div className="mb-6 sticky top-0 z-20 bg-transparent pt-2 pb-4">
                  <div className="mb-4 flex items-center gap-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
                    <button onClick={() => { setSelectedPageCategory(null); setArchiveSearchQuery(''); }} className={`font-medium transition-colors flex items-center gap-1.5 ${!selectedPageCategory ? 'text-purple-600' : 'text-slate-500 hover:text-purple-600'}`}>
                      <Archive className="w-4 h-4" /> All Subgroup Archive
                    </button>
                    {selectedPageCategory && <><ChevronRight className="w-4 h-4 text-slate-400" /><span className="font-semibold text-slate-900">{selectedPageCategory}</span></>}
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Search className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-purple-500 transition-colors" /></div>
                    <input type="text" placeholder={selectedPageCategory ? `Search in ${selectedPageCategory}...` : "Search subgroup archive..."} value={archiveSearchQuery} onChange={(e) => setArchiveSearchQuery(e.target.value)} className="block w-full pl-10 pr-10 py-3 border-b border-slate-200/50 bg-transparent outline-none focus:border-purple-400 transition-all font-outfit" />
                    {archiveSearchQuery && <button onClick={() => setArchiveSearchQuery('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"><X className="h-4.5 w-4.5" /></button>}
                  </div>
                </div>

                {!loadingPageCategories && !selectedPageCategory && !archiveSearchQuery.trim() && pageCategories.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pageCategories.map((category) => {
                      const count = allPraiseNights.filter(p => p.category === 'archive' && p.pageCategory === category.name && p.scope === 'subgroup').length;
                      return (
                        <button key={category.id} onClick={() => setSelectedPageCategory(category.name)} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all text-left">
                          <h4 className="text-lg font-semibold text-slate-900 mb-2">{category.name}</h4>
                          <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">{count} Sessions</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {(selectedPageCategory || pageCategories.length === 0) && filteredSubGroupPages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredSubGroupPages.map((page) => (
                      <button key={page.id} onClick={() => router.push(`/pages/subgroups?category=archive&page=${page.id}`)} className="group relative bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden aspect-[4/3] flex flex-col justify-end p-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-80" />
                        {page.bannerImage && <img src={page.bannerImage} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />}
                        <div className="relative z-10 text-left">
                           <h3 className="font-bold text-white text-xs sm:text-sm truncate">{page.name}</h3>
                           <p className="text-[10px] text-white/80 font-medium">{page.date}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {(categoryFilter !== 'archive' || pageParam) && currentPraiseNight && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6 max-w-lg mx-auto shadow-xl shadow-black/5 breathe-animation">
                <div className="relative h-40 sm:h-48">
                  <Image src={ecardSrc} alt="Hub Hub" fill unoptimized={true} className="object-cover" priority />
                </div>
              </div>
            )}

            {(categoryFilter !== 'archive' || !!pageParam) && currentPraiseNight && (
              <div className="mb-8 overflow-hidden -mx-3 px-3">
                <div className="flex items-center gap-3 animate-scroll">
                  {['Songs Schedule', 'Audio Lab', 'Solfas', 'Sheet Music', 'Recordings', 'Archive'].map((label, idx) => (
                    <button key={`${label}-${idx}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 whitespace-nowrap active:scale-95 transition">
                      <Music className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && (
              <div className="mb-6 px-4">
                <div className="flex items-center justify-between gap-4">
                  <button onClick={() => setActiveFilter('heard')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${activeFilter === 'heard' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>HEARD ({categoryHeardCount})</button>
                  <div className="flex-1 text-center truncate"><span className="text-slate-900 text-sm font-black uppercase tracking-widest">{activeCategory}</span></div>
                  <button onClick={() => setActiveFilter('unheard')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${activeFilter === 'unheard' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>UNHEARD ({categoryUnheardCount})</button>
                </div>
              </div>
            )}

            {currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && (
              <div className="space-y-4 px-2">
                {songsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-slate-100"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                            </div>
                          </div>
                          <div className="w-10 h-6 bg-slate-100 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredSongs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 italic bg-white/50 rounded-2xl border border-dashed border-slate-200">
                    <Music className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">No songs found in this category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSongs.map((song, index) => (
                      <div key={song.id} onClick={() => handleSongClick(song, index)} className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex items-center justify-between ${currentSong?.id === song.id ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                             {currentSong?.id === song.id && isPlaying ? <AudioWave className="w-6 h-6 text-purple-600" /> : <Music className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div className="min-w-0">
                             <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate uppercase font-outfit">{song.title}</h4>
                             <p className="text-xs text-slate-500 mt-1 font-medium truncate italic">{song.leadSinger || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="px-2 py-1 bg-purple-50 rounded-lg text-[10px] font-black text-purple-600">
                             {(() => {
                               const count = (song as any).rehearsalCount || 0;
                               if (typeof count === 'string' && count.includes('|')) {
                                 return count.split('|')[0];
                               }
                               return `x${count}`;
                             })()}
                           </div>
                           <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="h-24"></div>
          </div>
        </div>
      </div>

      <SharedDrawer open={isMenuOpen} onClose={toggleMenu} title="Menu" items={menuItems} />

      {currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-xl border-t border-white/20 p-4 bg-white/70 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
           <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                 {mainCategories.map(category => (
                   <button 
                     key={category} 
                     onClick={() => handleCategorySelect(category)}
                     className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === category ? 'text-white shadow-xl scale-105' : 'bg-white/80 text-slate-500 border border-slate-100'}`}
                     style={activeCategory === category ? { backgroundColor: zoneColor } : {}}
                   >
                     {category}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {isSongDetailOpen && selectedSong && (
        <SongDetailModal
          selectedSong={realtimeSongDetailData || allSongsFromFirebase.find(s => s.id === selectedSong.id) || selectedSong}
          isOpen={isSongDetailOpen}
          onClose={handleCloseSongDetail}
          currentFilter={activeFilter}
          songs={allSongsFromFirebase}
          activeCategory={activeCategory}
          onSongChange={(newSong) => {
            internalSongChangeRef.current = newSong.title;
            setSelectedSong(newSong);
            const params = new URLSearchParams(window.location.search);
            params.set('song', newSong.title);
            router.replace(`?${params.toString()}`, { scroll: false });
          }}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <SubGroupHubPageContent />
    </Suspense>
  );
}
