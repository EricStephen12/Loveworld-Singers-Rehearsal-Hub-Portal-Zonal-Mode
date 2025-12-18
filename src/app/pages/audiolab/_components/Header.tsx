'use client';

import { ChevronLeft, Bell, Music, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { state, goBack } = useAudioLab();
  const { user, profile } = useAuth();
  const router = useRouter();
  
  // Get user avatar from profile or use default
  const userAvatar = profile?.avatar_url || user?.photoURL || null;
  const { currentView, previousView } = state;

  // Go back to main app
  const handleGoHome = () => {
    router.push('/home');
  };

  // Hide header in views that have their own headers or are entry flow
  if (currentView === 'home' || currentView === 'intent-choice' || currentView === 'karaoke' || currentView === 'studio' || currentView === 'practice' || currentView === 'collab' || currentView === 'collab-chat' || currentView === 'live-session') {
    return null;
  }

  const showBackButton = previousView !== null && currentView !== 'library';

  // Library view has special header
  if (currentView === 'library') {
    return (
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-20 bg-[#191022]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGoHome}
            className="text-violet-500 flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
            title="Back to Home"
          >
            <Home size={22} />
          </button>
          <h1 className="text-xl font-bold leading-tight tracking-tight">AudioLab</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center text-slate-300 hover:text-violet-400 transition-colors">
            <Bell size={24} />
          </button>
          {userAvatar ? (
            <div 
              className="h-9 w-9 rounded-full bg-cover bg-center border-2 border-violet-500/30"
              style={{ backgroundImage: `url('${userAvatar}')` }}
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-violet-500/20 border-2 border-violet-500/30 flex items-center justify-center text-violet-400 text-sm font-bold">
              {profile?.first_name?.[0] || user?.displayName?.[0] || '?'}
            </div>
          )}
        </div>
      </header>
    );
  }

  // Other views header
  const viewTitles: Record<string, string> = {
    practice: 'Practice',
    collab: 'Collaborate',
    'playlist-detail': 'Playlist',
  };

  return (
    <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-20 bg-[#191022]/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 min-w-0">
        {showBackButton && (
          <button 
            onClick={goBack}
            className="w-9 h-9 -ml-2 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold leading-tight tracking-tight">
          {viewTitles[currentView] || 'AudioLab'}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center justify-center text-slate-300 hover:text-violet-400 transition-colors">
          <Bell size={24} />
        </button>
        {userAvatar ? (
          <div 
            className="h-9 w-9 rounded-full bg-cover bg-center border-2 border-violet-500/30"
            style={{ backgroundImage: `url('${userAvatar}')` }}
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-violet-500/20 border-2 border-violet-500/30 flex items-center justify-center text-violet-400 text-sm font-bold">
            {profile?.first_name?.[0] || user?.displayName?.[0] || '?'}
          </div>
        )}
      </div>
    </header>
  );
}
