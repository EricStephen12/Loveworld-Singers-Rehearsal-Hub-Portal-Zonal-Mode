/**
 * VOICE CALL SERVICE
 * WebRTC-based voice calling for groups chat
 */

import { 
  ref, 
  set, 
  get, 
  remove, 
  push,
  onValue,
  onChildAdded,
  off
} from 'firebase/database'
import { realtimeDb, isRealtimeDbAvailable } from '@/lib/firebase-setup'

// ICE servers for WebRTC
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
]

export interface CallData {
  id: string
  chatId: string
  callerId: string
  callerName: string
  callerAvatar?: string
  receiverId: string
  receiverName?: string
  receiverAvatar?: string
  status: 'ringing' | 'answered' | 'ended' | 'declined' | 'missed'
  startedAt: number
  answeredAt?: number
  endedAt?: number
  duration?: number // in seconds
  offer?: RTCSessionDescriptionInit
  answer?: RTCSessionDescriptionInit
}

// Call timeout in milliseconds (30 seconds)
export const CALL_TIMEOUT = 30000

export interface VoiceCallState {
  isInCall: boolean
  isCalling: boolean
  isReceiving: boolean
  isMuted: boolean
  callData: CallData | null
  remoteStream: MediaStream | null
  localStream: MediaStream | null
}

type CallEventCallback = {
  onIncomingCall?: (call: CallData) => void
  onCallAnswered?: (call: CallData) => void
  onCallEnded?: (call: CallData, reason: 'ended' | 'declined' | 'missed' | 'timeout') => void
  onRemoteStream?: (stream: MediaStream) => void
  onIceCandidate?: (candidate: RTCIceCandidate) => void
  onCallTimeout?: (call: CallData) => void
}

