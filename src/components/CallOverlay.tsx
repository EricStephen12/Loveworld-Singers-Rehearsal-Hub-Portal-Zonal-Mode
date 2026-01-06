'use client'

import { useEffect, useRef } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react'
import { useCall } from '@/contexts/CallContext'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'

// Helper to darken color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max((num >> 16) - amt, 0)
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0)
  const B = Math.max((num & 0x0000FF) - amt, 0)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

export function CallOverlay() {
  const { user } = useAuth()
  const { currentZone } = useZone()
  const {
    callState,
    currentCall,
    isMuted,
    callDuration,
    remoteStream,
    answerCall,
    declineCall,
    endCall,
    toggleMute
  } = useCall()
  
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  
  // Get zone color
  const primaryColor = currentZone?.themeColor || '#8B5CF6'
  const darkColor = darkenColor(primaryColor, 30)
  const darkerColor = darkenColor(primaryColor, 50)
  
  // Play remote audio
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream
      remoteAudioRef.current.play().catch(console.error)
    }
  }, [remoteStream])
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Get the other person's info
  const getOtherPerson = () => {
    if (!currentCall) return { name: 'Unknown', avatar: undefined }
    
    if (currentCall.callerId === user?.uid) {
      return {
        name: currentCall.receiverName || 'Unknown',
        avatar: currentCall.receiverAvatar
      }
    }
    return {
      name: currentCall.callerName,
      avatar: currentCall.callerAvatar
    }
  }
  
  const otherPerson = getOtherPerson()
  
  // Don't render if idle
  if (callState === 'idle') {
    return <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
  }
  
  const isIncoming = callState === 'incoming'
  const isActive = callState === 'connected' || callState === 'connecting'
  const isOutgoing = callState === 'outgoing'
  
  return (
    <>
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      
      {/* Incoming Call UI */}
      {isIncoming && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: `linear-gradient(180deg, ${primaryColor} 0%, ${darkColor} 50%, ${darkerColor} 100%)` }}
        >
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Avatar with pulsing rings */}
            <div className="relative w-44 h-44 flex items-center justify-center mb-10">
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
              
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-4xl font-semibold shadow-2xl">
                {otherPerson.avatar ? (
                  <img 
                    src={otherPerson.avatar} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  otherPerson.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {otherPerson.name}
            </h1>
            <p className="text-white/80 text-lg">
              Incoming voice call
            </p>
          </div>
          
          <div className="pb-20 px-6">
            <div className="flex justify-center items-center gap-20">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={declineCall}
                  className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-white/80 text-sm">Decline</span>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={answerCall}
                  className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <Phone className="w-7 h-7" />
                </button>
                <span className="text-white/80 text-sm">Answer</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Outgoing Call UI */}
      {isOutgoing && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: `linear-gradient(180deg, ${primaryColor} 0%, ${darkColor} 50%, ${darkerColor} 100%)` }}
        >
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="relative w-44 h-44 flex items-center justify-center mb-10">
              <div 
                className="absolute inset-0 rounded-full opacity-20 animate-[ping_2s_ease-in-out_infinite]"
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
              
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-4xl font-semibold shadow-2xl">
                {otherPerson.avatar ? (
                  <img 
                    src={otherPerson.avatar} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  otherPerson.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {otherPerson.name}
            </h1>
            <p className="text-white/80 text-lg flex items-center gap-2">
              Calling
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </p>
          </div>
          
          <div className="pb-20 px-6">
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-white/80 text-sm">Cancel</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Active Call UI */}
      {isActive && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: `linear-gradient(180deg, ${darkColor} 0%, ${darkerColor} 100%)` }}
        >
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="relative mb-8">
              {callState === 'connected' && (
                <div 
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center z-20 shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Volume2 className="w-4 h-4 text-white animate-pulse" />
                </div>
              )}
              
              <div 
                className="w-28 h-28 rounded-full flex items-center justify-center text-white text-5xl font-semibold shadow-2xl"
                style={{ backgroundColor: primaryColor }}
              >
                {otherPerson.avatar ? (
                  <img 
                    src={otherPerson.avatar} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  otherPerson.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {otherPerson.name}
            </h1>
            
            <p className="text-xl font-mono flex items-center gap-2" style={{ color: primaryColor }}>
              {callState === 'connecting' ? (
                <>
                  Connecting
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '300ms' }} />
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                  {formatDuration(callDuration)}
                </>
              )}
            </p>
          </div>
          
          <div className="pb-20 px-6">
            <div className="flex justify-center items-center gap-16">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    isMuted 
                      ? 'bg-white text-slate-900' 
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <span className="text-white/60 text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-white/60 text-sm">End</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
