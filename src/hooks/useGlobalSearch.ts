import { useState, useMemo } from 'react';
import { useRealtimeData } from './useRealtimeData';
import { PraiseNightSong, PraiseNight } from '@/types/supabase';

export interface SearchResult {
  id: string;
  type: 'song' | 'page' | 'category';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  pageId?: string;
  category?: string;
  status?: 'heard' | 'unheard';
}

export function useGlobalSearch() {
  const { pages } = useRealtimeData();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search through all pages
    pages.forEach(page => {
      // Search page names
      if (page.name.toLowerCase().includes(query)) {
        results.push({
          id: `page-${page.id}`,
          type: 'page',
          title: page.name,
          subtitle: 'Praise Night Event',
          description: `${page.location} • ${page.date}`,
          url: `/pages/praise-night?page=${page.id}`,
          pageId: page.id
        });
      }

      // Search songs within each page
      page.songs.forEach(song => {
        const matchesTitle = song.title.toLowerCase().includes(query);
        const matchesWriter = song.writer?.toLowerCase().includes(query);
        const matchesLeadSinger = song.leadSinger?.toLowerCase().includes(query);
        const matchesConductor = song.conductor?.toLowerCase().includes(query);
        const matchesCategory = song.category.toLowerCase().includes(query);
        const matchesKey = song.key?.toLowerCase().includes(query);
        const matchesLyrics = song.lyrics?.toLowerCase().includes(query);
        const matchesSolfas = song.solfas?.toLowerCase().includes(query);

        if (matchesTitle || matchesWriter || matchesLeadSinger || matchesConductor || matchesCategory || matchesKey || matchesLyrics || matchesSolfas) {
          let matchReason = '';
          if (matchesTitle) matchReason = 'Song Title';
          else if (matchesWriter) matchReason = `Writer: ${song.writer}`;
          else if (matchesLeadSinger) matchReason = `Lead Singer: ${song.leadSinger}`;
          else if (matchesConductor) matchReason = `Conductor: ${song.conductor}`;
          else if (matchesCategory) matchReason = `Category: ${song.category}`;
          else if (matchesKey) matchReason = `Key: ${song.key}`;
          else if (matchesLyrics) matchReason = 'Lyrics Content';
          else if (matchesSolfas) matchReason = 'Solfas Content';

          results.push({
            id: `song-${song.title}-${page.id}`,
            type: 'song',
            title: song.title,
            subtitle: matchReason,
            description: `${page.name} • ${song.category} • ${song.status}`,
            url: `/pages/praise-night?page=${page.id}&song=${encodeURIComponent(song.title)}`,
            pageId: page.id,
            category: song.category,
            status: song.status
          });
        }
      });

      // Search categories
      const categories = [...new Set(page.songs.map(song => song.category))];
      categories.forEach(category => {
        if (category.toLowerCase().includes(query)) {
          const songsInCategory = page.songs.filter(song => song.category === category);
          results.push({
            id: `category-${category}-${page.id}`,
            type: 'category',
            title: category,
            subtitle: 'Song Category',
            description: `${page.name} • ${songsInCategory.length} songs`,
            url: `/pages/praise-night?page=${page.id}&category=${encodeURIComponent(category)}`,
            pageId: page.id,
            category: category
          });
        }
      });
    });

    // Sort results by relevance
    return results.sort((a, b) => {
      // Exact matches first
      const aExact = a.title.toLowerCase() === query;
      const bExact = b.title.toLowerCase() === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Then by type priority (songs > pages > categories)
      const typePriority = { song: 0, page: 1, category: 2 };
      const aPriority = typePriority[a.type];
      const bPriority = typePriority[b.type];
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Then alphabetically
      return a.title.localeCompare(b.title);
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, pages]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    hasResults: searchResults.length > 0
  };
}