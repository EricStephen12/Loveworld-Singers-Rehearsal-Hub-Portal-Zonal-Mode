'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAudioLab } from './_context/AudioLabContext';
import {
  BottomNav,
  LibraryView,
  PracticeView,
  KaraokeView,
  StudioView,
  CollabView,
  CollabChatView,
  LiveSessionView,
  HomeView,
  WarmUpView,
} from './_components';

export default function AudioLabPage() {
  const { state, setView } = useAudioLab();
  const { currentView } = state;
  const searchParams = useSearchParams();

  // Handle view query parameter (e.g., /pages/audiolab?view=warmup)
  // Also handle song parameter - auto-switch to library view when song ID is provided
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const songParam = searchParams.get('song');
    
    // If song parameter is provided, switch to library view to show the song
    if (songParam) {
      setView('library');
      return;
    }
    
    if (viewParam) {
      const validViews = ['home', 'library', 'practice', 'karaoke', 'warmup', 'studio', 'collab', 'collab-chat', 'live-session'];
      if (validViews.includes(viewParam)) {
        setView(viewParam as any);
      }
    }
  }, [searchParams, setView]);

  // Full-screen views (hide bottom nav)
  const fullScreenViews = ['studio', 'karaoke', 'warmup', 'live-session', 'collab-chat'];
  
  // Show bottom nav for all views except full-screen views
  const showBottomNav = !fullScreenViews.includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'library':
      case 'playlist-detail':
        return <LibraryView />;
      case 'practice':
        return <PracticeView />;
      case 'karaoke':
        return <KaraokeView />;
      case 'warmup':
        return <WarmUpView />;
      case 'studio':
        return <StudioView />;
      case 'collab':
        return <CollabView />;
      case 'collab-chat':
        return <CollabChatView />;
      case 'live-session':
        return <LiveSessionView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      <main className={`
        flex-1 overflow-y-auto overflow-x-hidden 
        ${showBottomNav ? 'pb-24' : 'pb-0'}
      `}>
        {renderView()}
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
