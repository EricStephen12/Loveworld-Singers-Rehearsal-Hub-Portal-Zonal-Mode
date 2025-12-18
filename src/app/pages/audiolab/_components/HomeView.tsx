'use client';

import { useState, useEffect } from 'react';
import { Mic, Play, Loader2, Music2, Users, AudioLines } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { getUserProjects } from '../_lib/project-service';
import type { AudioLabProject } from '../_types';

export function HomeView() {
  const { setView, openProject } = useAudioLab();
  const { user } = useAuth();
  
  const [recentProject, setRecentProject] = useState<AudioLabProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load most recent project
  useEffect(() => {
    const loadRecentProject = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        const projects = await getUserProjects(user.uid);
        if (projects.length > 0) {
          // Get most recent project
          setRecentProject(projects[0]);
        }
      } catch (error) {
        console.error('[HomeView] Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecentProject();
  }, [user?.uid]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContinueProject = () => {
    if (recentProject) {
      openProject(recentProject.id);
    }
  };

  const handleCreateProject = () => {
    setView('intent-choice');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo / Brand */}
      <div className="mb-12 text-center">
        <div className="size-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Mic size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">AudioLab</h1>
      </div>

      {/* Continue Project Card (if exists) */}
      {recentProject && (
        <button
          onClick={handleContinueProject}
          className="w-full max-w-sm mb-4 p-4 rounded-2xl bg-[#261933] border border-white/10 hover:border-violet-500/30 transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
              <Play size={24} className="text-violet-400 ml-0.5" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-violet-400 font-bold uppercase tracking-wider mb-1">
                Continue
              </p>
              <p className="text-white font-bold truncate">
                {recentProject.name}
              </p>
              <p className="text-slate-400 text-sm">
                {recentProject.duration ? formatDuration(recentProject.duration) + ' recorded' : 'In progress'}
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Main CTA - Create Project */}
      <button
        onClick={handleCreateProject}
        className="w-full max-w-sm p-6 rounded-2xl bg-violet-500 hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] group"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="size-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Mic size={32} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              Create a Project
            </p>
            <p className="text-white/70 text-sm mt-1">
              Make music in under a minute
            </p>
          </div>
        </div>
      </button>

      {/* Quick Access for returning users */}
      {recentProject && (
        <>
          <p className="mt-8 text-slate-500 text-sm text-center mb-4">
            or explore other features
          </p>
          
          {/* Quick Access Grid */}
          <div className="w-full max-w-sm grid grid-cols-3 gap-3">
            <button
              onClick={() => setView('library')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#261933] border border-white/5 hover:border-violet-500/30 transition-all"
            >
              <Music2 size={24} className="text-violet-400" />
              <span className="text-xs text-slate-400 font-medium">Library</span>
            </button>
            <button
              onClick={() => setView('practice')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#261933] border border-white/5 hover:border-violet-500/30 transition-all"
            >
              <AudioLines size={24} className="text-emerald-400" />
              <span className="text-xs text-slate-400 font-medium">Practice</span>
            </button>
            <button
              onClick={() => setView('collab')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#261933] border border-white/5 hover:border-violet-500/30 transition-all"
            >
              <Users size={24} className="text-blue-400" />
              <span className="text-xs text-slate-400 font-medium">Collab</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
