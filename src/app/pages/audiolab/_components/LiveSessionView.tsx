'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, PhoneOff, Check, Volume2, MessageCircle, Share2
} from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import {
  subscribeToSession,
  leaveSession as leaveSessionService,
  toggleMute as toggleMuteService,
  getClassroom,
  getLiveSessionForClassroom,
  createSession,
  joinSession
} from '../_lib/session-service';
import { WebRTCService } from '../_lib/webrtc-service';
import { CollabChatView } from './CollabChatView';

export function LiveSessionView() {
  const { state, setView, clearSession, setCurrentSession } = useAudioLab();
  const { user, profile } = useAuth();
  const { currentZone } = useZone();

  // Zone theming - safe defaults if zone doesn't have specific colors
  const primaryColor = currentZone?.themeColor || '#8B5CF6';
  const darkColor = '#1a1025';
  const darkerColor = '#0a050e';

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [participants, setParticipants] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());
  const [isInitializing, setIsInitializing] = useState(true);

  const currentSession = state.session.currentSession;
  const webRTCService = useRef<WebRTCService | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fullName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.displayName || 'Singer';
  const userAvatar = profile?.avatar_url || undefined;

  // Track the room ID from URL for auto-joining
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('roomId');

    if (roomId && !currentSession) {
      handleJoinOrCreateSession(roomId);
    } else if (currentSession) {
      setIsInitializing(false);
    }
  }, [currentSession]);

  const handleJoinOrCreateSession = async (roomId: string) => {
    if (!user?.uid) return;

    setIsInitializing(true);
    try {
      const room = await getClassroom(roomId);
      if (!room) {
        console.error('[LiveSession] Room not found:', roomId);
        setView('collab');
        return;
      }

      let session = await getLiveSessionForClassroom(roomId);
      if (!session) {
        const result = await createSession(user.uid, fullName, userAvatar || undefined, {
          projectId: roomId,
          title: room.title
        });
        if (result.success) session = result.session || null;
      }

      if (session) {
        const joinResult = await joinSession(session.id, user.uid, fullName, userAvatar || undefined);
        if (joinResult.success && joinResult.session) {
          setCurrentSession(joinResult.session);
        }
      }
    } catch (e) {
      console.error('[LiveSession] Error joining:', e);
      setView('collab');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!currentSession?.id || !user?.uid) return;

    webRTCService.current = new WebRTCService();
    webRTCService.current.initializeSignaling(currentSession.id, user.uid);

    webRTCService.current.setOnConnectionStateChanged((_peerId: string, status: string) => {
      if (status === 'connected' || status === 'completed') {
        setConnectionStatus('connected');
        setConnectedPeers(prev => new Set(prev).add(_peerId));
      } else if (status === 'failed' || status === 'disconnected') {
        setConnectedPeers(prev => {
          const next = new Set(prev);
          next.delete(_peerId);
          return next;
        });
      }
    });

    webRTCService.current.initializeLocalStream().then((success) => {
      if (success) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      }
    });

    const unsub = subscribeToSession(currentSession.id, {
      onParticipantJoined: (p) => {
        setParticipants(prev => {
          if (prev.some(existing => existing.id === p.id)) return prev;
          return [...prev, p];
        });
      },
      onParticipantLeft: (pid) => {
        setParticipants(prev => prev.filter(p => p.id !== pid));
        setConnectedPeers(prev => {
          const next = new Set(prev);
          next.delete(pid);
          return next;
        });
      },
      onParticipantUpdated: (p) => {
        setParticipants(prev => prev.map(existing =>
          existing.id === p.id ? { ...existing, ...p } : existing
        ));
      }
    });

    return () => {
      unsub();
      if (timerRef.current) clearInterval(timerRef.current);
      webRTCService.current?.dispose();
    };
  }, [currentSession?.id, user?.uid]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleToggleMute = async () => {
    if (!currentSession?.id || !user?.uid) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    webRTCService.current?.toggleMute(newMuted);
    await toggleMuteService(currentSession.id, user.uid, newMuted);
  };

  const handleEndOrLeave = async () => {
    if (!currentSession?.id || !user?.uid) return;
    await leaveSessionService(currentSession.id, user.uid, fullName);
    clearSession();
    setView('collab');
  };

  const handleShareLink = async () => {
    if (!currentSession) return;
    const roomId = currentSession.classroomId || currentSession.id;
    const url = `${window.location.origin}${window.location.pathname}?view=live-session&roomId=${roomId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInitializing || !currentSession) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white bg-[#0a050e]">
        <CustomLoader message="Entering Classroom..." />
      </div>
    );
  }

  const participantCount = participants.length || 1;
  const otherParticipants = participants.filter(p => p.id !== user?.uid);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-white font-sans overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${darkColor} 0%, ${darkerColor} 100%)` }}
    >
      {/* Top Bar */}
      <div className={`relative z-10 px-6 pt-12 pb-4 flex items-center justify-between transition-all duration-500 ${chatOpen ? 'pr-[370px]' : ''}`}>
        <div className="flex flex-col">
          <h1 className="text-white text-lg font-bold tracking-tight">{currentSession.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`size-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
              {connectionStatus === 'connected' ? 'Securely Connected' : 'Securing Line...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleShareLink} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
            {copied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">
            <span className="text-white/40">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className={`flex-1 px-4 py-4 flex items-center justify-center overflow-y-auto transition-all duration-500 ${chatOpen ? 'pr-[350px]' : ''}`}>
        <div className={`grid gap-4 w-full max-w-2xl ${participantCount === 1 ? 'grid-cols-1' :
            participantCount === 2 ? 'grid-cols-1 sm:grid-cols-2' :
              participantCount <= 4 ? 'grid-cols-2' :
                'grid-cols-2 sm:grid-cols-3'
          }`}>
          <div className={`relative aspect-square sm:aspect-video rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${isMuted ? 'ring-2 ring-red-500/20' : 'ring-2 ring-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-0" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="size-24 rounded-full flex items-center justify-center text-3xl font-bold bg-violet-600/30 text-white overflow-hidden">
                {profile?.avatar_url ? <img src={profile.avatar_url} className="size-full object-cover" alt="" /> : getInitials(fullName)}
              </div>
              {!isMuted && <div className="p-1 px-3 bg-green-500 rounded-full text-[10px] font-bold uppercase">Speaking</div>}
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-center">
              <span className="text-sm font-bold text-white/90">You</span>
              {isMuted && <MicOff size={14} className="text-red-400" />}
            </div>
          </div>

          {otherParticipants.map((p) => (
            <div key={p.id} className="relative aspect-square sm:aspect-video rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-0" />
              <div className="size-20 rounded-full flex items-center justify-center text-2xl font-bold bg-white/10 text-white/70 overflow-hidden">
                {p.avatar ? <img src={p.avatar} className="size-full object-cover" alt="" /> : getInitials(p.name)}
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-center">
                <span className="text-sm font-bold text-white/90 truncate">{p.name?.split(' ')[0]}</span>
                {p.isMuted && <MicOff size={14} className="text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className={`relative px-6 pb-12 flex justify-center transition-all duration-500 ${chatOpen ? 'pr-[350px] hidden md:flex' : ''}`}>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-3xl px-6 py-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <button onClick={handleToggleMute} className={`size-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'}`}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={() => setChatOpen(!chatOpen)} className={`size-14 rounded-full flex items-center justify-center transition-all ${chatOpen ? 'bg-violet-600' : 'bg-white/10 hover:bg-white/20'}`}>
            <MessageCircle size={24} />
          </button>
          <div className="w-1" />
          <button onClick={handleEndOrLeave} className="size-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl shadow-red-600/30 hover:bg-red-500">
            <PhoneOff size={28} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {chatOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[350px] z-[60] bg-black/60 backdrop-blur-2xl border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300">
          <CollabChatView onClose={() => setChatOpen(false)} className="!relative !bg-transparent !inset-0 !z-0 h-full !rounded-none" />
        </div>
      )}
    </div>
  );
}
