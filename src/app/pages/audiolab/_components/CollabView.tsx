'use client';

import { useState, useEffect } from 'react';
import { Plus, Hash, Mic, Copy, Users, Volume2, MicOff, Share2 } from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserClassrooms,
  createClassroom,
  getLiveSessionForClassroom,
  createSession
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

  const handleCopyLink = async (id: string) => {
    await navigator.clipboard.writeText(getShareLink(id));
    alert('Link copied to clipboard!');
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

        <div className="space-y-3">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating || !user}
            className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white transition-all shadow-lg shadow-violet-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
              {isCreating ? <CustomLoader message="" /> : <Mic size={24} />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-base font-bold">Create Permanent Room</p>
              <p className="text-white/70 text-sm">One-time setup • Reuse for any rehearsal</p>
            </div>
          </button>

          {createError && (
            <p className="text-red-400 text-xs mt-2 ml-2">{createError}</p>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <CustomLoader message="Loading rooms..." />
          </div>
        )}

        {!isLoading && activeClassrooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-white/5 border border-dashed border-white/10">
            <div className="size-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Plus className="text-slate-500" size={24} />
            </div>
            <p className="text-slate-500 text-sm text-center">No classrooms found. Create one to get started!</p>
          </div>
        )}

        {activeClassrooms.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-lg font-bold leading-tight">Your Rooms</h3>
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
                        <span>Permanent Link Ready</span>
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); handleCopyLink(room.id); }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                      >
                        <Share2 size={16} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#1a0f24] rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-32 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 overflow-hidden">
            <div className="p-6">
              <h2 className="text-white text-2xl font-bold mb-2">New Classroom</h2>
              <p className="text-slate-400 text-sm mb-6">This room will be permanently available for you and your singers.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-violet-400 uppercase tracking-wider ml-1">Classroom Name</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Sunday Choir Practice"
                    value={classroomName}
                    onChange={(e) => setClassroomName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  />
                  {createError && (
                    <p className="text-red-400 text-xs mt-2 ml-1 animate-pulse">{createError}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5">Cancel</button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={!classroomName.trim() || isCreating}
                    className="flex-[1.5] py-4 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
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
