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
  receiverId: string
  receiverName?: string
  status: 'ringing' | 'answered' | 'ended' | 'declined' | 'missed'
  startedAt: number
  answeredAt?: number
  endedAt?: number
  offer?: RTCSessionDescriptionInit
  answer?: RTCSessionDescriptionInit
}

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
  onCallEnded?: (call: CallData) => void
  onRemoteStream?: (stream: MediaStream) => void
  onIceCandidate?: (candidate: RTCIceCandidate) => void
}

export class VoiceCallService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private currentCallId: string | null = null
  private userId: string
  private callbacks: CallEventCallback = {}
  private unsubscribers: (() => void)[] = []
  private pendingCandidates: RTCIceCandidateInit[] = []

  constructor(userId: string) {
    this.userId = userId
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
    
    const unsub = onChildAdded(callsRef, (snapshot) => {
      const call = snapshot.val() as CallData
      if (call && call.status === 'ringing' && call.callerId !== this.userId) {
        this.currentCallId = call.id
        this.callbacks.onIncomingCall?.(call)
      }
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
    receiverName: string
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
        receiverId,
        receiverName,
        status: 'ringing',
        startedAt: Date.now(),
        offer: offer
      }

      await set(callRef, callData)

      // Also store in caller's calls for tracking
      await set(ref(realtimeDb, `voice_calls/${this.userId}/${callId}`), callData)

      // Listen for answer
      this.listenForAnswer(callId, receiverId)

      // Listen for ICE candidates from receiver
      this.listenForIceCandidates(callId, receiverId)

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

      // Update call with answer
      const callRef = ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}`)
      await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/answer`), answer)
      await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/status`), 'answered')
      await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/answeredAt`), Date.now())

      // Also update caller's copy
      await set(ref(realtimeDb, `voice_calls/${callData.callerId}/${callData.id}/answer`), answer)
      await set(ref(realtimeDb, `voice_calls/${callData.callerId}/${callData.id}/status`), 'answered')

      this.currentCallId = callData.id

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

    await set(ref(realtimeDb, `voice_calls/${this.userId}/${callData.id}/status`), 'declined')
    await set(ref(realtimeDb, `voice_calls/${callData.callerId}/${callData.id}/status`), 'declined')
    
    this.cleanup()
  }

  // End current call
  async endCall(): Promise<void> {
    if (!realtimeDb || !this.currentCallId) return

    try {
      // Update status in both users' call records
      const callRef = ref(realtimeDb, `voice_calls/${this.userId}/${this.currentCallId}`)
      const snapshot = await get(callRef)
      
      if (snapshot.exists()) {
        const call = snapshot.val() as CallData
        const otherUserId = call.callerId === this.userId ? call.receiverId : call.callerId
        
        await set(ref(realtimeDb, `voice_calls/${this.userId}/${this.currentCallId}/status`), 'ended')
        await set(ref(realtimeDb, `voice_calls/${this.userId}/${this.currentCallId}/endedAt`), Date.now())
        await set(ref(realtimeDb, `voice_calls/${otherUserId}/${this.currentCallId}/status`), 'ended')
        await set(ref(realtimeDb, `voice_calls/${otherUserId}/${this.currentCallId}/endedAt`), Date.now())
      }
    } catch (error) {
      console.error('[VoiceCall] Error ending call:', error)
    }

    this.cleanup()
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
    this.pendingCandidates = []
  }
}
