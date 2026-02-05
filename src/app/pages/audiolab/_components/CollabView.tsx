'use client';

import { useState, useEffect } from 'react';
import { Plus, Hash, Mic, Copy, Users, Volume2, MicOff, Share2, Trash2 } from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserClassrooms,
  createClassroom,
  getLiveSessionForClassroom,
  createSession,
  findSessionByCode,
  joinSession,
  deleteClassroom
} from '../_lib/session-service';
import type { LiveSession } from '../_types';

export function CollabView() {
  const { setView, setCurrentSession } = useAudioLab();
  const { user, profile } = useAuth();

  const [activeClassrooms, setActiveClassrooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classroomName, setClassroomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const fullName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.displayName || 'Singer';
  const userAvatar = profile?.avatar_url || user?.photoURL;

  const loadData = async () => {
    if (!user?.uid) return;
    try {
      const rooms = await getUserClassrooms(user.uid);
      console.log('[CollabView] Loaded classrooms:', rooms.length);
      setActiveClassrooms(rooms);
    } catch (error) {
      console.error('[CollabView] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) loadData();
  }, [user?.uid]);

  const handleCreateRoom = async () => {
    if (!user?.uid || !classroomName.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createClassroom(
        user.uid,
        fullName,
        classroomName.trim(),
        userAvatar || undefined
      );

      if (result.success && result.classroom) {
        // Instant success: Resolve the dynamic session and enter
        const sessionResult = await createSession(user.uid, fullName, userAvatar || undefined, {
          projectId: result.classroom.id,
          title: result.classroom.title
        });

        if (sessionResult.success && sessionResult.session) {
          setCurrentSession(sessionResult.session);
          setView('live-session');
        } else {
          // If session creation fails, we still have the room
          loadData();
          setShowCreateModal(false);
          alert('Room created! You can join it from the list.');
        }
      } else {
        setCreateError(result.error || 'Could not create classroom');
      }
    } catch (error) {
      console.error('[CollabView] Create Error:', error);
      setCreateError('Database error. Please check your connection.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!user?.uid || !joinCode.trim()) return;

    setIsJoining(true);
    setCreateError(null);

    try {
      const code = joinCode.trim().toUpperCase();
      const result = await joinSession(code, user.uid, fullName, userAvatar || undefined);

      if (result.success && result.session) {
        setCurrentSession(result.session);
        setView('live-session');
      } else {
        setCreateError(result.error || 'Invalid session code');
      }
    } catch (e) {
      console.error(e);
      setCreateError('Error joining session');
    } finally {
      setIsJoining(false);
    }
  };

  const handleEnterClassroom = async (classroom: any) => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Check if there's already a live session
      let session = await getLiveSessionForClassroom(classroom.id);

      if (!session) {
        // Create a new session for this classroom (Zoom-style activation)
        const result = await createSession(user.uid, fullName, userAvatar || undefined, {
          projectId: classroom.id,
          title: classroom.title
        });
        if (result.success) session = result.session || null;
      }

      if (session) {
        // Automatically join the session if we are entering the classroom
        await joinSession(session.id, user.uid, fullName, userAvatar || undefined);
        setCurrentSession(session);
        setView('live-session');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getShareLink = (id: string) => {
    return `${window.location.origin}${window.location.pathname}?view=live-session&roomId=${id}`;
  };

  const handleCopyLink = async (code: string, title?: string) => {
    const message = `Join my rehearsal on Audiolab!\n\nRoom Code: ${code}\n\nEnter this code in the Audiolab app to join.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Audiolab Rehearsal',
          text: message
        });
        return;
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error('Error sharing:', e);
      }
    }

    await navigator.clipboard.writeText(code);
    alert(`Room code "${code}" copied to clipboard!`);
  };

  const handleDeleteClassroom = async (classroomId: string, title: string) => {
    if (!user?.uid) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const result = await deleteClassroom(classroomId, user.uid);
      if (result.success) {
        alert('Classroom deleted successfully!');
        loadData(); // Refresh the list
      } else {
        alert(result.error || 'Failed to delete classroom');
      }
    } catch (error) {
      console.error('[CollabView] Delete error:', error);
      alert('Error deleting classroom');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-24 h-full relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none z-0" />

      <main className="relative z-10 flex flex-col gap-6 px-4 pt-6">
        <div className="flex flex-col gap-2 mb-2">
          <h1 className="text-white text-[28px] font-bold leading-tight tracking-tight">
            Classrooms
          </h1>
          <p className="text-slate-400 text-sm">
            Join a persistent room or start a new rehearsal
          </p>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating || !user}
            className="w-full flex items-center gap-4 p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white transition-all shadow-xl shadow-violet-500/20 active:scale-[0.98] disabled:opacity-50 group border border-white/10"
          >
            <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md group-hover:scale-110 transition-transform">
              {isCreating ? <CustomLoader message="" /> : <Plus size={32} strokeWidth={2.5} />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xl font-bold">New Rehearsal</p>
              <p className="text-white/60 text-sm mt-0.5">Start a fresh session in your room</p>
            </div>
          </button>

          {/* Join by Code */}
          <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Hash size={24} />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Join by Code</p>
                <p className="text-slate-400 text-xs">Enter a 6-character room code</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3B7K9"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 font-mono text-lg uppercase"
              />
              <button
                onClick={handleJoinByCode}
                disabled={isJoining || joinCode.length !== 6}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        </div>

        {/* Room Listing */}
        <div className="mt-4 flex flex-col gap-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <CustomLoader message="Loading sessions..." />
            </div>
          )}

          {!isLoading && activeClassrooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-white/5 border border-dashed border-white/10">
              <p className="text-slate-500 text-sm text-center">No active rooms found</p>
            </div>
          )}

          {!isLoading && activeClassrooms.length > 0 && (
            <>
              <h3 className="text-white text-lg font-bold leading-tight flex items-center gap-2">
                Your Rooms
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px]">{activeClassrooms.length}</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {activeClassrooms.map((room) => {
                  const isHost = room.hostId === user?.uid;
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleEnterClassroom(room)}
                      className="relative w-full rounded-2xl bg-gradient-to-br from-[#231530] to-[#1a0f24] border border-white/5 p-5 shadow-xl overflow-hidden group text-left hover:border-violet-500/30 transition-all hover:translate-y-[-2px]"
                    >
                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 block ${isHost ? 'text-emerald-400' : 'text-violet-400'}`}>
                              {isHost ? 'Your Classroom' : 'Participant'}
                            </span>
                            <h4 className="text-white text-xl font-bold">{room.title}</h4>
                          </div>
                          <div className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg ${isHost ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'}`}>
                            <Users size={20} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                            <div className="size-1.5 rounded-full bg-emerald-500" />
                            <span>Room Code: <span className="text-white font-mono">{room.code}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopyLink(room.code, room.title); }}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              title="Share room code"
                            >
                              <Share2 size={16} />
                            </button>
                            {isHost && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteClassroom(room.id, room.title); }}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                title="Delete classroom"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-[#1a0f24] rounded-t-3xl sm:rounded-3xl border-t border-x sm:border border-white/10 shadow-2xl animate-in slide-in-from-bottom-32 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 overflow-hidden max-h-[90vh] sm:max-h-[80vh]">
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[90vh] sm:max-h-[80vh]">
              <h2 className="text-white text-xl sm:text-2xl font-bold mb-2">New Classroom</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6">This room will be permanently available for you and your singers.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-violet-400 uppercase tracking-wider ml-1">Classroom Name</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Sunday Choir Practice"
                    value={classroomName}
                    onChange={(e) => setClassroomName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-medium text-sm sm:text-base"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  />
                  {createError && (
                    <p className="text-red-400 text-xs mt-2 ml-1 animate-pulse">{createError}</p>
                  )}
                </div>
                <div className="flex gap-2 sm:gap-3 pt-2">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 sm:py-4 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 text-sm sm:text-base">Cancel</button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={!classroomName.trim() || isCreating}
                    className="flex-[1.5] py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {isCreating ? <CustomLoader size="sm" message="" /> : <Plus size={20} />}
                    {isCreating ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
