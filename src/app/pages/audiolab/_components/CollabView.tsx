'use client';

import { useState, useEffect } from 'react';
import { Plus, Keyboard, Hash, Mic, Music, ChevronRight, Bell, Loader2 } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { getUserProjects } from '../_lib/project-service';
import { getActiveSessions, joinSession, createSession } from '../_lib/session-service';
import type { AudioLabProject, LiveSession } from '../_types';



export function CollabView() {
  const { setView, setCurrentSession, openProject } = useAudioLab();
  const { user, profile } = useAuth();
  
  const [joinCode, setJoinCode] = useState('');
  const [userProjects, setUserProjects] = useState<AudioLabProject[]>([]);
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [newSessionCode, setNewSessionCode] = useState<string | null>(null);

  // Load user's projects and active sessions
  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projects, sessions] = await Promise.all([
        user?.uid ? getUserProjects(user.uid, 5) : Promise.resolve([]),
        getActiveSessions(5)
      ]);
      setUserProjects(projects);
      setActiveSessions(sessions);
    } catch (error) {
      console.error('[CollabView] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = profile?.first_name || user?.displayName?.split(' ')[0] || 'Singer';
  const fullName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.displayName || 'Singer';
  const userAvatar = profile?.avatar_url || user?.photoURL;

  // Handle joining a session by code
  const handleJoinSession = async () => {
    if (!user?.uid || joinCode.length < 6) return;
    
    setIsJoining(true);
    setJoinError(null);
    
    try {
      const result = await joinSession(joinCode, user.uid, fullName, userAvatar || undefined);
      
      if (result.success && result.session) {
        setCurrentSession({
          id: result.session.id,
          code: result.session.code,
          title: result.session.title
        });
        setJoinCode('');
        setView('collab-chat');
      } else {
        setJoinError(result.error || 'Could not join session');
      }
    } catch (error) {
      setJoinError('Something went wrong');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle creating a new session
  const handleCreateSession = async () => {
    if (!user?.uid) return;
    
    setIsCreating(true);
    setJoinError(null);
    
    try {
      const result = await createSession(
        user.uid,
        fullName,
        userAvatar || undefined,
        { title: `${firstName}'s Session` }
      );
      
      if (result.success && result.session) {
        setCurrentSession({
          id: result.session.id,
          code: result.session.code,
          title: result.session.title
        });
        setNewSessionCode(result.session.code);
        // Show the code briefly then go to chat
        setTimeout(() => {
          setView('collab-chat');
        }, 2000);
      } else {
        setJoinError(result.error || 'Could not create session');
      }
    } catch (error) {
      setJoinError('Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-[#191022]/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-white/5">
        <div className="flex size-12 shrink-0 items-center">
          {profile?.avatar_url || user?.photoURL ? (
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-violet-500/50"
              style={{ backgroundImage: `url('${profile?.avatar_url || user?.photoURL}')` }}
            />
          ) : (
            <div className="size-10 rounded-full ring-2 ring-violet-500/50 bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
              {firstName[0]}
            </div>
          )}
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Studio Connect
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center rounded-full size-10 bg-transparent text-white hover:bg-white/10 transition-colors">
            <Bell size={24} />
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-6 px-4 pt-6">
        {/* Headline */}
        <div className="flex flex-col gap-1">
          <h1 className="text-white tracking-tight text-3xl font-bold leading-tight">
            Let's make music together.
          </h1>
          <p className="text-slate-400 text-base font-normal">
            Start a session or join your choir.
          </p>
        </div>

        {/* Session Code Display - shows when session is created */}
        {newSessionCode && (
          <div className="bg-violet-500 rounded-2xl p-6 text-center animate-pulse">
            <p className="text-white/80 text-sm mb-2">Share this code with your choir</p>
            <p className="text-white text-4xl font-mono font-bold tracking-[0.3em]">{newSessionCode}</p>
            <p className="text-white/60 text-xs mt-3">Joining session...</p>
          </div>
        )}

        {/* Primary Actions (Hero) */}
        {!newSessionCode && (
        <div className="grid grid-cols-2 gap-3">
          {/* Start Session Button */}
          <button 
            onClick={handleCreateSession}
            disabled={isCreating || !user}
            className="group relative flex flex-col items-start justify-between p-4 h-36 rounded-xl bg-violet-500 text-white overflow-hidden shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="absolute right-[-10px] top-[-10px] opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
              <Mic size={80} />
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              {isCreating ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
            </div>
            <div className="flex flex-col text-left z-10">
              <span className="text-sm font-medium opacity-90">Host</span>
              <span className="text-lg font-bold">Start Session</span>
            </div>
          </button>

          {/* Join Session Button */}
          <button 
            onClick={() => {
              const input = document.querySelector('input[placeholder="Enter 6-digit code..."]') as HTMLInputElement;
              input?.focus();
            }}
            className="group relative flex flex-col items-start justify-between p-4 h-36 rounded-xl bg-[#231530] border border-white/5 text-white overflow-hidden hover:bg-[#231530]/80 transition-all active:scale-95"
          >
            <div className="absolute right-[-10px] top-[-10px] text-violet-500 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
              <Hash size={80} />
            </div>
            <div className="bg-[#1a0f24] border border-white/10 p-2 rounded-lg">
              <Hash size={20} className="text-violet-500" />
            </div>
            <div className="flex flex-col text-left z-10">
              <span className="text-sm font-medium opacity-60">Have a code?</span>
              <span className="text-lg font-bold">Join Session</span>
            </div>
          </button>
        </div>
        )}

        {/* Quick Join Input */}
        <div className="w-full">
          <label className="flex w-full items-center gap-2 p-1 pl-4 rounded-xl bg-[#231530] border border-white/5 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
            <Hash size={20} className="text-slate-400" />
            <input 
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setJoinError(null);
              }}
              maxLength={6}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 h-12 font-mono tracking-wider"
              placeholder="Enter 6-digit code..."
            />
            <button 
              onClick={handleJoinSession}
              disabled={joinCode.length < 6 || isJoining || !user}
              className="bg-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-white h-10 px-4 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isJoining ? <Loader2 size={16} className="animate-spin" /> : null}
              Join
            </button>
          </label>
          {joinError && (
            <p className="text-red-400 text-xs mt-2 ml-2">{joinError}</p>
          )}
        </div>

        {/* Live Now Section - Only show if there are active sessions */}
        {activeSessions.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold leading-tight">Live Now</h3>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">On Air</span>
              </span>
            </div>

            {/* Live Session Cards */}
            {activeSessions.map((session) => {
              const participants = session.participants ? Object.values(session.participants) : [];
              const participantCount = participants.length;
              const startedAgo = session.startedAt 
                ? Math.floor((Date.now() - session.startedAt) / 60000)
                : 0;
              
              return (
                <button 
                  key={session.id}
                  onClick={() => {
                    // Set session in context
                    setCurrentSession({
                      id: session.id,
                      code: session.code,
                      title: session.title
                    });
                    setView('collab-chat');
                  }}
                  className="relative w-full rounded-2xl bg-gradient-to-br from-[#231530] to-[#1a0f24] border border-white/5 p-5 shadow-xl overflow-hidden group text-left hover:border-violet-500/30 transition-colors"
                >
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1 block">
                          Active Session
                        </span>
                        <h4 className="text-white text-xl font-bold">{session.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">
                          Started {startedAgo} mins ago • {participantCount} active {participantCount === 1 ? 'user' : 'users'}
                        </p>
                      </div>
                      <div className="size-10 rounded-full bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                        <Mic size={20} />
                      </div>
                    </div>

                    {/* Participants Cluster */}
                    {participantCount > 0 && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex -space-x-3">
                          {participants.slice(0, 3).map((participant, i) => (
                            <div key={participant.id} className="relative">
                              {participant.avatar ? (
                                <img 
                                  src={participant.avatar}
                                  alt={participant.name}
                                  className="inline-block size-10 rounded-full ring-2 ring-[#231530] object-cover"
                                />
                              ) : (
                                <div className="inline-block size-10 rounded-full ring-2 ring-[#231530] bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                                  {participant.name?.[0] || '?'}
                                </div>
                              )}
                              <span className={`absolute bottom-0 right-0 block size-2.5 rounded-full ring-2 ring-[#231530] ${
                                participant.isOnline ? 'bg-green-500' : 'bg-slate-500'
                              }`} />
                            </div>
                          ))}
                        </div>
                        {participantCount > 3 && (
                          <span className="text-xs font-medium text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                            +{participantCount - 3} others
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Recent Projects List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-white text-lg font-bold leading-tight">Recent Projects</h3>
            <button className="text-violet-400 text-sm font-bold hover:text-violet-300">See all</button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-violet-500" />
            </div>
          ) : userProjects.length > 0 ? (
            userProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => openProject(project.id)}
                className="flex items-center p-3 rounded-xl bg-[#231530] border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group text-left"
              >
                <div className="size-12 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 mr-4 group-hover:bg-opacity-100 transition-colors">
                  <Music size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-white font-bold truncate">{project.name}</h5>
              <p className="text-slate-400 text-xs mt-0.5">
                {project.updatedAt
                  ? new Date(
                      // Handle both Date and Timestamp-like values
                      (project.updatedAt as any).toDate
                        ? (project.updatedAt as any).toDate()
                        : project.updatedAt
                    ).toLocaleDateString()
                  : 'Recently'}
              </p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            ))
          ) : (
            <button
              onClick={() => setView('studio')}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-white/20 text-slate-400 hover:bg-white/5 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm">Create your first project</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
