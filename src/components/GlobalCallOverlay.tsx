'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { VoiceCallService, CallData } from '@/app/pages/groups/_lib/voice-call-service'
import { sendCallMessage } from '@/app/pages/groups/_lib/chat-service'

export function GlobalCallOverlay() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [voiceCallService, setVoiceCallService] = useState<VoiceCallService | null>(null)
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null)
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [currentCall, setCurrentCall] = useState<CallData | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const callStartTimeRef = useRef<number | null>(null)

  // Initialize voice call service globally
  useEffect(() => {
    if (!user?.uid) return

    const service = new VoiceCallService(user.uid)
    service.setCallbacks({
      onIncomingCall: (call) => {
        console.log('[GlobalCall] Incoming call from:', call.callerName)
        setIncomingCall(call)
        setCurrentCall(call)
      },
      onCallAnswered: (call) => {
        console.log('[GlobalCall] Call answered')
        setIsInCall(true)
        setIncomingCall(null)
        setCurrentCall(call)
        callStartTimeRef.current = Date.now()
      },
      onCallEnded: async (call, reason) => {
        console.log('[GlobalCall] Call ended:', reason)
        
        // Send call message to chat
        if (call.chatId) {
          if (reason === 'missed' || reason === 'timeout') {
            await sendCallMessage(call.chatId, 'missed', call.callerName)
          } else if (reason === 'declined') {
            await sendCallMessage(call.chatId, 'declined', call.callerName)
          } else if (reason === 'ended' && call.answeredAt) {
            const duration = call.duration || Math.floor((Date.now() - call.answeredAt) / 1000)
            await sendCallMessage(call.chatId, 'answered', call.callerName, duration)
          }
        }
        
        resetCallState()
      },
      onRemoteStream: (stream) => {
        console.log('[GlobalCall] Remote stream received')
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream
          remoteAudioRef.current.play().catch(console.error)
        }
      },
      onCallTimeout: async (call) => {
        console.log('[GlobalCall] Call timeout')
        if (call.chatId) {
          await sendCallMessage(call.chatId, 'missed', call.callerName)
        }
        resetCallState()
      }
    })

    const cleanup = service.startListening()
    setVoiceCallService(service)

    return () => {
      cleanup()
      service.cleanup()
    }
  }, [user?.uid])

  // Call duration timer
  useEffect(() => {
    if (!isInCall) return

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isInCall])

  const resetCallState = () => {
    setIsInCall(false)
    setIncomingCall(null)
    setCurrentCall(null)
    setCallDuration(0)
    setIsMuted(false)
    callStartTimeRef.current = null
  }

  // Answer call
  const handleAnswer = async () => {
    if (!voiceCallService || !incomingCall) return
    
    const success = await voiceCallService.answerCall(incomingCall)
    if (success) {
      setIsInCall(true)
      setIncomingCall(null)
      callStartTimeRef.current = Date.now()
    }
  }

  // Decline call
  const handleDecline = async () => {
    if (!voiceCallService || !incomingCall) return
    
    await voiceCallService.declineCall(incomingCall)
    
    // Send declined message
    if (incomingCall.chatId) {
      await sendCallMessage(incomingCall.chatId, 'declined', incomingCall.callerName)
    }
    
    resetCallState()
  }

  // End call
  const handleEndCall = async () => {
    if (!voiceCallService) return
    
    const endedCall = await voiceCallService.endCall()
    
    // Send call ended message
    if (endedCall?.chatId && endedCall.answeredAt) {
      const duration = endedCall.duration || callDuration
      await sendCallMessage(endedCall.chatId, 'answered', endedCall.callerName, duration)
    }
    
    resetCallState()
  }

  // Toggle mute
  const handleToggleMute = () => {
    if (!voiceCallService) return
    const muted = voiceCallService.toggleMute()
    setIsMuted(muted)
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get caller/receiver display name
  const getOtherPersonName = () => {
    if (!currentCall) return 'Unknown'
    if (currentCall.callerId === user?.uid) {
      return currentCall.receiverName || 'Unknown'
    }
    return currentCall.callerName
  }

  // Don't render if no call activity
  if (!incomingCall && !isInCall) {
    return <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Incoming Call UI */}
      {incomingCall && !isInCall && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            {/* Caller Avatar */}
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full mx-auto bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-green-500/30">
                {incomingCall.callerAvatar ? (
                  <img 
                    src={incomingCall.callerAvatar} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  incomingCall.callerName.charAt(0).toUpperCase()
                )}
              </div>
              {/* Pulsing ring */}
              <div className="absolute inset-0 w-28 h-28 mx-auto rounded-full border-4 border-green-400 animate-ping opacity-30" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{incomingCall.callerName}</h2>
            <p className="text-gray-400 mb-8 flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 animate-pulse" />
              Incoming voice call...
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-8">
              <button
                onClick={handleDecline}
                className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:bg-red-600 active:scale-95 transition-all"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <button
                onClick={handleAnswer}
                className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/40 hover:bg-green-600 active:scale-95 transition-all animate-bounce"
              >
                <Phone className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call UI - Compact floating bar */}
      {isInCall && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-600 text-white px-4 py-3 shadow-lg safe-area-top">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {getOtherPersonName().charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{getOtherPersonName()}</p>
                <p className="text-xs text-white/80">{formatDuration(callDuration)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mute Button */}
              <button
                onClick={handleToggleMute}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 active:scale-95 transition-all"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
