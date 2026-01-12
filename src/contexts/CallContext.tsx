'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { VoiceCallService, CallData, CALL_TIMEOUT } from '@/app/pages/groups/_lib/voice-call-service'
import { sendCallMessage } from '@/app/pages/groups/_lib/chat-service'

export type CallState = 
  | 'idle'           // No call
  | 'outgoing'       // Calling someone, waiting for answer
  | 'incoming'       // Receiving a call
  | 'connecting'     // Call answered, establishing connection
  | 'connected'      // Call active and audio flowing
  | 'ending'         // Call ending

// Check if running in native app (React Native WebView)
function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(
    localStorage.getItem('isNativeApp') === 'true' ||
    (window as any).isNativeApp ||
    (window as any).ReactNativeWebView
  )
}

interface CallContextType {
  // State
  callState: CallState
  currentCall: CallData | null
  isMuted: boolean
  callDuration: number
  remoteStream: MediaStream | null
  
  // Actions
  startCall: (chatId: string, receiverId: string, callerName: string, receiverName: string, callerAvatar?: string, receiverAvatar?: string) => Promise<boolean>
  answerCall: () => Promise<boolean>
  declineCall: () => Promise<void>
  endCall: () => Promise<void>
  toggleMute: () => void
}

const CallContext = createContext<CallContextType | null>(null)

