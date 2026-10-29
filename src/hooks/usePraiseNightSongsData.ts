"use client";

import { useMemo, useEffect } from 'react';
import { Music, Sparkles, BookOpen, Clock, Play, SkipForward, Volume2, HandMetal, Piano, Heart } from 'lucide-react';

interface UsePraiseNightSongsDataProps {
  finalSongData: any[];
  activeCategory: string;
  activeFilter: 'heard' | 'unheard';
  currentPraiseNight: any;
  setActiveCategory: (category: string) => void;
}

export const usePraiseNightSongsData = ({
  finalSongData,
  activeCategory,
  activeFilter,
  currentPraiseNight,
  setActiveCategory
}: UsePraiseNightSongsDataProps) => {
  // Helper function to extract all categories from a song (matching admin app)
  const getSongAllCategories = (song: any): string[] => {
    const result = new Set<string>();
    if (song?.category && typeof song.category === 'string' && song.category.trim()) {
      result.add(song.category.trim());
    }
    if (Array.isArray(song?.categories)) {
      song.categories.forEach((c: any) => {
        if (typeof c === 'string' && c.trim()) result.add(c.trim());
      });
    }
    const rawCats = song?.audioUrls?._categories;
    if (Array.isArray(rawCats)) {
      rawCats.forEach((c: any) => {
        if (typeof c === 'string' && c.trim()) result.add(c.trim());
      });
    }
    return Array.from(result);
  };

  // Helper function to check if song belongs to category
  const songBelongsToCategory = (song: any, targetCategory: string) => {
    const cats = getSongAllCategories(song);
    return cats.some(c => c.trim().toLowerCase() === targetCategory.trim().toLowerCase());
  };

  // Song categories - get from Supabase data
  const songCategories = useMemo(() => {
    const songsToUse = finalSongData.length > 0 ? finalSongData : (currentPraiseNight?.songs || []);
    if (songsToUse.length === 0) return [];

    const allCategories = new Set<string>();
    songsToUse.forEach((song: any) => {
      getSongAllCategories(song).forEach(cat => allCategories.add(cat));
    });

    return Array.from(allCategories);
  }, [finalSongData, currentPraiseNight?.songs]);

  // Categories that currently have at least one active song
  const categoriesWithActiveSongs = useMemo(() => {
    const activeCategories = finalSongData
      .filter((song: any) => song.isActive && song.category)
      .map((song: any) => song.category);
    return Array.from(new Set(activeCategories));
  }, [finalSongData]);

  // All categories sorted (Active first, then manual order, then alphabetical)
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

  // Filter songs based on selected category and status
  const filteredSongs = useMemo(() => {
    return finalSongData.filter(song => {
      const matchesCategory = songBelongsToCategory(song, activeCategory);
      const matchesStatus = song.status === activeFilter;
      return matchesCategory && matchesStatus;
    }).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  }, [finalSongData, activeCategory, activeFilter]);

  // Get counts for current category
  const categoryCounts = useMemo(() => {
    const heard = finalSongData.filter(song => {
      return songBelongsToCategory(song, activeCategory) && song.status === 'heard';
    }).length;

    const unheard = finalSongData.filter(song => {
      return songBelongsToCategory(song, activeCategory) && song.status === 'unheard';
    }).length;

    return {
      heard,
      unheard,
      total: heard + unheard
    };
  }, [finalSongData, activeCategory]);

  // Prefer auto-selecting a category that has active songs; otherwise fall back to first
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
  }, [activeCategory, mainCategories, categoriesWithActiveSongs, songCategories, setActiveCategory]);

  return {
    songCategories,
    categoriesWithActiveSongs,
    mainCategories,
    filteredSongs,
    categoryCounts,
    songBelongsToCategory
  };
};
