'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, Wifi, Eye, Headphones, MicOff, 
  StopCircle, Volume2, VolumeX, Users, Copy, Check, LogOut
} from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  subscribeToSession, 
  leaveSession, 
  endSession,
  toggleMute as toggleMuteService,
  sendMessage,
  subscribeToMessages
} from '../_lib/session-service';
import { WebRTCService } from '../_lib/webrtc-service';
import type { Participant, ChatMessage } from '../_types';

export function LiveSessionView() {
  const { goBack, state, clearSession, setView } = useAudioLab();
  const { user, profile } = useAuth();
  const currentSession = state.session.currentSession;
  
  const [webrtcService] = useState(() => new WebRTCService());
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});
  
  const [isLive, setIsLive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [micGain, setMicGain] = useState(75);
  const [elapsedTime, setElapsedTime] = useState({ hours: 0, mins: 0, secs: 0 });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copied, setCopied] = useState(false);

  // Subscribe to session updates
  useEffect(() => {
    if (!currentSession?.id) return;
    
    const unsubscribe = subscribeToSession(currentSession.id, {
      onParticipantJoined: (participant) => {
        setParticipants(prev => {
          if (prev.find(p => p.id === participant.id)) return prev;
          return [...prev, participant];
        });
        
        // Create peer connection for new participant
        if (user?.uid && participant.id !== user.uid) {
          // Create peer connection
          webrtcService.createPeerConnection(participant.id, participant.id === currentSession.hostId);
          
          // If we're the host, initiate the connection
          if (user.uid === currentSession.hostId) {
            setTimeout(async () => {
              try {
                const offer = await webrtcService.createOffer(participant.id);
                await webrtcService.sendSignal(participant.id, 'offer', offer);
              } catch (error) {
                console.error('Error creating offer:', error);
              }
            }, 1000); // Small delay to ensure connection is ready
          }
        }
      },
      onParticipantLeft: (participantId) => {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
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
    
    // Initialize signaling
    webrtcService.initializeSignaling(currentSession.id, user.uid);
    
    const setupWebRTC = async () => {
      // Initialize local audio stream
      const success = await webrtcService.initializeLocalStream();
      if (!success) {
        console.error('Failed to initialize local audio stream');
        return;
      }
      
      // Set up callbacks
      webrtcService.setOnRemoteStreamAdded((userId, stream) => {
        // Create audio element for remote stream
        const audio = new Audio();
        audio.srcObject = stream;
        audio.play().catch(e => console.error('Error playing remote audio:', e));
        
        setAudioElements(prev => ({
          ...prev,
          [userId]: audio
        }));
      });
      
      webrtcService.setOnDataReceived((userId, data) => {
        // Handle received data (chat, commands, etc.)
      });
    };
    
    setupWebRTC();
    
    // Cleanup on unmount
    return () => {
      webrtcService.closeAllConnections();
      
      // Stop all audio elements
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.srcObject = null;
      });
    };
  }, [user?.uid, currentSession?.id, webrtcService, audioElements]);

  // Subscribe to messages
  useEffect(() => {
    if (!currentSession?.id) return;
    
    const unsubscribe = subscribeToMessages(currentSession.id, (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => unsubscribe();
  }, [currentSession?.id]);

  // Timer effect
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        let { hours, mins, secs } = prev;
        secs++;
        if (secs >= 60) { secs = 0; mins++; }
        if (mins >= 60) { mins = 0; hours++; }
        return { hours, mins, secs };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  // Copy session code
  const handleCopyCode = async () => {
    if (!currentSession?.code) return;
    await navigator.clipboard.writeText(currentSession.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle mute
  const handleToggleMute = async () => {
    if (!currentSession?.id || !user?.uid) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    await toggleMuteService(currentSession.id, user.uid, newMuted);
  };

  // Leave session
  const handleLeaveSession = async () => {
    if (!currentSession?.id || !user?.uid) return;
    await leaveSession(currentSession.id, user.uid, profile?.display_name || 'User');
    clearSession();
    setView('collab');
  };

  // End session (host only)
  const handleEndSession = async () => {
    if (!currentSession?.id) return;
    await endSession(currentSession.id);
    clearSession();
    setView('collab');
  };

  // If no session, show empty state
  if (!currentSession) {
    return (
      <div className="fixed inset-0 z-50 bg-[#191022] flex flex-col items-center justify-center text-white">
        <p className="text-slate-400 mb-4">No active session</p>
        <button
          onClick={() => setView('collab')}
          className="px-6 py-3 bg-violet-500 rounded-xl font-bold"
        >
          Go to Collab
        </button>
      </div>
    );
  }

  // Waveform bars data - animate when live
  const [waveformBars, setWaveformBars] = useState([
    { h: 10, opacity: 0.4 },
    { h: 16, opacity: 0.6 },
    { h: 20, opacity: 1, glow: true },
    { h: 14, opacity: 0.8 },
    { h: 24, opacity: 1, glow: true },
    { h: 32, opacity: 1, glow: true },
    { h: 20, opacity: 0.9 },
    { h: 36, opacity: 1, glow: true },
    { h: 24, opacity: 0.8 },
    { h: 28, opacity: 1, glow: true },
    { h: 16, opacity: 0.6 },
    { h: 12, opacity: 0.4 },
    { h: 8, opacity: 0.3 },
  ]);

  // Animate waveform when live
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setWaveformBars(prev => prev.map(bar => ({
        ...bar,
        h: Math.max(4, Math.min(40, bar.h + (Math.random() - 0.5) * 8))
      })));
    }, 150);
    
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="fixed inset-0 z-50 bg-[#191022] flex flex-col overflow-hidden text-white select-none">
      {/* Header & Status Area */}
      <div className="flex flex-col w-full z-20 bg-[#191022]/95 backdrop-blur-sm">
        {/* Top Bar */}
        <header className="flex items-center p-4 pb-2 justify-between">
          <div className="flex items-center justify-start w-12">
            <button 
              onClick={goBack}
              className="flex size-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">Live Session</h2>
          <div className="flex w-12 items-center justify-end">
            <button className="flex items-center justify-center gap-2" title="Connection Strength">
              <Wifi size={20} className="text-green-400" />
            </button>
          </div>
        </header>

        {/* Status Chips */}
        <div className="flex justify-center gap-3 px-4 pb-4 pt-1">
          <div 
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full pl-3 pr-4 ${
              isLive ? 'bg-red-600' : 'bg-slate-600'
            }`}
            style={{ boxShadow: isLive ? '0 0 15px rgba(220, 38, 38, 0.5)' : 'none' }}
          >
            <span className={`w-2 h-2 rounded-full bg-white ${isLive ? 'animate-pulse' : ''}`} />
            <p className="text-white text-sm font-bold leading-normal tracking-wider">
              {isLive ? 'LIVE' : 'ENDED'}
            </p>
          </div>
          {/* Session Code - Tap to copy */}
          <button 
            onClick={handleCopyCode}
            className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-violet-500/20 backdrop-blur-md pl-3 pr-4 border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-violet-400" />}
            <p className="text-violet-300 text-sm font-bold leading-normal tracking-wider">
              {currentSession.code}
            </p>
          </button>
          <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/10 backdrop-blur-md pl-3 pr-4 border border-white/5">
            <Users size={16} className="text-slate-200" />
            <p className="text-slate-200 text-sm font-medium leading-normal">{participants.length || 1}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center gap-2 px-6 py-2">
          {/* Hours */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#362348] border border-white/5 shadow-sm">
              <p className="text-white text-xl font-bold">{formatNum(elapsedTime.hours)}</p>
            </div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hrs</p>
          </div>
          <div className="h-12 flex items-center text-slate-600 font-bold">:</div>
          {/* Minutes */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#362348] border border-white/5 shadow-sm">
              <p className="text-white text-xl font-bold">{formatNum(elapsedTime.mins)}</p>
            </div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Min</p>
          </div>
          <div className="h-12 flex items-center text-slate-600 font-bold">:</div>
          {/* Seconds */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#362348] border border-white/5 shadow-sm">
              <p className="text-violet-500 text-xl font-bold">{formatNum(elapsedTime.secs)}</p>
            </div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Sec</p>
          </div>
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center w-full min-h-0 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent opacity-50 pointer-events-none" />

        {/* Status Text */}
        <div className="absolute top-4 w-full text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-[#ad92c9] text-xs font-bold tracking-wide uppercase">High Quality Audio</p>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="flex items-center justify-center gap-1.5 h-40 w-full px-8">
          {waveformBars.map((bar, i) => (
            <div
              key={i}
              className="w-2 rounded-full transition-all duration-300"
              style={{
                height: `${bar.h * 4}px`,
                backgroundColor: `rgba(127, 19, 236, ${bar.opacity})`,
                boxShadow: bar.glow ? '0 0 15px #7f13ec' : 'none',
                transition: 'height 150ms ease-out',
              }}
            />
          ))}
        </div>

        {/* Chat Overlay */}
        <div className="w-full mt-auto px-4 pb-4 z-10 relative">
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#191022] to-transparent -z-10" />
          <div className="flex w-full flex-col gap-2 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 shadow-lg max-h-32 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-slate-400 text-sm text-center">
                No messages yet
              </p>
            ) : (
              messages.slice(-5).map((msg) => (
                <div key={msg.id} className={`text-sm ${msg.type === 'system' ? 'text-slate-500 italic text-center' : 'text-white'}`}>
                  {msg.type !== 'system' && (
                    <span className="text-violet-400 font-medium">{msg.senderName}: </span>
                  )}
                  {msg.content}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Control Deck */}
      <div className="relative bg-[#251833] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-6 pb-10 z-30">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

        {/* Gain Control */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex justify-between items-center px-1">
            <label className="text-[#ad92c9] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h4l3-9 6 18 3-9h4" />
              </svg>
              Mic Gain
            </label>
            <span className="text-violet-500 font-bold text-xs bg-violet-500/10 px-2 py-0.5 rounded">
              {micGain}%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <VolumeX size={20} className="text-slate-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={micGain}
              onChange={(e) => setMicGain(parseInt(e.target.value))}
              className="flex-1 h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <Volume2 size={20} className="text-white" />
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex items-center justify-between gap-6 px-2">
          {/* Monitor Toggle */}
          <button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="flex flex-col items-center gap-2 group w-20"
          >
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-95 ${
              isMonitoring 
                ? 'bg-violet-500/20 border-violet-500 text-violet-400' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}>
              <Headphones size={24} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Monitor</span>
          </button>

          {/* End/Leave Session - Host vs Participant */}
          <button 
            onClick={user?.uid === currentSession?.hostId ? handleEndSession : handleLeaveSession}
            className="flex flex-col items-center gap-2 group relative -mt-6"
          >
            {/* Outer glow */}
            {isLive && (
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse" />
            )}
            {/* Main button */}
            <div 
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-xl shadow-red-500/30 active:scale-95 transition-all border-[6px] border-[#251833]"
            >
              <LogOut size={36} className="drop-shadow-md" />
            </div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide mt-1">
              {user?.uid === currentSession?.hostId ? 'End' : 'Leave'}
            </span>
          </button>

          {/* Mute Toggle */}
          <button 
            onClick={handleToggleMute}
            className="flex flex-col items-center gap-2 group w-20"
          >
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-95 ${
              isMuted 
                ? 'bg-red-500/20 border-red-500 text-red-400' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}>
              <MicOff size={24} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}
