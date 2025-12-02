import { useState, useMemo, useEffect } from 'react';
import { useRealtimeData } from './useRealtimeData';
import { PraiseNightSong, PraiseNight } from '@/types/supabase';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';

export interface HomeSearchResult {
  id: string;
  type: 'song' | 'page' | 'category' | 'feature' | 'faq' | 'about';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  pageId?: string;
  category?: string;
  status?: 'heard' | 'unheard';
  icon?: string;
}

export function useHomeGlobalSearch(zoneId?: string) {
  const { pages } = useRealtimeData(zoneId);
  const [searchQuery, setSearchQuery] = useState('');
  const [allSongs, setAllSongs] = useState<PraiseNightSong[]>([]);
  const [songsLoaded, setSongsLoaded] = useState(false);

  // Load all songs for search - FROM NEW TABLE!
  useEffect(() => {
    // Reset cache when zone changes
    setAllSongs([]);
    setSongsLoaded(false);
  }, [zoneId]);

  useEffect(() => {
    if (!zoneId) {
      console.log('⏳ [Home Search] Waiting for zone to load before fetching songs...');
      return;
    }

    const loadAllSongs = async () => {
      try {
        console.log('🔍 [Home Search] Loading songs for zone:', zoneId);
        const songs = await PraiseNightSongsService.getAllSongs(zoneId);
        console.log('✅ [Home Search] Loaded', songs.length, 'songs for zone', zoneId);
        setAllSongs(songs as any[]);
        setSongsLoaded(true);
      } catch (error) {
        console.error('❌ [Home Search] Error loading songs for search:', error);
        setSongsLoaded(true);
      }
    };

    if (pages.length > 0 && !songsLoaded) {
      loadAllSongs();
    }
  }, [pages.length, songsLoaded, zoneId]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      console.log('🔍 Home Search: No query provided');
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const results: HomeSearchResult[] = [];
    
    console.log('🔍 Home Search: Searching with query:', query, 'in', pages.length, 'pages and', allSongs.length, 'songs');

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
          pageId: page.id,
          icon: 'Calendar'
        });
      }
    });

    // Search through all songs
    allSongs.forEach(song => {
        const matchesTitle = song.title.toLowerCase().includes(query);
        const matchesWriter = song.writer?.toLowerCase().includes(query);
        const matchesLeadSinger = song.leadSinger?.toLowerCase().includes(query);
        const matchesConductor = song.conductor?.toLowerCase().includes(query);
        const matchesCategory = song.category.toLowerCase().includes(query);
        const matchesKey = song.key?.toLowerCase().includes(query);
        const matchesLyrics = song.lyrics?.toLowerCase().includes(query);
        const matchesSolfas = song.solfas?.toLowerCase().includes(query);

        if (matchesTitle || matchesWriter || matchesLeadSinger || matchesConductor || matchesCategory || matchesKey || matchesLyrics || matchesSolfas) {
          // Find the page this song belongs to
          const songPage = pages.find(page => 
            page.id === song.praiseNightId || 
            page.id === song.praiseNightId?.toString() ||
            page.firebaseId === song.praiseNightId
          );

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
            id: `song-${song.title}-${songPage?.id || 'unknown'}`,
            type: 'song',
            title: song.title,
            subtitle: matchReason,
            description: `${songPage?.name || 'Unknown Page'} • ${song.category} • ${song.status}`,
            url: `/pages/praise-night?page=${songPage?.id || 'unknown'}&song=${encodeURIComponent(song.title)}`,
            pageId: songPage?.id || 'unknown',
            category: song.category,
            status: song.status,
            icon: 'Music'
          });
        }
      });

    // Search categories from all songs
    const categories = [...new Set(allSongs.map(song => song.category))];
    categories.forEach(category => {
      if (category.toLowerCase().includes(query)) {
        const songsInCategory = allSongs.filter(song => song.category === category);
        results.push({
          id: `category-${category}`,
          type: 'category',
          title: category,
          subtitle: 'Song Category',
          description: `${songsInCategory.length} songs`,
          url: `/pages/praise-night?category=${encodeURIComponent(category)}`,
          category: category,
          icon: 'Flag'
        });
      }
    });

    // Search app features
    const features = [
      { title: 'Rehearsals', url: '/pages/rehearsals', icon: 'Calendar' },
      { title: 'Profile', url: '/pages/profile', icon: 'User' },
      { title: 'Push Notifications', url: '#', icon: 'Bell' },
      { title: 'Groups', url: '#', icon: 'Users' },
      { title: 'Submit Song', url: '#', icon: 'Music' },
      { title: 'Media', url: '#', icon: 'Play' },
      { title: 'Ministry Calendar', url: '#', icon: 'Calendar' },
      { title: 'Analytics', url: '#', icon: 'BarChart3' },
      { title: 'Customer Support', url: '/pages/support', icon: 'HelpCircle' }
    ];

    features.forEach(feature => {
      if (feature.title.toLowerCase().includes(query)) {
        results.push({
          id: `feature-${feature.title}`,
          type: 'feature',
          title: feature.title,
          subtitle: 'App Feature',
          description: 'Navigate to this feature',
          url: feature.url,
          icon: feature.icon
        });
      }
    });

    // Search FAQ content
    const faqItems = [
      { question: 'How do I join a rehearsal?', answer: 'Check the Rehearsals section for upcoming sessions and register through the calendar.' },
      { question: 'Where can I find song lyrics?', answer: 'Access song lyrics and audio resources in the AudioLabs section.' },
      { question: 'How do I get support?', answer: 'Use the Support section or contact your ministry coordinator for assistance.' }
    ];

    faqItems.forEach((faq, index) => {
      if (faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)) {
        results.push({
          id: `faq-${index}`,
          type: 'faq',
          title: faq.question,
          subtitle: 'FAQ',
          description: faq.answer,
          url: '/home#faq',
          icon: 'HelpCircle'
        });
      }
    });

    // Search About content
    const aboutContent = [
      { title: 'What is LoveWorld Singers Rehearsal Hub?', description: 'A comprehensive platform for managing rehearsal schedules, song collections, and ministry activities.' }
    ];

    aboutContent.forEach((about, index) => {
      if (about.title.toLowerCase().includes(query) || about.description.toLowerCase().includes(query)) {
        results.push({
          id: `about-${index}`,
          type: 'about',
          title: about.title,
          subtitle: 'About',
          description: about.description,
          url: '/home#about',
          icon: 'Info'
        });
      }
    });

    // Sort results by relevance
    return results.sort((a, b) => {
      // Exact matches first
      const aExact = a.title.toLowerCase() === query;
      const bExact = b.title.toLowerCase() === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Then by type priority (songs > features > pages > categories > faq > about)
      const typePriority = { song: 0, feature: 1, page: 2, category: 3, faq: 4, about: 5 };
      const aPriority = typePriority[a.type];
      const bPriority = typePriority[b.type];
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Then alphabetically
      return a.title.localeCompare(b.title);
    }).slice(0, 15); // Limit to 15 results for home search
  }, [searchQuery, pages, allSongs, songsLoaded]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    hasResults: searchResults.length > 0
  };
}
