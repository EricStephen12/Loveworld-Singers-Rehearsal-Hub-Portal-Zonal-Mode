'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, PhoneOff, Users, Copy, Check, Volume2, MessageCircle, Wifi, WifiOff, Loader2, Radio, AlertCircle, Settings
} from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { 
  subscribeToSession, 
  leaveSession, 
  endSession,
  toggleMute as toggleMuteService,
  subscribeToMessages
} from '../_lib/session-service';
import { WebRTCService } from '../_lib/webrtc-service';
import type { Participant, ChatMessage } from '../_types';

// Helper to darken color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max((num >> 16) - amt, 0)
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0)
  const B = Math.max((num & 0x0000FF) - amt, 0)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

// Check if running in native app (React Native WebView)
function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(
    localStorage.getItem('isNativeApp') === 'true' ||
    (window as any).isNativeApp ||
    (window as any).ReactNativeWebView
  )
}

// Check microphone permission
async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt'> {
  // Skip permission check for native apps - permissions are handled natively
  if (isNativeApp()) {
    console.log('[LiveSession] Native app detected - skipping permission check')
    return 'granted'
  }
  
  try {
    if (navigator.permissions) {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    }
    return 'prompt';
  } catch {
    return 'prompt';
  }
}

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
    osc.frequency.value = 880;
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
  const { currentZone } = useZone();
  const currentSession = state.session.currentSession;
  
  // Zone colors
  const primaryColor = currentZone?.themeColor || '#8B5CF6';
  const darkColor = darkenColor(primaryColor, 30);
  const darkerColor = darkenColor(primaryColor, 50);
  
  const [webrtcService] = useState(() => new WebRTCService());
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  
  const [isLive, setIsLive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'permission-denied'>('connecting');
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Subscribe to session updates
  useEffect(() => {
    if (!currentSession?.id) return;
    
    const unsubscribe = subscribeToSession(currentSession.id, {
      onParticipantJoined: (participant) => {
        setParticipants(prev => {
          if (prev.find(p => p.id === participant.id)) return prev;
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
      // Check permission first
      const permissionStatus = await checkMicrophonePermission();
      
      if (permissionStatus === 'denied') {
        setConnectionStatus('permission-denied');
        setShowPermissionPrompt(true);
        return;
      }
      
      const success = await webrtcService.initializeLocalStream();
      if (!success) {
        // Check if it was a permission error
        const newStatus = await checkMicrophonePermission();
        if (newStatus === 'denied') {
          setConnectionStatus('permission-denied');
          setShowPermissionPrompt(true);
        } else {
          setConnectionStatus('failed');
          setShowPermissionPrompt(true);
        }
        return;
      }
      
      setConnectionStatus('connected');
      setShowPermissionPrompt(false);
      
      webrtcService.setOnRemoteStreamAdded((userId, stream) => {
        console.log('[LiveSession] Remote stream added from:', userId);
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

  // Retry microphone permission
  const handleRetryPermission = async () => {
    setConnectionStatus('connecting');
    setShowPermissionPrompt(false);
    
    try {
      const success = await webrtcService.initializeLocalStream();
      if (success) {
        setConnectionStatus('connected');
        
        // Re-setup remote stream handler
        webrtcService.setOnRemoteStreamAdded((userId, stream) => {
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
            audio.play().catch(() => {});
          };
          audioElementsRef.current[userId] = audio;
        });
        
        // Connect to host if not host
        if (user?.uid && currentSession?.hostId && user.uid !== currentSession.hostId) {
          webrtcService.createPeerConnection(currentSession.hostId, true);
          await webrtcService.requestOfferFrom(currentSession.hostId);
        }
      } else {
        const status = await checkMicrophonePermission();
        setConnectionStatus(status === 'denied' ? 'permission-denied' : 'failed');
        setShowPermissionPrompt(true);
      }
    } catch (error) {
      setConnectionStatus('failed');
      setShowPermissionPrompt(true);
    }
  };

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
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
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
      <div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white"
        style={{ background: `linear-gradient(180deg, ${darkColor} 0%, ${darkerColor} 100%)` }}
      >
        <p className="text-white/60 mb-4">No active session</p>
        <button
          onClick={() => setView('collab')}
          className="px-6 py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isHost = user?.uid === currentSession.hostId;
  const participantCount = participants.length || 1;
  const otherParticipants = participants.filter(p => p.id !== user?.uid);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col text-white"
      style={{ background: `linear-gradient(180deg, ${primaryColor} 0%, ${darkColor} 50%, ${darkerColor} 100%)` }}
    >
      {/* Top Bar */}
      <div className="relative z-10 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          {/* Chat Button */}
          <button
            onClick={() => setView('collab-chat')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm">Chat</span>
          </button>
          
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-500/20 text-green-300' 
              : connectionStatus === 'connecting'
              ? 'bg-yellow-500/20 text-yellow-300'
              : connectionStatus === 'permission-denied'
              ? 'bg-orange-500/20 text-orange-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {connectionStatus === 'connecting' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Connecting</span>
              </>
            ) : connectionStatus === 'connected' ? (
              <>
                <Wifi size={14} />
                <span>Live</span>
              </>
            ) : connectionStatus === 'permission-denied' ? (
              <>
                <MicOff size={14} />
                <span>No Mic</span>
              </>
            ) : (
              <>
                <WifiOff size={14} />
                <span>Failed</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Microphone Permission Prompt */}
      {showPermissionPrompt && (
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <MicOff size={32} className="text-orange-500" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Microphone Access Required
            </h3>
            
            <p className="text-gray-600 text-sm mb-6">
              {connectionStatus === 'permission-denied' 
                ? 'Microphone permission was denied. Please enable it in your browser settings to join the live session.'
                : 'We need access to your microphone to join the live session. Please allow microphone access when prompted.'
              }
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRetryPermission}
                className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {connectionStatus === 'permission-denied' ? 'Try Again' : 'Enable Microphone'}
              </button>
              
              {connectionStatus === 'permission-denied' && (
                <p className="text-xs text-gray-500">
                  On iOS: Settings → Safari → Microphone
                  <br />
                  On Android: Settings → Apps → Browser → Permissions
                </p>
              )}
              
              <button
                onClick={() => {
                  clearSession();
                  setView('collab');
                }}
                className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-gray-100"
              >
                Leave Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Session Code */}
        <button 
          onClick={handleCopyCode}
          className="mb-10 flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all active:scale-95"
        >
          <span className="text-2xl font-bold tracking-[0.3em] text-white">
            {currentSession.code}
          </span>
          {copied ? (
            <Check size={20} className="text-green-400" />
          ) : (
            <Copy size={20} className="text-white/60" />
          )}
        </button>

        {/* Participants Circle with Pulsing Rings */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          {/* Pulsing rings */}
          <div 
            className="absolute inset-0 rounded-full opacity-20 animate-ping"
            style={{ border: `3px solid white` }}
          />
          <div 
            className="absolute inset-3 rounded-full opacity-30 animate-pulse"
            style={{ border: `2px solid white` }}
          />
          <div 
            className="absolute inset-6 rounded-full opacity-40"
            style={{ border: `2px solid white` }}
          />
          
          {/* Main circle */}
          <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            {participantCount <= 4 ? (
              <div className="flex flex-wrap items-center justify-center gap-1 p-2">
                {/* Current user */}
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  isMuted ? 'bg-red-500/30 text-red-300' : 'bg-white/20 text-white'
                }`}>
                  {profile?.first_name?.charAt(0) || 'Y'}
                  {!isMuted && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <Mic size={10} />
                    </div>
                  )}
                </div>
                
                {/* Other participants */}
                {otherParticipants.slice(0, 3).map((p) => {
                  const isConnected = connectedPeers.has(p.id);
                  return (
                    <div 
                      key={p.id}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        p.isMuted ? 'bg-white/10 text-white/50' : 'bg-white/20 text-white'
                      } ${!isConnected ? 'opacity-50' : ''}`}
                    >
                      {p.name?.charAt(0) || '?'}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                        !isConnected ? 'bg-yellow-500' : p.isMuted ? 'bg-white/30' : 'bg-green-500'
                      }`}>
                        {!isConnected ? (
                          <Loader2 size={8} className="animate-spin" />
                        ) : p.isMuted ? (
                          <MicOff size={7} />
                        ) : (
                          <Volume2 size={8} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center">
                <Users size={32} className="text-white/80 mx-auto mb-1" />
                <span className="text-2xl font-bold">{participantCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="text-5xl font-mono font-light text-white mb-2 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          {formatTime(elapsedTime)}
        </div>
        
        {/* Status */}
        <p className="text-white/60 text-sm mb-2">
          {isHost ? 'You\'re hosting this session' : `Hosted by ${currentSession.title?.replace("'s Session", '') || 'Host'}`}
        </p>
        
        {/* Participant count */}
        <p className="text-white/40 text-xs">
          {participantCount} participant{participantCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="relative px-6 pb-12 pt-6">
        <div className="flex items-center justify-center gap-8">
          {/* Mute Button */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={handleToggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                isMuted 
                  ? 'bg-white text-slate-900' 
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <span className="text-white/60 text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
          </div>

          {/* End/Leave Button */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={handleEndOrLeave}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-red-500/30"
            >
              <PhoneOff size={28} />
            </button>
            <span className="text-white/60 text-xs">{isHost ? 'End' : 'Leave'}</span>
          </div>

          {/* Participants Button */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex flex-col items-center justify-center">
              <Users size={18} className="text-white/80" />
              <span className="text-xs font-bold">{participantCount}</span>
            </div>
            <span className="text-white/60 text-xs">People</span>
          </div>
        </div>
      </div>
    </div>
  );
}
