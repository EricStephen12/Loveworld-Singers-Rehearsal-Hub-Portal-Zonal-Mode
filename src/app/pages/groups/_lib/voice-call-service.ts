/**
 * VOICE CALL SERVICE
 * WebRTC-based voice calling for groups chat
 * Optimized for low latency and reliable connections
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

// Optimized ICE servers - prioritize faster STUN servers
const ICE_SERVERS: RTCIceServer[] = [
  // Google STUN servers (fastest, most reliable)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // Backup TURN servers for NAT traversal
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
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
  private outgoingToneContext: AudioContext | null = null
  private outgoingToneInterval: NodeJS.Timeout | null = null
  private callEndContext: AudioContext | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  // Play a short pleasant sound when call ends/declines/times out
  playCallEndSound(type: 'ended' | 'declined' | 'missed' | 'timeout' = 'ended') {
    if (typeof window === 'undefined') return

    try {
      // Close any existing context
      if (this.callEndContext) {
        this.callEndContext.close().catch(() => { })
      }

      this.callEndContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      if (this.callEndContext.state === 'suspended') {
        this.callEndContext.resume()
      }

      const ctx = this.callEndContext
      const now = ctx.currentTime

      // Create a pleasant two-tone sound (descending for end, different for missed)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc1.type = 'sine'
      osc2.type = 'sine'

      if (type === 'missed' || type === 'timeout') {
        // Lower, softer tone for missed/timeout
        osc1.frequency.value = 392 // G4
        osc2.frequency.value = 330 // E4
      } else if (type === 'declined') {
        // Quick descending tone for declined
        osc1.frequency.value = 440 // A4
        osc2.frequency.value = 349 // F4
      } else {
        // Pleasant end tone
        osc1.frequency.value = 523 // C5
        osc2.frequency.value = 392 // G4
      }

      // Very soft volume
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05)
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.15)
      gainNode.gain.linearRampToValueAtTime(0, now + 0.4)

      osc1.connect(gainNode)
      osc2.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Play first tone
      osc1.start(now)
      osc1.stop(now + 0.2)

      // Play second tone slightly after
      osc2.start(now + 0.15)
      osc2.stop(now + 0.4)

      // Cleanup after sound finishes
      setTimeout(() => {
        if (this.callEndContext) {
          this.callEndContext.close().catch(() => { })
          this.callEndContext = null
        }
      }, 500)

    } catch (error) {
      console.error('[VoiceCall] Error playing call end sound:', error)
    }
  }

  // Play ringtone using Web Audio API - soft and pleasant
  private playRingtone() {
    if (typeof window === 'undefined') return

    try {
      // Create audio context
      this.ringtoneContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.ringtoneGain = this.ringtoneContext.createGain()
      this.ringtoneGain.connect(this.ringtoneContext.destination)
      this.ringtoneGain.gain.value = 0.15 // Very soft volume (15%)

      // Play gentle ring pattern
      const playTone = (frequency: number, duration: number, delay: number = 0) => {
        if (!this.ringtoneContext || !this.ringtoneGain) return

        const osc = this.ringtoneContext.createOscillator()
        const gainNode = this.ringtoneContext.createGain()

        osc.type = 'sine' // Smooth sine wave
        osc.frequency.value = frequency

        // Fade in and out for smoother sound
        gainNode.gain.setValueAtTime(0, this.ringtoneContext.currentTime + delay)
        gainNode.gain.linearRampToValueAtTime(0.15, this.ringtoneContext.currentTime + delay + 0.05)
        gainNode.gain.linearRampToValueAtTime(0, this.ringtoneContext.currentTime + delay + duration)

        osc.connect(gainNode)
        gainNode.connect(this.ringtoneGain!)

        osc.start(this.ringtoneContext.currentTime + delay)
        osc.stop(this.ringtoneContext.currentTime + delay + duration)
      }

      // Gentle two-tone pattern (like a soft doorbell)
      const ringPattern = () => {
        playTone(523, 0.3, 0)      // C5 - first note
        playTone(659, 0.3, 0.35)   // E5 - second note (pleasant interval)
      }

      // Play immediately and repeat every 2.5 seconds
      ringPattern()
      this.ringtoneInterval = setInterval(ringPattern, 2500)
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
      this.ringtoneContext.close().catch(() => { })
      this.ringtoneContext = null
    }
    this.ringtoneGain = null
  }

  // Play outgoing call tone (ringback) - subtle beep for caller
  private playOutgoingTone() {
    if (typeof window === 'undefined') {
      return
    }

    // Stop any existing tone first
    this.stopOutgoingTone()

    try {
      this.outgoingToneContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Resume context if suspended (required by some browsers)
      if (this.outgoingToneContext.state === 'suspended') {
        this.outgoingToneContext.resume()
      }

      const playBeep = () => {
        if (!this.outgoingToneContext || this.outgoingToneContext.state === 'closed') {
          return
        }

        const osc = this.outgoingToneContext.createOscillator()
        const gainNode = this.outgoingToneContext.createGain()

        osc.type = 'sine'
        osc.frequency.value = 440 // A4 note - standard ringback tone

        // Very soft and short beep
        gainNode.gain.setValueAtTime(0, this.outgoingToneContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.08, this.outgoingToneContext.currentTime + 0.05)
        gainNode.gain.linearRampToValueAtTime(0.08, this.outgoingToneContext.currentTime + 0.8)
        gainNode.gain.linearRampToValueAtTime(0, this.outgoingToneContext.currentTime + 1)

        osc.connect(gainNode)
        gainNode.connect(this.outgoingToneContext.destination)

        osc.start(this.outgoingToneContext.currentTime)
        osc.stop(this.outgoingToneContext.currentTime + 1)
      }

      // Play immediately and repeat every 3 seconds (standard ringback pattern)
      playBeep()
      this.outgoingToneInterval = setInterval(playBeep, 3000)
    } catch (error) {
      console.error('[VoiceCall] Error playing outgoing tone:', error)
    }
  }

  // Stop outgoing tone
  private stopOutgoingTone() {
    if (this.outgoingToneInterval) {
      clearInterval(this.outgoingToneInterval)
      this.outgoingToneInterval = null
    }
    if (this.outgoingToneContext) {
      this.outgoingToneContext.close().catch(() => { })
      this.outgoingToneContext = null
    }
  }

  // Start call timeout
  private startCallTimeout(call: CallData) {
    this.clearCallTimeout()
    this.callTimeoutId = setTimeout(async () => {
      await this.handleCallTimeout(call)
    }, CALL_TIMEOUT)
  }

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
      await set(ref(realtimeDb, `voice_calls/${call.receiverId}/${call.id}/status`), 'missed')
      await set(ref(realtimeDb, `voice_calls/${call.callerId}/${call.id}/status`), 'missed')
      await set(ref(realtimeDb, `voice_calls/${call.receiverId}/${call.id}/endedAt`), Date.now())
      await set(ref(realtimeDb, `voice_calls/${call.callerId}/${call.id}/endedAt`), Date.now())

      // Only call onCallEnded - don't call both callbacks to avoid duplicate messages
      // onCallEnded with 'timeout' reason handles everything
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

  // Check for pending calls (used when app opens from notification)
  // Returns true if a ringing call was found
  async checkForPendingCalls(): Promise<boolean> {
    if (!isRealtimeDbAvailable() || !realtimeDb) {
      console.warn('[VoiceCall] Realtime Database not available')
      return false
    }

    try {
      const callsRef = ref(realtimeDb, `voice_calls/${this.userId}`)
      const snapshot = await get(callsRef)

      if (snapshot.exists()) {
        const calls = snapshot.val()

        let foundRingingCall = false

        Object.entries(calls).forEach(([callId, callData]: [string, any]) => {
          // Ignore calls older than 2 minutes (120000ms) to prevent ghost calls from stale records
          const isStale = Date.now() - (callData.startedAt || 0) > 120000

          if (callData.status === 'ringing' && callData.callerId !== this.userId && !isStale) {
            this.currentCallId = callId
            this.currentCall = { ...callData, id: callId }
            this.playRingtone()
            this.callbacks.onIncomingCall?.(this.currentCall!)
            foundRingingCall = true
          }
        })

        return foundRingingCall
      } else {
        return false
      }
    } catch (error) {
      console.error('[VoiceCall] Error checking for pending calls:', error)
      return false
    }
  }

  // Start listening for incoming calls
  startListening(): () => void {
    if (!isRealtimeDbAvailable() || !realtimeDb) {
      console.warn('[VoiceCall] Realtime Database not available')
      return () => { }
    }

    const callsRef = ref(realtimeDb, `voice_calls/${this.userId}`)

    // Listen for new calls
    const unsub = onChildAdded(callsRef, (snapshot) => {
      const call = snapshot.val() as CallData

      // Ignore calls older than 2 minutes
      const isStale = Date.now() - (call.startedAt || 0) > 120000

      if (call && call.status === 'ringing' && call.callerId !== this.userId && !isStale) {
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
            this.stopOutgoingTone()
            this.currentCall = { ...callData, id: callId }
            this.callbacks.onCallAnswered?.(this.currentCall!)
          } else if (callData.status === 'declined' && this.currentCall?.status !== 'declined') {
            this.clearCallTimeout()
            this.stopRingtone()
            this.stopOutgoingTone()
            this.currentCall = { ...callData, id: callId }
            this.callbacks.onCallEnded?.(this.currentCall!, 'declined')
            this.cleanup()
          } else if (callData.status === 'ended' && this.currentCall?.status !== 'ended') {
            this.clearCallTimeout()
            this.stopRingtone()
            this.stopOutgoingTone()
            this.currentCall = { ...callData, id: callId }
            this.callbacks.onCallEnded?.(this.currentCall!, 'ended')
            this.cleanup()
          } else if (callData.status === 'missed' && this.currentCall?.status !== 'missed') {
            this.clearCallTimeout()
            this.stopRingtone()
            this.stopOutgoingTone()
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

  // Initialize local audio stream - optimized for voice
  async initLocalStream(): Promise<boolean> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Optimize for voice
          sampleRate: 48000,
          channelCount: 1
        },
        video: false
      })
      return true
    } catch (error) {
      console.error('[VoiceCall] Failed to get local stream:', error)
      return false
    }
  }

  // Create peer connection - optimized for low latency
  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10, // Pre-gather candidates for faster connection
      bundlePolicy: 'max-bundle', // Bundle all media for efficiency
      rtcpMuxPolicy: 'require' // Multiplex RTP and RTCP
    })

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.callbacks.onRemoteStream?.(event.streams[0])
    }

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && this.currentCallId) {
        await this.sendIceCandidate(event.candidate)
      }
    }

    // Monitor ICE connection state for faster feedback
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.endCall()
      }
    }

    this.peerConnection = pc
    return pc
  }


  // Start a call to another user - optimized for speed
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

      // Start outgoing tone IMMEDIATELY (while still in user gesture context)
      this.playOutgoingTone()

      // Initialize local stream and peer connection in parallel for speed
      const [hasStream] = await Promise.all([
        this.initLocalStream()
      ])

      if (!hasStream) {
        console.error('[VoiceCall] Failed to initialize local stream')
        this.stopOutgoingTone()
        return null
      }

      // Create peer connection
      const pc = this.createPeerConnection()

      // Create offer with optimized settings for voice
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      })
      await pc.setLocalDescription(offer)

      // Create call data - Firebase doesn't allow undefined values
      const callRef = push(ref(realtimeDb, `voice_calls/${receiverId}`))
      const callId = callRef.key!
      this.currentCallId = callId

      const callData: CallData = {
        id: callId,
        chatId,
        callerId: this.userId,
        callerName,
        receiverId,
        status: 'ringing',
        startedAt: Date.now(),
        offer: offer
      }

      // Only add optional fields if they have values
      if (callerAvatar) callData.callerAvatar = callerAvatar
      if (receiverName) callData.receiverName = receiverName
      if (receiverAvatar) callData.receiverAvatar = receiverAvatar

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

      // ✅ ENTERPRISE FEATURE - Send push notification to offline users
      // NON-BLOCKING: Fire and forget to reduce call start latency
      fetch('/api/send-call-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          title: "Incoming Call",
          body: `${callerName} is calling you`,
          data: {
            type: "VOICE_CALL",
            callId: callId,
            callerName: callerName,
            callerAvatar: callerAvatar
          }
        })
      }).catch(notifyError => {
        console.error('[VoiceCall] Failed to send notification:', notifyError);
      });

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

        // Process any pending ICE candidates
        for (const candidate of this.pendingCandidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (e) {
            console.warn('[VoiceCall] Error adding pending ICE candidate:', e)
          }
        }
        this.pendingCandidates = []
      }

      // Create answer
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      const answeredAt = Date.now()

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
    // Stop ringtone and outgoing tone
    this.stopRingtone()
    this.stopOutgoingTone()

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
