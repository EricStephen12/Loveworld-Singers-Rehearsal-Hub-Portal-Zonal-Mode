'use client';

import { useAudioLab } from './_context/AudioLabContext';
import {
  Header,
  BottomNav,
  MiniPlayer,
  FullScreenPlayer,
  LibraryView,
  PracticeView,
  KaraokeView,
  StudioView,
  CollabView,
  CollabChatView,
  LiveSessionView,
  HomeView,
  IntentChoiceView,
  WarmUpView,
} from './_components';

export default function AudioLabPage() {
  const { state } = useAudioLab();
  const { currentView, currentProjectId } = state;

  // Hide header for full-screen views
  const hideHeader = currentView === 'home' || currentView === 'intent-choice' || 
                     currentView === 'studio' || currentView === 'karaoke' || 
                     currentView === 'warmup' || currentView === 'live-session' ||
                     currentView === 'collab-chat';
  
  // Show bottom nav on main navigation views (library, practice, collab)
  // Also show on home if user has projects (they can navigate)
  const mainNavViews = ['library', 'practice', 'collab', 'playlist-detail'];
  const showBottomNav = mainNavViews.includes(currentView) || 
                        (currentView === 'home' && currentProjectId !== null);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'intent-choice':
        return <IntentChoiceView />;
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
      {!hideHeader && <Header />}
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderView()}
      </main>

      <MiniPlayer />
      {showBottomNav && <BottomNav />}
      <FullScreenPlayer />
    </div>
  );
}
