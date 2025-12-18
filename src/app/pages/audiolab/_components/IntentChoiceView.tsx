'use client';

import { useState } from 'react';
import { ChevronLeft, Mic, Music, Loader2 } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { createProject } from '../_lib/project-service';

export function IntentChoiceView() {
  const { setView, setCurrentProject, initializeAudio } = useAudioLab();
  const { user } = useAuth();
  const { currentZone } = useZone();
  const [isCreating, setIsCreating] = useState(false);

  const handleRecordFromScratch = async () => {
    console.log('[IntentChoiceView] Record from scratch clicked, user:', user?.uid);
    
    if (!user?.uid) {
      console.error('[IntentChoiceView] No user logged in');
      alert('Please log in to create a project');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Create project immediately
      console.log('[IntentChoiceView] Creating project...');
      const result = await createProject({
        name: 'My Recording',
        ownerId: user.uid,
        zoneId: currentZone?.id
      });
      
      console.log('[IntentChoiceView] Create project result:', result);
      
      if (result.success && result.project) {
        setCurrentProject(result.project.id);
        console.log('[IntentChoiceView] Project created with ID:', result.project.id);
      } else {
        console.warn('[IntentChoiceView] Project creation failed:', result.error);
        // Show error but still proceed
      }
      
      // Initialize audio and go to studio
      await initializeAudio();
      setView('studio');
    } catch (error) {
      console.error('[IntentChoiceView] Error creating project:', error);
      // Still proceed to studio - recording works locally
      await initializeAudio();
      setView('studio');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUseSong = () => {
    // Go to library to pick a song first
    setView('library');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4">
        <button 
          onClick={() => setView('home')}
          className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          How do you want to start?
        </h2>
        <p className="text-slate-400 text-center mb-10">
          Pick one to get going
        </p>

        {/* Option 1: Record from scratch */}
        <button
          onClick={handleRecordFromScratch}
          disabled={isCreating}
          className="w-full max-w-sm p-5 mb-4 rounded-2xl bg-violet-500 hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] group text-left disabled:opacity-70 disabled:cursor-wait"
        >
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
              {isCreating ? (
                <Loader2 size={28} className="text-white animate-spin" />
              ) : (
                <Mic size={28} className="text-white" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-lg font-bold text-white">
                {isCreating ? 'Creating project...' : 'Record from scratch'}
              </p>
              <p className="text-white/70 text-sm mt-1">
                Start with your voice
              </p>
            </div>
          </div>
        </button>

        {/* Option 2: Use a song */}
        <button
          onClick={handleUseSong}
          className="w-full max-w-sm p-5 rounded-2xl bg-[#261933] border border-white/10 hover:border-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] group text-left"
        >
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0 group-hover:bg-violet-500/30 transition-colors">
              <Music size={28} className="text-violet-400" />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-lg font-bold text-white">
                Use a song
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Pick a backing track first
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
