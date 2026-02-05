'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, PhoneOff, Check, Volume2, MessageCircle, Share2, RefreshCw,
  Shield, Info, LayoutGrid, MoreHorizontal, Settings, StopCircle, Users, Video, VideoOff,
  ChevronDown, Copy, Maximize, Minimize, User, UserPlus
} from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import {
  subscribeToSession,
  leaveSession as leaveSessionService,
  toggleMute as toggleMuteService,
  toggleCamera as toggleCameraService,
  getClassroom,
  getLiveSessionForClassroom,
  createSession,
  joinSession
} from '../_lib/session-service';
import { WebRTCService } from '../_lib/webrtc-service';
import { CollabChatView } from './CollabChatView';
import { ToastContainer, Toast } from '@/components/Toast';

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
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState<'gallery' | 'speaker'>('gallery');
  const [showVideo, setShowVideo] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
        // Also remove stream
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.delete(_peerId);
          return next;
        });
      }
    });

    webRTCService.current.setOnRemoteStreamAdded((userId, stream) => {
      console.log(`[LiveSession] Remote stream added from ${userId}`);
      setRemoteStreams(prev => new Map(prev).set(userId, stream));
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

          // Mesh Logic: If someone NEW joins and their ID is "higher" than mine, I'll initiate.
          // This prevents double-offers.
          if (p.id !== user.uid && user.uid < p.id) {
            console.log(`[WebRTC] Initiating mesh connection to NEW participant: ${p.id}`);
            webRTCService.current?.initiateConnection(p.id);
          }

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
        // Cleanup local peer connection
        webRTCService.current?.removePeerConnection(pid);
      },
      onParticipantUpdated: (p) => {
        setParticipants(prev => prev.map(existing =>
          existing.id === p.id ? { ...existing, ...p } : existing
        ));
      }
    });

    // Special: Connect to EXISTING participants if I just joined
    // (Wait a bit for local stream)
    setTimeout(async () => {
      const currentParticipants = participants.filter(p => p.id !== user.uid);
      for (const p of currentParticipants) {
        if (user.uid < p.id) {
          console.log(`[WebRTC] Initiating mesh connection to EXISTING participant: ${p.id}`);
          webRTCService.current?.initiateConnection(p.id);
        }
      }
    }, 2000);

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

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration: 3000 };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleMute = async () => {
    if (!currentSession?.id || !user?.uid) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    webRTCService.current?.toggleMute(newMuted);
    await toggleMuteService(currentSession.id, user.uid, newMuted);
  };

  const handleToggleVideo = async () => {
    if (!currentSession?.id || !user?.uid) return;
    const newVideoState = !showVideo;
    const success = await webRTCService.current?.setVideoEnabled(newVideoState);
    if (success) {
      setShowVideo(newVideoState);
      await toggleCameraService(currentSession.id, user.uid, newVideoState);
    } else {
      addToast('Could not access camera', 'error');
    }
  };

  const handleToggleScreenShare = async () => {
    if (!currentSession?.id || !user?.uid) return;
    if (!isScreenSharing) {
      const success = await webRTCService.current?.startScreenShare();
      if (success) {
        setIsScreenSharing(true);
        addToast('Screen sharing started', 'success');
      }
    } else {
      await webRTCService.current?.stopScreenShare();
      setIsScreenSharing(false);
      addToast('Screen sharing stopped', 'info');
    }
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    const stream = webRTCService.current?.getLocalStream();
    if (!stream) {
      addToast('No stream to record', 'error');
      return;
    }

    try {
      // In a real world app, we'd mix all remote streams too.
      // For now, we'll record the local stream as proof of completion.
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordingBlob(blob);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rehearsal-${currentSession?.id}-${Date.now()}.webm`;
        a.click();
        addToast('Recording saved to downloads!', 'success');
      };

      mediaRecorder.start();
      setIsRecording(true);
      addToast('Recording started', 'success');
    } catch (e) {
      console.error('Recording error:', e);
      addToast('Recording failed', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleEndOrLeave = async () => {
    if (!currentSession?.id || !user?.uid) return;
    await leaveSessionService(currentSession.id, user.uid, fullName);
    clearSession();
    setView('collab');
  };

  const handleShareLink = async () => {
    if (!currentSession) return;
    const code = currentSession.code;
    const message = `Join my rehearsal on Audiolab!\n\nRoom Code: ${code}\n\nEnter this code in the Audiolab app to join.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSession.title,
          text: message
        });
        addToast('Invite shared!', 'success');
        return;
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error('Error sharing:', e);
      }
    }

    // Fallback to clipboard
    await navigator.clipboard.writeText(code);
    setCopied(true);
    addToast(`Code "${code}" copied!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMeetingId = (code: string) => {
    // For 6-character codes, just return as-is
    return code;
  };


  if (isInitializing || !currentSession) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white bg-[#0a050e]">
        <CustomLoader message="Connecting..." />
      </div>
    );
  }

  const participantCount = participants.length || 1;
  const otherParticipants = participants.filter(p => p.id !== user?.uid);

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white font-sans overflow-hidden bg-black">
      {/* Zoom Styles Top Header */}
      <div className="absolute top-0 left-0 right-0 z-[100] p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Meeting Info Button - Hidden on mobile */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="size-8 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 group transition-all"
            >
              <Shield size={18} fill="currentColor" fillOpacity={0.2} />
            </button>

            {showInfo && (
              <div className="absolute top-10 left-0 right-0 sm:right-auto w-[calc(100vw-2rem)] sm:w-80 max-w-md bg-[#1a0f24] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl z-[110]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                  <h3 className="font-bold text-base sm:text-lg text-white">{currentSession.title}</h3>
                  <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-widest whitespace-nowrap">Encrypted</div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1 text-white/50">
                    <span className="text-xs">Room Code</span>
                    <span className="text-white font-mono text-lg">{currentSession.code}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-white/50">
                    <span className="text-xs">Host</span>
                    <span className="text-white text-sm truncate">{participants.find(p => p.id === currentSession.hostId)?.name || 'Host'}</span>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleShareLink}
                      className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-bold transition-all text-xs sm:text-xs"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Code Copied!' : 'Copy Room Code'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5">
            <div className="size-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Live • {formatTime(elapsedTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setViewMode(viewMode === 'gallery' ? 'speaker' : 'gallery')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-lg border border-white/5 flex items-center gap-2 text-xs font-bold transition-all"
          >
            {viewMode === 'gallery' ? <LayoutGrid size={14} /> : <User size={14} />}
            {viewMode === 'gallery' ? 'Gallery View' : 'Speaker View'}
          </button>
        </div>
      </div>

      {/* Main Content Area (Gallery / Speaker) */}
      <div className={`relative flex-1 p-4 pt-20 pb-24 transition-all duration-500 ${chatOpen || showParticipants ? 'pr-0 sm:pr-[350px]' : ''}`}>
        <div className="h-full w-full flex items-center justify-center">
          {viewMode === 'gallery' ? (
            <div className={`grid gap-4 w-full h-full max-w-6xl max-h-[80vh] ${participantCount === 1 ? 'grid-cols-1' :
              participantCount === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                participantCount <= 4 ? 'grid-cols-2' :
                  'grid-cols-2 sm:grid-cols-3'
              }`}>
              {/* Local Participant */}
              <ParticipantView
                participant={{ ...profile, name: fullName, avatar: profile?.avatar_url, isCameraOn: showVideo }}
                stream={webRTCService.current?.getLocalStream()}
                isLocal
                isMuted={isMuted}
                isHost={currentSession.hostId === user?.uid}
              />

              {/* Other Participants */}
              {otherParticipants.map((p) => (
                <ParticipantView
                  key={p.id}
                  participant={p}
                  stream={remoteStreams.get(p.id)}
                  isMuted={p.isMuted}
                  isHost={currentSession.hostId === p.id}
                />
              ))}
            </div>
          ) : (
            /* Speaker View */
            <div className="relative w-full h-full max-w-5xl flex flex-col gap-4">
              {/* Main Speaker */}
              <div className="flex-1 bg-[#1a0f24] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
                {otherParticipants.length > 0 ? (
                  <ParticipantView
                    participant={otherParticipants[0]}
                    stream={remoteStreams.get(otherParticipants[0].id)}
                    isMuted={otherParticipants[0].isMuted}
                    isHost={currentSession.hostId === otherParticipants[0].id}
                  />
                ) : (
                  <ParticipantView
                    participant={{ ...profile, name: fullName, avatar: profile?.avatar_url, isCameraOn: showVideo }}
                    stream={webRTCService.current?.getLocalStream()}
                    isLocal
                    isMuted={isMuted}
                    isHost={currentSession.hostId === user?.uid}
                  />
                )}
              </div>

              {/* Thumbnails */}
              {otherParticipants.length > 0 && (
                <div className="h-32 w-full flex items-center justify-center gap-4 px-4 overflow-x-auto pb-2">
                  {participants.map(p => (
                    <div key={p.id} className="h-full aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative active:scale-95 transition-all">
                      {remoteStreams.get(p.id) && p.isCameraOn ? (
                        <video
                          autoPlay
                          playsInline
                          muted
                          ref={(el) => { if (el) el.srcObject = remoteStreams.get(p.id)!; }}
                          className="absolute inset-0 size-full object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold uppercase tracking-widest">
                          {p.id === user?.uid ? getInitials(fullName) : getInitials(p.name)}
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1">
                        {(p.id === user?.uid ? isMuted : p.isMuted) && <MicOff size={10} className="text-red-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All Audio Players (Hidden) */}
      {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
        <RemoteAudioPlayer key={peerId} stream={stream} muted={false} />
      ))}

      {/* Zoom Bottom Control Bar (Floating) */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[95vw] sm:w-auto transition-all duration-500 ${chatOpen || showParticipants ? 'sm:ml-[-175px]' : ''}`}>
        <div className="px-3 sm:px-6 py-2 sm:py-3 bg-[#13091a]/95 backdrop-blur-3xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between sm:justify-center gap-1">
          {/* Group 1: Audio / Video */}
          <div className="flex items-center gap-0.5 sm:gap-1 pr-2 sm:pr-4 border-r border-white/5 font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">
            <button
              onClick={handleToggleMute}
              className={`flex flex-col items-center justify-center size-12 sm:min-w-16 sm:h-14 rounded-xl transition-all ${isMuted ? 'text-red-400' : 'text-white/70 hover:bg-white/5'}`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="hidden sm:block mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button
              onClick={handleToggleVideo}
              className={`flex flex-col items-center justify-center size-12 sm:min-w-16 sm:h-14 rounded-xl transition-all ${showVideo ? 'text-emerald-400' : 'text-white/70 hover:bg-white/5'}`}
            >
              {showVideo ? <Video size={20} /> : <VideoOff size={20} />}
              <span className="hidden sm:block mt-1">{showVideo ? 'Stop Video' : 'Start Video'}</span>
            </button>
          </div>

          {/* Group 2: Features */}
          <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-4 overflow-x-auto no-scrollbar font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">
            <button
              onClick={handleShareLink}
              className="flex flex-col items-center justify-center size-12 sm:min-w-16 sm:h-14 rounded-xl text-white/70 hover:bg-white/5 transition-all"
            >
              <UserPlus size={20} />
              <span className="hidden sm:block mt-1">Invite</span>
            </button>
            <button
              onClick={() => { setShowParticipants(!showParticipants); setChatOpen(false); }}
              className={`flex flex-col items-center justify-center size-12 sm:min-w-16 sm:h-14 rounded-xl transition-all relative ${showParticipants ? 'text-violet-400 bg-violet-400/10' : 'text-white/70 hover:bg-white/5'}`}
            >
              <Users size={20} />
              <span className="hidden sm:block mt-1">Singers</span>
              <span className="absolute top-1 right-1 sm:top-2 sm:right-4 size-4 bg-violet-500 rounded-full text-[8px] flex items-center justify-center border border-black">{participantCount}</span>
            </button>
            <button
              onClick={() => { setChatOpen(!chatOpen); setShowParticipants(false); }}
              className={`flex flex-col items-center justify-center size-12 sm:min-w-16 sm:h-14 rounded-xl transition-all ${chatOpen ? 'text-violet-400 bg-violet-400/10' : 'text-white/70 hover:bg-white/5'}`}
            >
              <MessageCircle size={20} />
              <span className="hidden sm:block mt-1">Chat</span>
            </button>
            <button
              onClick={handleToggleScreenShare}
              className={`flex flex-col items-center justify-center size-12 sm:min-w-16 sm:h-14 rounded-xl transition-all ${isScreenSharing ? 'text-emerald-500 bg-emerald-500/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}
            >
              <Share2 size={20} />
              <span className="hidden sm:block mt-1">{isScreenSharing ? 'Stop Share' : 'Share'}</span>
            </button>
            <button
              onClick={handleToggleRecording}
              className={`flex flex-col items-center justify-center size-12 sm:min-w-16 sm:h-14 rounded-xl transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'text-white/70 hover:bg-white/5'}`}
            >
              <StopCircle size={20} />
              <span className="hidden sm:block mt-1">{isRecording ? 'Stop' : 'Record'}</span>
            </button>
          </div>

          {/* Group 3: Exit */}
          <div className="pl-2 sm:pl-4 border-l border-white/5">
            <button
              onClick={handleEndOrLeave}
              className="px-3 sm:px-6 h-10 sm:h-12 bg-red-600 hover:bg-red-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 whitespace-nowrap"
            >
              End Room
            </button>
          </div>
        </div>
      </div>

      {/* Sidebars (Chat and Participants) */}
      {(chatOpen || showParticipants) && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[350px] z-[120] bg-[#1a0f24] border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300">
          {chatOpen ? (
            <CollabChatView onClose={() => setChatOpen(false)} className="!relative !bg-transparent !inset-0 !z-0 h-full !rounded-none" />
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold">Participants ({participantCount})</h3>
                <button onClick={() => setShowParticipants(false)} className="text-white/40 hover:text-white transition-colors">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="size-10 rounded-lg bg-violet-600/30 flex items-center justify-center font-bold">
                      {p.avatar ? <img src={p.avatar} className="size-full object-cover rounded-lg" alt="" /> : getInitials(p.name)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{p.name} {p.id === user?.uid && '(You)'}</p>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{p.id === currentSession.hostId ? 'Host' : 'Singer'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.isMuted ? <MicOff size={16} className="text-red-400" /> : <Mic size={16} className="text-emerald-400" />}
                      {p.isCameraOn && <Video size={14} className="text-emerald-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

/**
 * Participant Video/Preview Component
 */
function ParticipantView({
  participant,
  stream,
  isLocal,
  isHost,
  isMuted
}: {
  participant: any;
  stream?: MediaStream | null;
  isLocal?: boolean;
  isHost?: boolean;
  isMuted?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, participant.isCameraOn]);

  const showVideo = participant.isCameraOn;

  return (
    <div className="relative h-full w-full rounded-2xl bg-[#1a0f24] border border-white/5 flex flex-col items-center justify-center overflow-hidden group shadow-lg">
      {/* Video element */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="absolute inset-0 size-full object-cover z-0"
        />
      )}

      {/* Initials / Avatar (Show if video is off) */}
      {!showVideo && (
        <div className="relative z-10 size-24 rounded-2xl flex items-center justify-center text-3xl font-bold bg-violet-600/30 text-white border border-white/10 shadow-2xl transition-transform group-hover:scale-110">
          {participant.avatar ? <img src={participant.avatar} className="size-full object-cover" alt="" /> : getInitials(participant.name)}
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute inset-x-4 top-4 z-20 flex justify-between pointer-events-none w-full px-4">
        {!isMuted && <div className="p-1 px-3 bg-emerald-500 rounded text-[10px] font-bold uppercase shadow-lg shadow-emerald-500/20">Speaking</div>}
        <div className="flex-1" />
        {isHost && <div className="p-1 px-2 bg-violet-600 rounded text-[8px] font-bold uppercase tracking-widest text-white shadow-lg">Host</div>}
      </div>

      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-2 z-10 transition-all group-hover:bg-black/90 group-hover:px-4">
        <span className="text-xs font-bold text-white/90 truncate max-w-[150px]">{participant.name} {isLocal && '(You)'}</span>
        {isMuted && <MicOff size={12} className="text-red-400" />}
      </div>
    </div>
  );
}

/**
 * Helper component to play remote audio streams
 */
function RemoteAudioPlayer({ stream, muted }: { stream: MediaStream; muted: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;

      // Handle auto-play blockers
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('[RemoteAudio] Auto-play prevented:', error);
        });
      }
    }
  }, [stream]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      muted={muted}
      style={{ display: 'none' }}
    />
  );
}

// Helper Functions
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatMeetingId(id: string): string {
  // Format 10 digit ID: 000 000 0000
  const cleaned = id.replace(/\D/g, '');
  if (cleaned.length !== 10) return id;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

function getInitials(name: string): string {
  if (!name) return 'S';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}
