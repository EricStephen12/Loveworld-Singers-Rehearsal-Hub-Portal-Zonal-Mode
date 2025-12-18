'use client';

import { Home, Music2, Mic, Users, AudioLines } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import type { ViewType } from '../_types';

interface NavItem {
  id: ViewType;
  label: string;
  icon: typeof Music2;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'library', label: 'Library', icon: Music2 },
  { id: 'practice', label: 'Practice', icon: Mic },
  { id: 'collab', label: 'Collab', icon: Users },
];

export function BottomNav() {
  const { state, setView } = useAudioLab();
  const { currentView, isPlayerVisible } = state;

  // BottomNav visibility is now controlled by parent (page.tsx)
  // This component just renders when shown

  return (
    <nav 
      className={`
        fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2
        border-t border-white/5 pb-5 pt-3 px-6 
        flex justify-between items-center z-30
        bg-[#191022]/85 backdrop-blur-xl
        ${isPlayerVisible ? 'pb-[88px]' : ''}
      `}
    >
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = currentView === id || 
          (id === 'library' && currentView === 'playlist-detail');
        
        return (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`
              flex flex-col items-center gap-1 transition-colors
              ${isActive 
                ? 'text-violet-500' 
                : 'text-slate-400 hover:text-slate-200'
              }
            `}
          >
            <Icon 
              size={26} 
              className={isActive ? 'fill-current' : ''}
            />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