export class VoiceCallService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private currentCallId: string | null = null
  private currentCall: CallData | null = null
  private userId: string
  private callbacks: CallEventCallback = {}
  private unsubscribers: (() => void)[] = []
  private pendingCandidates: RTCIceCandidateInit[] = []
  private callTimeoutId: NodeJS.Timeout | null = null
  private ringtoneContext: AudioContext | null = null
  private ringtoneOscillator: OscillatorNode | null = null
  private ringtoneGain: GainNode | null = null
  private ringtoneInterval: NodeJS.Timeout | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  // Play ringtone using Web Audio API
  private playRingtone() {
    if (typeof window === 'undefined') return
    
    try {
      // Create audio context
      this.ringtoneContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.ringtoneGain = this.ringtoneContext.createGain()
      this.ringtoneGain.connect(this.ringtoneContext.destination)
      this.ringtoneGain.gain.value = 0.3

      // Play ring pattern: beep-beep, pause, beep-beep
      const playBeep = (frequency: number, duration: number) => {
        if (!this.ringtoneContext || !this.ringtoneGain) return
        
        const osc = this.ringtoneContext.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = frequency
        osc.connect(this.ringtoneGain)
        osc.start()
        setTimeout(() => osc.stop(), duration)
      }

      const ringPattern = () => {
        playBeep(440, 200) // A4
        setTimeout(() => playBeep(554, 200), 250) // C#5
        setTimeout(() => playBeep(440, 200), 600)
        setTimeout(() => playBeep(554, 200), 850)
      }

      // Play immediately and repeat
      ringPattern()
      this.ringtoneInterval = setInterval(ringPattern, 2000)
    } catch (error) {
      console.error('[VoiceCall] Error playing ringtone:', error)
    }
  }

  // Stop ringtone
  private stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval)
      this.ringtoneInterval = null
    }
    if (this.ringtoneContext) {
      this.ringtoneContext.close().catch(() => {})
      this.ringtoneContext = null
    }
    this.ringtoneGain = null
  }

  // Start call timeout
  private startCallTimeout(call: CallData) {
    this.clearCallTimeout()
    this.callTimeoutId = setTimeout(async () => {
      console.log('[VoiceCall] Call timeout - no answer')
      await this.handleCallTimeout(call)
    }, CALL_TIMEOUT)
  }

  // Clear call timeout
  private clearCallTimeout() {
    if (this.callTimeoutId) {
      clearTimeout(this.callTimeoutId)
      this.callTimeoutId = null
    }
  }

  // Handle call timeout
  private async handleCallTimeout(call: CallData) {
    if (!realtimeDb) return
    
    try {
      // Update status to missed
      await set(ref(realtimeDb, `voice_calls/${call.receiverId}/${call.id}/status`), 'missed')
      await set(ref(realtimeDb, `voice_calls/${call.callerId}/${call.id}/status`), 'missed')
      await set(ref(realtimeDb, `voice_calls/${call.receiverId}/${call.id}/endedAt`), Date.now())
      await set(ref(realtimeDb, `voice_calls/${call.callerId}/${call.id}/endedAt`), Date.now())
      
      this.callbacks.onCallTimeout?.(call)
      this.callbacks.onCallEnded?.(call, 'timeout')
    } catch (error) {
      console.error('[VoiceCall] Error handling timeout:', error)
    }
    
    this.cleanup()
  }

  // Set event callbacks
  setCallbacks(callbacks: CallEventCallback) {
    this.callbacks = callbacks
  }

  // Start listening for incoming calls
  startListening(): () => void {
    if (!isRealtimeDbAvailable() || !realtimeDb) {
      console.warn('[VoiceCall] Realtime Database not available')
      return () => {}
    }

    const callsRef = ref(realtimeDb, `voice_calls/${this.userId}`)
    
    // Listen for new calls
    const unsub = onChildAdded(callsRef, (snapshot) => {
      const call = snapshot.val() as CallData
      if (call && call.status === 'ringing' && call.callerId !== this.userId) {
        this.currentCallId = call.id
        this.currentCall = call
        this.playRingtone()
        this.callbacks.onIncomingCall?.(call)
      }
    })

    // Also listen for status changes on existing calls (for caller to know when answered/declined)
    const statusUnsub = onValue(callsRef, (snapshot) => {
      if (!snapshot.exists()) return
      
      const calls = snapshot.val()
      Object.entries(calls).forEach(([callId, callData]: [string, any]) => {
        if (callId === this.currentCallId) {
          if (callData.status === 'answered' && this.currentCall?.status !== 'answered') {
            this.clearCallTimeout()
            this.stopRingtone()
            this.currentCall = { ...callData, id: callId }
            this.callbacks.onCallAnswered?.(this.currentCall!)
          } else if (callData.status === 'declined' && this.currentCall?.status !== 'declined') {
            this.clearCallTimeout()
            this.stopRingtone()
            this.currentCall = { ...callData, id: callId }
            this.callbacks.onCallEnded?.(this.currentCall!, 'declined')
            this.cleanup()
          } else if (callData.status === 'ended' && this.currentCall?.status !== 'ended') {
            this.clearCallTimeout()
            this.stopRingtone()
            this.currentCall = { ...callData, id: callId }
            this.callbacks.onCallEnded?.(this.currentCall!, 'ended')
            this.cleanup()
          } else if (callData.status === 'missed' && this.currentCall?.status !== 'missed') {
            this.clearCallTimeout()
            this.stopRingtone()
            this.currentCall = { ...callData, id: callId }
            this.callbacks.onCallEnded?.(this.currentCall!, 'missed')
            this.cleanup()
          }
        }
      })
    })

    this.unsubscribers.push(() => off(callsRef))
    return () => this.cleanup()
  }

  // Initialize local audio stream
  async initLocalStream(): Promise<boolean> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      })
      return true
    } catch (error) {
      console.error('[VoiceCall] Failed to get local stream:', error)
      return false
    }
  }

  // Create peer connection
  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('[VoiceCall] Remote track received')
      this.remoteStream = event.streams[0]
      this.callbacks.onRemoteStream?.(event.streams[0])
    }

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && this.currentCallId) {
        await this.sendIceCandidate(event.candidate)
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('[VoiceCall] Connection state:', pc.connectionState)
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.endCall()
      }
    }

    this.peerConnection = pc
    return pc
  }


  // Start a call to another user
  async startCall(
    chatId: string,
    receiverId: string,
    callerName: string,
    receiverName: string,
    callerAvatar?: string,
    receiverAvatar?: string
  ): Promise<CallData | null> {
    try {
      if (!isRealtimeDbAvailable() || !realtimeDb) {
        console.error('[VoiceCall] Realtime Database not available')
        return null
      }

      // Initialize local stream
      const hasStream = await this.initLocalStream()
      if (!hasStream) {
        console.error('[VoiceCall] Failed to initialize local stream')
        return null
      }

      // Create peer connection
      const pc = this.createPeerConnection()

      // Create offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Create call data
      const callRef = push(ref(realtimeDb, `voice_calls/${receiverId}`))
      const callId = callRef.key!
      this.currentCallId = callId

      const callData: CallData = {
        id: callId,
        chatId,
        callerId: this.userId,
        callerName,
        callerAvatar,
        receiverId,
        receiverName,
        receiverAvatar,
        status: 'ringing',
        startedAt: Date.now(),
        offer: offer
      }

      this.currentCall = callData

      await set(callRef, callData)

      // Also store in caller's calls for tracking
      await set(ref(realtimeDb, `voice_calls/${this.userId}/${callId}`), callData)

      // Listen for answer
      this.listenForAnswer(callId, receiverId)

      // Listen for ICE candidates from receiver
      this.listenForIceCandidates(callId, receiverId)

      // Start call timeout
      this.startCallTimeout(callData)

      return callData
    } catch (error) {
      console.error('[VoiceCall] Error starting call:', error)
      return null
    }
  }

  // Listen for answer from receiver
  private listenForAnswer(callId: string, receiverId: string) {
    if (!realtimeDb) return

    const answerRef = ref(realtimeDb, `voice_calls/${receiverId}/${callId}/answer`)
    
    const unsub = onValue(answerRef, async (snapshot) => {
      if (snapshot.exists() && this.peerConnection) {
        const answer = snapshot.val() as RTCSessionDescriptionInit
        console.log('[VoiceCall] Received answer')
        
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          
          // Process pending ICE candidates
          for (const candidate of this.pendingCandidates) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          }
          this.pendingCandidates = []
        } catch (error) {
          console.error('[VoiceCall] Error setting remote description:', error)
        }
      }
    })

    this.unsubscribers.push(() => off(answerRef))
  }

  // Answer an incoming call
  async answerCall(callData: CallData): Promise<boolean> {
    try {
      if (!isRealtimeDbAvailable() || !realtimeDb) return false

      // Stop ringtone and clear any timeout
      this.stopRingtone()
      this.clearCallTimeout()

      // Initialize local stream
      const hasStream = await this.initLocalStream()
      if (!hasStream) return false

      // Create peer connection
      const pc = this.createPeerConnection()

      // Set remote description (offer)
      if (callData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(callData.offer))
      }

      // Create answer
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      const answeredAt = Date.now()

      // Update call with answer
      const callRef = ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}`)
      await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/answer`), answer)
      await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/status`), 'answered')
      await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/answeredAt`), answeredAt)

      // Also update caller's copy
      await set(ref(realtimeDb, `voice_calls/${callData.callerId}/${callData.id}/answer`), answer)
      await set(ref(realtimeDb, `voice_calls/${callData.callerId}/${callData.id}/status`), 'answered')
      await set(ref(realtimeDb, `voice_calls/${callData.callerId}/${callData.id}/answeredAt`), answeredAt)

      this.currentCallId = callData.id
      this.currentCall = { ...callData, status: 'answered', answeredAt }

      // Listen for ICE candidates from caller
      this.listenForIceCandidates(callData.id, callData.callerId)

      return true
    } catch (error) {
      console.error('[VoiceCall] Error answering call:', error)
      return false
    }
  }

  // Decline an incoming call
  async declineCall(callData: CallData): Promise<void> {
    if (!realtimeDb) return

    // Stop ringtone
    this.stopRingtone()
    this.clearCallTimeout()

    const endedAt = Date.now()

    await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/status`), 'declined')
    await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/endedAt`), endedAt)
    await set(ref(realtimeDb, `voice_calls/${callData.callerId}/${callData.id}/status`), 'declined')
    await set(ref(realtimeDb, `voice_calls/${callData.callerId}/${callData.id}/endedAt`), endedAt)
    
    this.cleanup()
  }

  // End current call
  async endCall(): Promise<CallData | null> {
    if (!realtimeDb || !this.currentCallId) return null

    // Stop ringtone and clear timeout
    this.stopRingtone()
    this.clearCallTimeout()

    let endedCall: CallData | null = null

    try {
      // Update status in both users' call records
      const callRef = ref(realtimeDb, `voice_calls/${this.userId}/${this.currentCallId}`)
      const snapshot = await get(callRef)
      
      if (snapshot.exists()) {
        const call = snapshot.val() as CallData
        const otherUserId = call.callerId === this.userId ? call.receiverId : call.callerId
        const endedAt = Date.now()
        const duration = call.answeredAt ? Math.floor((endedAt - call.answeredAt) / 1000) : 0
        
        await set(ref(realtimeDb, `voice_calls/${this.userId}/${this.currentCallId}/status`), 'ended')
        await set(ref(realtimeDb, `voice_calls/${this.userId}/${this.currentCallId}/endedAt`), endedAt)
        await set(ref(realtimeDb, `voice_calls/${this.userId}/${this.currentCallId}/duration`), duration)
        await set(ref(realtimeDb, `voice_calls/${otherUserId}/${this.currentCallId}/status`), 'ended')
        await set(ref(realtimeDb, `voice_calls/${otherUserId}/${this.currentCallId}/endedAt`), endedAt)
        await set(ref(realtimeDb, `voice_calls/${otherUserId}/${this.currentCallId}/duration`), duration)
        
        endedCall = { ...call, id: this.currentCallId, status: 'ended', endedAt, duration }
      }
    } catch (error) {
      console.error('[VoiceCall] Error ending call:', error)
    }

    this.cleanup()
    return endedCall
  }

  // Send ICE candidate
  private async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!realtimeDb || !this.currentCallId) return

    try {
      const callRef = ref(realtimeDb, `voice_calls/${this.userId}/${this.currentCallId}`)
      const snapshot = await get(callRef)
      
      if (snapshot.exists()) {
        const call = snapshot.val() as CallData
        const otherUserId = call.callerId === this.userId ? call.receiverId : call.callerId
        
        const candidateRef = push(ref(realtimeDb, `voice_calls/${otherUserId}/${this.currentCallId}/candidates`))
        await set(candidateRef, candidate.toJSON())
      }
    } catch (error) {
      console.error('[VoiceCall] Error sending ICE candidate:', error)
    }
  }

  // Listen for ICE candidates
  private listenForIceCandidates(callId: string, fromUserId: string) {
    if (!realtimeDb) return

    const candidatesRef = ref(realtimeDb, `voice_calls/${this.userId}/${callId}/candidates`)
    
    const unsub = onChildAdded(candidatesRef, async (snapshot) => {
      const candidate = snapshot.val() as RTCIceCandidateInit
      
      if (this.peerConnection) {
        if (this.peerConnection.remoteDescription) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        } else {
          this.pendingCandidates.push(candidate)
        }
      }
    })

    this.unsubscribers.push(() => off(candidatesRef))
  }

  // Toggle mute
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return !audioTrack.enabled // Return muted state
      }
    }
    return false
  }

  // Get streams
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  // Cleanup
  cleanup() {
    // Stop ringtone
    this.stopRingtone()
    
    // Clear timeout
    this.clearCallTimeout()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Clear unsubscribers
    this.unsubscribers.forEach(unsub => unsub())
    this.unsubscribers = []

    this.remoteStream = null
    this.currentCallId = null
    this.currentCall = null
    this.pendingCandidates = []
  }

  // Get current call data
  getCurrentCall(): CallData | null {
    return this.currentCall
  }
}