export function useCall() {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within CallProvider')
  }
  return context
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  
  // Core state
  const [callState, setCallState] = useState<CallState>('idle')
  const [currentCall, setCurrentCall] = useState<CallData | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  
  // Refs
  const serviceRef = useRef<VoiceCallService | null>(null)
  const callStartTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize service
  useEffect(() => {
    if (!user?.uid) {
      serviceRef.current = null
      return
    }
    
    console.log('[CallContext] Initializing VoiceCallService for user:', user.uid)
    const service = new VoiceCallService(user.uid)
    
    service.setCallbacks({
      onIncomingCall: (call) => {
        console.log('[CallContext] Incoming call from:', call.callerName)
        setCurrentCall(call)
        setCallState('incoming')
      },
      
      onCallAnswered: (call) => {
        console.log('[CallContext] Call answered, transitioning to connecting')
        setCurrentCall(call)
        setCallState('connecting')
        callStartTimeRef.current = Date.now()
      },
      
      onCallEnded: async (call, reason) => {
        console.log('[CallContext] Call ended:', reason)
        
        // Play end sound
        service.playCallEndSound(reason)
        
        // Send call message to chat - ONLY if this user is the CALLER
        // This prevents duplicate messages from both caller and receiver
        if (call.chatId && call.callerId === user?.uid) {
          try {
            if (reason === 'missed' || reason === 'timeout') {
              await sendCallMessage(call.chatId, 'missed', call.callerName)
            } else if (reason === 'declined') {
              await sendCallMessage(call.chatId, 'declined', call.callerName)
            } else if (reason === 'ended' && call.answeredAt) {
              const duration = call.duration || Math.floor((Date.now() - call.answeredAt) / 1000)
              await sendCallMessage(call.chatId, 'answered', call.callerName, duration)
            }
          } catch (error) {
            console.error('[CallContext] Error sending call message:', error)
          }
        }
        
        resetState()
      },
      
      onRemoteStream: (stream) => {
        console.log('[CallContext] Remote stream received - call is now connected')
        setRemoteStream(stream)
        setCallState('connected')
      },
      
      onCallTimeout: async (call) => {
        console.log('[CallContext] Call timeout - handled by onCallEnded')
        resetState()
      }
    })
    
    const cleanup = service.startListening()
    serviceRef.current = service
    
    // Listen for incoming call events from notifications
    const handleIncomingCallEvent = async (event: CustomEvent) => {
      console.log('[CallContext] Received incomingVoiceCall event:', event.detail)
      const { callId, callerName, callerAvatar, action, fromNotification } = event.detail
      
      // If from notification, check for pending calls
      if (callId && service) {
        console.log('[CallContext] Checking for pending calls, callId:', callId)
        
        // First try to check for pending calls in the database
        const foundCall = await service.checkForPendingCalls()
        
        // If no ringing call found, the call may have ended - show feedback
        if (!foundCall) {
          console.log('[CallContext] No active call found - may have ended')
          // Dispatch event to show missed call toast
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: callerName ? `Missed call from ${callerName}` : 'Call ended',
              type: 'info'
            }
          }))
        }
      }
    }
    
    window.addEventListener('incomingVoiceCall', handleIncomingCallEvent as unknown as EventListener)
    
    return () => {
      cleanup()
      service.cleanup()
      serviceRef.current = null
      window.removeEventListener('incomingVoiceCall', handleIncomingCallEvent as unknown as EventListener)
    }
  }, [user?.uid]) // Only re-initialize when user changes, NOT on callState change
  
  // Duration timer
  useEffect(() => {
    if (callState === 'connected' || callState === 'connecting') {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
    
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [callState])
  
  const resetState = useCallback(() => {
    setCallState('idle')
    setCurrentCall(null)
    setIsMuted(false)
    setCallDuration(0)
    setRemoteStream(null)
    callStartTimeRef.current = null
  }, [])
  
  // Actions - simplified, no permission modal
  const startCall = useCallback(async (
    chatId: string,
    receiverId: string,
    callerName: string,
    receiverName: string,
    callerAvatar?: string,
    receiverAvatar?: string
  ): Promise<boolean> => {
    if (!serviceRef.current || callState !== 'idle') {
      console.log('[CallContext] Cannot start call - service not ready or already in call')
      return false
    }
    
    console.log('[CallContext] Starting call to:', receiverName)
    setCallState('outgoing')
    
    // Just start the call - browser will show native permission prompt if needed
    // Native apps handle permissions on their side
    const call = await serviceRef.current.startCall(
      chatId,
      receiverId,
      callerName,
      receiverName,
      callerAvatar,
      receiverAvatar
    )
    
    if (call) {
      setCurrentCall(call)
      return true
    } else {
      // Call failed to start (could be permission denied or other error)
      console.log('[CallContext] Failed to start call')
      resetState()
      return false
    }
  }, [callState, resetState])
  
  const answerCall = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current || !currentCall || callState !== 'incoming') {
      return false
    }
    
    console.log('[CallContext] Answering call')
    setCallState('connecting')
    
    const success = await serviceRef.current.answerCall(currentCall)
    if (success) {
      callStartTimeRef.current = Date.now()
      return true
    } else {
      resetState()
      return false
    }
  }, [currentCall, callState, resetState])
  
  const declineCall = useCallback(async (): Promise<void> => {
    if (!serviceRef.current || !currentCall) return
    
    console.log('[CallContext] Declining call')
    serviceRef.current.playCallEndSound('declined')
    await serviceRef.current.declineCall(currentCall)
    
    resetState()
  }, [currentCall, resetState])
  
  const endCall = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) return
    
    console.log('[CallContext] Ending call')
    setCallState('ending')
    serviceRef.current.playCallEndSound('ended')
    
    const endedCall = await serviceRef.current.endCall()
    
    if (endedCall?.chatId && endedCall.answeredAt && endedCall.callerId === user?.uid) {
      const duration = endedCall.duration || callDuration
      await sendCallMessage(endedCall.chatId, 'answered', endedCall.callerName, duration)
    }
    
    resetState()
  }, [callDuration, resetState, user?.uid])
  
  const toggleMute = useCallback(() => {
    if (!serviceRef.current) return
    const muted = serviceRef.current.toggleMute()
    setIsMuted(muted)
  }, [])
  
  return (
    <CallContext.Provider value={{
      callState,
      currentCall,
      isMuted,
      callDuration,
      remoteStream,
      startCall,
      answerCall,
      declineCall,
      endCall,
      toggleMute
    }}>
      {children}
    </CallContext.Provider>
  )
}
