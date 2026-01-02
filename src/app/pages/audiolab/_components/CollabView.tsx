'use client';

import { useState, useEffect } from 'react';
import { Plus, Hash, Mic, Loader2 } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { getActiveSessions, joinSession, createSession } from '../_lib/session-service';
import type { LiveSession } from '../_types';



export function CollabView() {
  const { setView, setCurrentSession } = useAudioLab();
  const { user, profile } = useAuth();
  
  const [joinCode, setJoinCode] = useState('');
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [newSessionCode, setNewSessionCode] = useState<string | null>(null);
  const [recentCodes, setRecentCodes] = useState<string[]>([]);

  // Load user's projects and active sessions
  useEffect(() => {
    if (user?.uid) {
      loadData();
      loadRecentCodes();
    }
  }, [user?.uid]);

  const loadRecentCodes = () => {
    const saved = localStorage.getItem('audiolab_recent_codes');
    if (saved) {
      try {
        setRecentCodes(JSON.parse(saved).slice(0, 3));
      } catch {}
    }
  };

  const saveRecentCode = (code: string) => {
    const saved = localStorage.getItem('audiolab_recent_codes');
    let codes: string[] = [];
    if (saved) {
      try {
        codes = JSON.parse(saved);
      } catch {}
    }
    codes = [code, ...codes.filter(c => c !== code)].slice(0, 3);
    localStorage.setItem('audiolab_recent_codes', JSON.stringify(codes));
    setRecentCodes(codes);
  };

  const loadData = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      // Get sessions where user is host OR user is a participant
      const allSessions = await getActiveSessions(50);
      
      // Filter to only show sessions where:
      // 1. User is the host (hostId === user.uid)
      // 2. User is a participant (participants[user.uid] exists)
      const userSessions = allSessions.filter(session => 
        session.hostId === user.uid || 
        (session.participants && session.participants[user.uid])
      );
      
      setActiveSessions(userSessions);
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
          title: result.session.title,
          hostId: result.session.hostId
        });
        setJoinCode('');
        saveRecentCode(result.session.code);
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
  const handleJoinRecentCode = async (code: string) => {
    if (!user?.uid) return;
    
    setIsJoining(true);
    setJoinError(null);
    
    try {
      const result = await joinSession(code, user.uid, fullName, userAvatar || undefined);
      
      if (result.success && result.session) {
        setCurrentSession({
          id: result.session.id,
          code: result.session.code,
          title: result.session.title,
          hostId: result.session.hostId
        });
        setView('collab-chat');
      } else {
        setJoinError('Session not available');
      }
    } catch (error) {
      setJoinError('Could not rejoin');
    } finally {
      setIsJoining(false);
    }
  };

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
          title: result.session.title,
          hostId: result.session.hostId
        });
        setNewSessionCode(result.session.code);
        saveRecentCode(result.session.code);
        
        setTimeout(() => {
          setView('collab-chat');
        }, 1500);
      } else {
        const errorMsg = result.error || 'Could not create session';
        setJoinError(errorMsg);
        console.error('[CollabView] Session creation failed:', errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Something went wrong';
      setJoinError(errorMsg);
      console.error('[CollabView] Session creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-24">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none z-0" />

      <main className="relative z-10 flex flex-col gap-6 px-4 pt-6">
        {/* Headline */}
        <div className="flex flex-col gap-2 mb-2">
          <h1 className="text-white text-[28px] font-bold leading-tight tracking-tight">
            Collaborate
          </h1>
          <p className="text-slate-400 text-sm">
            Start a session or join your choir
          </p>
        </div>

        {/* Session Code Display */}
        {newSessionCode && (
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-center shadow-xl shadow-violet-500/30">
            <p className="text-white/80 text-sm mb-2">Share this code with your choir</p>
            <p className="text-white text-4xl font-mono font-bold tracking-[0.3em] mb-3">{newSessionCode}</p>
            <p className="text-white/60 text-xs">Joining session...</p>
          </div>
        )}

        {/* Primary Actions */}
        {!newSessionCode && (
        <div className="space-y-3">
          {/* Create Session (HOST) */}
          <button 
            onClick={handleCreateSession}
            disabled={isCreating || !user}
            className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white transition-all shadow-lg shadow-violet-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
              {isCreating ? <Loader2 size={24} className="animate-spin" /> : <Mic size={24} />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-base font-bold">Create Session</p>
              <p className="text-white/70 text-sm">Host a live session • Get invite code</p>
            </div>
          </button>

          {/* Join Code Input */}
          <div className="w-full">
            <p className="text-slate-400 text-xs mb-2 ml-1">Have an invite code?</p>
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
        </div>
        )}

        {/* Recent Join Codes */}
        {recentCodes.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-sm font-semibold">Recent Codes</h3>
            <div className="flex gap-2">
              {recentCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => handleJoinRecentCode(code)}
                  disabled={isJoining}
                  className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl bg-[#231530] border border-white/5 hover:border-violet-500/30 text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  <Hash size={16} className="text-violet-400" />
                  <span className="font-mono font-bold text-sm">{code}</span>
                  <span className="text-xs text-slate-500">Rejoin</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* My Sessions Section */}
        {activeSessions.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold leading-tight">My Sessions</h3>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Live</span>
              </span>
            </div>

            {/* Live Session Cards */}
            {activeSessions.map((session) => {
              const participants = session.participants ? Object.values(session.participants) : [];
              const participantCount = participants.length;
              const startedAgo = session.startedAt 
                ? Math.floor((Date.now() - session.startedAt) / 60000)
                : 0;
              const isHost = session.hostId === user?.uid;
              
              return (
                <button 
                  key={session.id}
                  onClick={() => {
                    // Set session in context
                    setCurrentSession({
                      id: session.id,
                      code: session.code,
                      title: session.title,
                      hostId: session.hostId
                    });
                    setView('collab-chat');
                  }}
                  className="relative w-full rounded-2xl bg-gradient-to-br from-[#231530] to-[#1a0f24] border border-white/5 p-5 shadow-xl overflow-hidden group text-left hover:border-violet-500/30 transition-colors"
                >
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isHost ? 'text-emerald-400' : 'text-violet-400'}`}>
                          {isHost ? 'Hosting' : 'Joined'}
                        </span>
                        <h4 className="text-white text-xl font-bold">{session.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">
                          Started {startedAgo} mins ago • {participantCount} active {participantCount === 1 ? 'user' : 'users'}
                        </p>
                      </div>
                      <div className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg ${isHost ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-violet-500 shadow-violet-500/30'}`}>
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
      </main>
    </div>
  );
}
