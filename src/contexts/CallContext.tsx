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
  | 'permission-needed' // Need to request microphone permission
  | 'permission-denied' // Microphone permission denied

// Check microphone permission
async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt'> {
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

interface CallContextType {
  // State
  callState: CallState
  currentCall: CallData | null
  isMuted: boolean
  callDuration: number
  remoteStream: MediaStream | null
  permissionError: boolean
  showPermissionModal: boolean
  
  // Actions
  startCall: (chatId: string, receiverId: string, callerName: string, receiverName: string, callerAvatar?: string, receiverAvatar?: string) => Promise<boolean>
  answerCall: () => Promise<boolean>
  declineCall: () => Promise<void>
  endCall: () => Promise<void>
  toggleMute: () => void
  retryPermission: () => Promise<boolean>
  onPermissionGranted: () => void
  onPermissionDenied: () => void
  closePermissionModal: () => void
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
  const [permissionError, setPermissionError] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  
  // Refs
  const serviceRef = useRef<VoiceCallService | null>(null)
  const callStartTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingCallRef = useRef<{
    chatId: string
    receiverId: string
    callerName: string
    receiverName: string
    callerAvatar?: string
    receiverAvatar?: string
  } | null>(null)
  
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
      
      // onCallTimeout is handled by onCallEnded with reason 'timeout'
      // No need to send message here - it would cause duplicates
      onCallTimeout: async (call) => {
        console.log('[CallContext] Call timeout - handled by onCallEnded')
        // Don't send message here - onCallEnded already handles it
        // Just reset state (sound is played by onCallEnded)
        resetState()
      }
    })
    
    const cleanup = service.startListening()
    serviceRef.current = service
    
    return () => {
      cleanup()
      service.cleanup()
      serviceRef.current = null
    }
  }, [user?.uid])
  
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
    setPermissionError(false)
    callStartTimeRef.current = null
  }, [])
  
  // Actions
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
    
    // Check microphone permission first
    const permStatus = await checkMicrophonePermission()
    
    // If permission not granted, show our custom modal
    if (permStatus !== 'granted') {
      console.log('[CallContext] Microphone permission needed, showing modal')
      // Store pending call info
      pendingCallRef.current = { chatId, receiverId, callerName, receiverName, callerAvatar, receiverAvatar }
      setCallState('permission-needed')
      setShowPermissionModal(true)
      return false
    }
    
    console.log('[CallContext] Starting call to:', receiverName)
    setCallState('outgoing')
    
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
      setPermissionError(false)
      return true
    } else {
      // Check if it was a permission error
      const newStatus = await checkMicrophonePermission()
      if (newStatus === 'denied') {
        setCallState('permission-denied')
        setPermissionError(true)
        setCurrentCall({ 
          id: '', chatId, callerId: '', callerName, receiverId, receiverName, 
          status: 'ringing', startedAt: Date.now() 
        })
      } else {
        resetState()
      }
      return false
    }
  }, [callState, resetState])
  
  // Handle permission granted from modal
  const onPermissionGranted = useCallback(async () => {
    setShowPermissionModal(false)
    setPermissionError(false)
    
    // If we have a pending call, start it now
    if (pendingCallRef.current && serviceRef.current) {
      const { chatId, receiverId, callerName, receiverName, callerAvatar, receiverAvatar } = pendingCallRef.current
      pendingCallRef.current = null
      
      console.log('[CallContext] Permission granted, starting pending call')
      setCallState('outgoing')
      
      const call = await serviceRef.current.startCall(
        chatId, receiverId, callerName, receiverName, callerAvatar, receiverAvatar
      )
      
      if (call) {
        setCurrentCall(call)
      } else {
        resetState()
      }
    } else {
      setCallState('idle')
    }
  }, [resetState])
  
  // Handle permission denied from modal
  const onPermissionDenied = useCallback(() => {
    setShowPermissionModal(false)
    setPermissionError(true)
    pendingCallRef.current = null
    setCallState('idle')
  }, [])
  
  // Close permission modal
  const closePermissionModal = useCallback(() => {
    setShowPermissionModal(false)
    pendingCallRef.current = null
    setCallState('idle')
  }, [])
  
  // Retry permission for calls
  const retryPermission = useCallback(async (): Promise<boolean> => {
    setPermissionError(false)
    setShowPermissionModal(true)
    return true
  }, [])
  
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
    
    // Don't send message here - the caller will send it via onCallEnded callback
    // This prevents duplicate messages
    
    resetState()
  }, [currentCall, resetState])
  
  const endCall = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) return
    
    console.log('[CallContext] Ending call')
    setCallState('ending')
    serviceRef.current.playCallEndSound('ended')
    
    const endedCall = await serviceRef.current.endCall()
    
    // Only send message if this user is the caller to prevent duplicates
    // The other party will get notified via onCallEnded but won't send a message
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
      permissionError,
      showPermissionModal,
      startCall,
      answerCall,
      declineCall,
      endCall,
      toggleMute,
      retryPermission,
      onPermissionGranted,
      onPermissionDenied,
      closePermissionModal
    }}>
      {children}
    </CallContext.Provider>
  )
}
