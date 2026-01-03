'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, PhoneOff, Users, Copy, Check, Volume2, MessageCircle, Wifi, WifiOff, Loader2
} from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  subscribeToSession, 
  leaveSession, 
  endSession,
  toggleMute as toggleMuteService,
  subscribeToMessages
} from '../_lib/session-service';
import { WebRTCService } from '../_lib/webrtc-service';
import type { Participant, ChatMessage } from '../_types';

// Play a subtle join sound
function playJoinSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880; // A5
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 300);
  } catch (e) {}
}

export function LiveSessionView() {
  const { state, clearSession, setView } = useAudioLab();
  const { user, profile } = useAuth();
  const currentSession = state.session.currentSession;
  
  const [webrtcService] = useState(() => new WebRTCService());
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  
  const [isLive, setIsLive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copied, setCopied] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());

  // Subscribe to session updates
  useEffect(() => {
    if (!currentSession?.id) return;
    
    const unsubscribe = subscribeToSession(currentSession.id, {
      onParticipantJoined: (participant) => {
        setParticipants(prev => {
          if (prev.find(p => p.id === participant.id)) return prev;
          // Play join sound for new participants (not self)
          if (participant.id !== user?.uid) {
            playJoinSound();
          }
          return [...prev, participant];
        });
        
        if (user?.uid && participant.id !== user.uid) {
          webrtcService.createPeerConnection(participant.id, false);
          
          if (user.uid === currentSession.hostId) {
            setTimeout(async () => {
              try {
                await webrtcService.initiateConnection(participant.id);
              } catch (error) {
                console.error('[LiveSession] Error initiating connection:', error);
              }
            }, 1500);
          }
        }
      },
      onParticipantLeft: (participantId) => {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
        setConnectedPeers(prev => {
          const next = new Set(prev);
          next.delete(participantId);
          return next;
        });
        webrtcService.removePeerConnection(participantId);
      },
      onParticipantUpdated: (participant) => {
        setParticipants(prev => prev.map(p => 
          p.id === participant.id ? participant : p
        ));
      },
      onSessionEnded: () => {
        setIsLive(false);
        clearSession();
        setView('collab');
      }
    });
    
    return () => unsubscribe();
  }, [currentSession?.id, clearSession, setView, user?.uid, currentSession?.hostId, webrtcService]);

  // Initialize WebRTC
  useEffect(() => {
    if (!user?.uid || !currentSession?.id) return;
    
    webrtcService.initializeSignaling(currentSession.id, user.uid);
    
    const setupWebRTC = async () => {
      const success = await webrtcService.initializeLocalStream();
      if (!success) {
        setConnectionStatus('failed');
        return;
      }
      
      // Set connection status to connected once local stream is ready
      setConnectionStatus('connected');
      
      webrtcService.setOnRemoteStreamAdded((userId, stream) => {
        console.log('[LiveSession] Remote stream added from:', userId);
        
        // Track connected peer
        setConnectedPeers(prev => new Set(prev).add(userId));
        
        if (audioElementsRef.current[userId]) {
          audioElementsRef.current[userId].srcObject = stream;
          audioElementsRef.current[userId].play().catch(() => {});
          return;
        }
        
        const audio = new Audio();
        audio.autoplay = true;
        (audio as any).playsInline = true;
        audio.volume = 1.0;
        audio.srcObject = stream;
        
        audio.onloadedmetadata = () => {
          audio.play().catch(() => {
            document.addEventListener('click', () => audio.play().catch(() => {}), { once: true });
          });
        };
        
        audioElementsRef.current[userId] = audio;
      });
      
      if (user.uid !== currentSession.hostId) {
        setTimeout(async () => {
          webrtcService.createPeerConnection(currentSession.hostId, true);
          await webrtcService.requestOfferFrom(currentSession.hostId);
        }, 2000);
      }
    };
    
    setupWebRTC();
    
    return () => {
      webrtcService.closeAllConnections();
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
        audio.srcObject = null;
      });
      audioElementsRef.current = {};
    };
  }, [user?.uid, currentSession?.id, currentSession?.hostId, webrtcService]);

  // Subscribe to messages
  useEffect(() => {
    if (!currentSession?.id) return;
    const unsubscribe = subscribeToMessages(currentSession.id, (message) => {
      setMessages(prev => [...prev, message]);
    });
    return () => unsubscribe();
  }, [currentSession?.id]);

  // Timer
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = async () => {
    if (!currentSession?.code) return;
    await navigator.clipboard.writeText(currentSession.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleMute = async () => {
    if (!currentSession?.id || !user?.uid) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    const localStream = webrtcService.getLocalStream();
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMuted;
      });
    }
    
    await toggleMuteService(currentSession.id, user.uid, newMuted);
  };

  const handleEndOrLeave = async () => {
    if (!currentSession?.id || !user?.uid) return;
    
    if (user.uid === currentSession.hostId) {
      await endSession(currentSession.id);
    } else {
      await leaveSession(currentSession.id, user.uid, profile?.display_name || 'User');
    }
    clearSession();
    setView('collab');
  };

  if (!currentSession) {
    return (
      <div className="fixed inset-0 z-50 bg-[#191022] flex flex-col items-center justify-center text-white">
        <p className="text-slate-400 mb-4">No active session</p>
        <button
          onClick={() => setView('collab')}
          className="px-6 py-3 bg-violet-500 rounded-xl font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isHost = user?.uid === currentSession.hostId;
  const participantCount = participants.length || 1;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a1025] to-[#0f0a14] flex flex-col text-white">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Connection Status Bar */}
      <div className="relative z-10 px-4 pt-12 pb-2">
        <div className="flex items-center justify-between">
          {/* Back to Chat */}
          <button
            onClick={() => setView('collab-chat')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <MessageCircle size={18} className="text-violet-400" />
            <span className="text-sm text-white/80">Chat</span>
          </button>
          
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-500/20 text-green-400' 
              : connectionStatus === 'connecting'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {connectionStatus === 'connecting' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Connecting...</span>
              </>
            ) : connectionStatus === 'connected' ? (
              <>
                <Wifi size={14} />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={14} />
                <span>Connection failed</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-4">
        
        {/* Session Code - Prominent & Easy to Share */}
        <button 
          onClick={handleCopyCode}
          className="mb-8 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
        >
          <span className="text-2xl font-bold tracking-[0.3em] text-white">
            {currentSession.code}
          </span>
          {copied ? (
            <Check size={20} className="text-green-400" />
          ) : (
            <Copy size={20} className="text-violet-400" />
          )}
        </button>

        {/* Participants Circle */}
        <div className="relative mb-6">
          {/* Pulsing ring when live - properly centered */}
          <div className="absolute inset-[-12px] rounded-full border-2 border-violet-500/20 animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-[-6px] rounded-full border border-violet-500/30" />
          
          {/* Main circle with participant avatars */}
          <div className="relative w-48 h-48 rounded-full bg-[#251833] border border-white/10 flex items-center justify-center overflow-hidden">
            {participantCount <= 4 ? (
              // Show individual avatars for small groups
              <div className="flex flex-wrap items-center justify-center gap-2 p-4">
                {/* Current user */}
                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                  isMuted ? 'bg-red-500/20 text-red-400' : 'bg-violet-500/30 text-violet-300'
                }`}>
                  {profile?.first_name?.charAt(0) || 'Y'}
                  {!isMuted && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Mic size={12} />
                    </div>
                  )}
                </div>
                
                {/* Other participants */}
                {participants.filter(p => p.id !== user?.uid).slice(0, 3).map((p) => {
                  const isConnected = connectedPeers.has(p.id);
                  return (
                    <div 
                      key={p.id}
                      className={`relative w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                        p.isMuted ? 'bg-slate-700 text-slate-400' : 'bg-violet-500/20 text-violet-300'
                      } ${!isConnected ? 'opacity-50' : ''}`}
                    >
                      {p.name?.charAt(0) || '?'}
                      {/* Connection/Mute indicator */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                        !isConnected ? 'bg-yellow-500/80' : p.isMuted ? 'bg-slate-600' : 'bg-green-500/80'
                      }`}>
                        {!isConnected ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : p.isMuted ? (
                          <MicOff size={8} />
                        ) : (
                          <Volume2 size={10} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Show count for larger groups
              <div className="text-center">
                <Users size={40} className="text-violet-400 mx-auto mb-2" />
                <span className="text-3xl font-bold">{participantCount}</span>
                <p className="text-xs text-slate-400 mt-1">Connected</p>
              </div>
            )}
          </div>
        </div>

        {/* Timer - Simple */}
        <div className="text-4xl font-mono font-light text-white/80 mb-2">
          {formatTime(elapsedTime)}
        </div>
        
        {/* Status */}
        <p className="text-sm text-slate-400 mb-8">
          {isHost ? 'You\'re hosting' : `Hosted by ${currentSession.title?.replace("'s Session", '') || 'Host'}`}
        </p>

        {/* Recent Activity */}
        {messages.length > 0 && (
          <div className="w-full max-w-sm">
            <div className="text-center text-sm text-slate-500 py-2">
              {messages[messages.length - 1]?.content}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls - Simplified */}
      <div className="relative px-6 pb-10 pt-4">
        <div className="flex items-center justify-center gap-6">
          
          {/* Mute Button */}
          <button 
            onClick={handleToggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isMuted 
                ? 'bg-white text-slate-900' 
                : 'bg-white/10 text-white border border-white/20'
            }`}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>

          {/* End/Leave Button */}
          <button 
            onClick={handleEndOrLeave}
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-red-500/30"
          >
            <PhoneOff size={32} />
          </button>

          {/* Participants Count */}
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex flex-col items-center justify-center">
            <Users size={20} className="text-white/80" />
            <span className="text-xs font-bold mt-0.5">{participantCount}</span>
          </div>
        </div>

        {/* Mute hint */}
        <p className="text-center text-xs text-slate-500 mt-4">
          {isMuted ? 'Tap mic to unmute' : 'You\'re unmuted'}
        </p>
      </div>
    </div>
  );
}
