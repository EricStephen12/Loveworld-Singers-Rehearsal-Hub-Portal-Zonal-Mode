// WebRTC Service for Video and Voice Calls
export interface CallConfig {
  iceServers: RTCIceServer[]
  audio: boolean
  video: boolean
}

export interface CallState {
  isInCall: boolean
  isCallActive: boolean
  isMuted: boolean
  isVideoEnabled: boolean
  callType: 'video' | 'voice' | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  peerConnection: RTCPeerConnection | null
}

export class WebRTCService {
  private static instance: WebRTCService
  private callState: CallState = {
    isInCall: false,
    isCallActive: false,
    isMuted: false,
    isVideoEnabled: true,
    callType: null,
    localStream: null,
    remoteStream: null,
    peerConnection: null
  }

  private callbacks: {
    onCallStateChange?: (state: CallState) => void
    onRemoteStream?: (stream: MediaStream) => void
    onCallEnded?: () => void
    onIncomingCall?: (signal: any) => void
  } = {}

  private defaultConfig: CallConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    audio: true,
    video: true
  }

  static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService()
    }
    return WebRTCService.instance
  }

  // Set callbacks
  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Get current call state
  getCallState(): CallState {
    return { ...this.callState }
  }

  // Start listening for incoming signals
  async startListeningForCalls(): Promise<void> {
    const { callSignalingService } = await import('./call-signaling-service')
    
    await callSignalingService.listenForSignals(
      // On offer received
      async (signal) => {
        console.log('📞 Incoming call from:', signal.from)
        // Show incoming call UI
        this.callbacks.onIncomingCall?.(signal)
      },
      // On answer received
      async (signal) => {
        if (this.callState.peerConnection) {
          await this.callState.peerConnection.setRemoteDescription(signal.data)
        }
      },
      // On ICE candidate received
      async (signal) => {
        if (this.callState.peerConnection) {
          await this.callState.peerConnection.addIceCandidate(new RTCIceCandidate(signal.data))
        }
      },
      // On call end received
      () => {
        this.endCall()
      }
    )
  }

  // Stop listening for calls
  stopListeningForCalls(): void {
    import('./call-signaling-service').then(({ callSignalingService }) => {
      callSignalingService.stopListening()
    })
  }

  // Start a call (video or voice)
  async startCall(callType: 'video' | 'voice', targetUserId: string): Promise<boolean> {
    try {
      console.log(`Starting ${callType} call with ${targetUserId}`)
      
      // Get user media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? { width: 640, height: 480 } : false
      }

      const localStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection(this.defaultConfig)
      
      // Add local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream')
        const remoteStream = event.streams[0]
        this.callState.remoteStream = remoteStream
        this.callbacks.onRemoteStream?.(remoteStream)
        this.updateCallState()
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated')
          // In a real app, you would send this to the other peer via signaling server
          this.sendSignalingMessage('ice-candidate', event.candidate, targetUserId)
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState)
        if (peerConnection.connectionState === 'connected') {
          this.callState.isCallActive = true
          this.updateCallState()
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          this.endCall()
        }
      }

      // Update call state
      this.callState = {
        ...this.callState,
        isInCall: true,
        callType,
        localStream,
        peerConnection,
        isVideoEnabled: callType === 'video'
      }

      this.updateCallState()

      // Create offer
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      
      // Send offer to other peer
      this.sendSignalingMessage('offer', offer, targetUserId)

      return true
    } catch (error) {
      console.error('Error starting call:', error)
      this.endCall()
      return false
    }
  }

  // Answer an incoming call
  async answerCall(offer: RTCSessionDescriptionInit, targetUserId: string): Promise<boolean> {
    try {
      console.log('Answering call from', targetUserId)
      
      // Get user media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: this.callState.callType === 'video' ? { width: 640, height: 480 } : false
      }

      const localStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection(this.defaultConfig)
      
      // Add local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream')
        const remoteStream = event.streams[0]
        this.callState.remoteStream = remoteStream
        this.callbacks.onRemoteStream?.(remoteStream)
        this.updateCallState()
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated')
          this.sendSignalingMessage('ice-candidate', event.candidate, targetUserId)
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState)
        if (peerConnection.connectionState === 'connected') {
          this.callState.isCallActive = true
          this.updateCallState()
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          this.endCall()
        }
      }

      // Set remote description
      await peerConnection.setRemoteDescription(offer)
      
      // Create answer
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      
      // Send answer to other peer
      this.sendSignalingMessage('answer', answer, targetUserId)

      // Update call state
      this.callState = {
        ...this.callState,
        isInCall: true,
        isCallActive: true,
        localStream,
        peerConnection
      }

      this.updateCallState()
      return true
    } catch (error) {
      console.error('Error answering call:', error)
      this.endCall()
      return false
    }
  }

  // End the current call
  async endCall(): Promise<void> {
    console.log('Ending call')
    
    // Send call end signal to other peer
    if (this.callState.isInCall) {
      const { callSignalingService } = await import('./call-signaling-service')
      // You'll need to store the target user ID in callState
      // await callSignalingService.sendCallEnd(targetUserId)
    }
    
    // Stop local stream
    if (this.callState.localStream) {
      this.callState.localStream.getTracks().forEach(track => track.stop())
    }

    // Close peer connection
    if (this.callState.peerConnection) {
      this.callState.peerConnection.close()
    }

    // Reset call state
    this.callState = {
      isInCall: false,
      isCallActive: false,
      isMuted: false,
      isVideoEnabled: true,
      callType: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null
    }

    this.updateCallState()
    this.callbacks.onCallEnded?.()
  }

  // Toggle mute
  toggleMute(): boolean {
    if (!this.callState.localStream) return false

    const audioTrack = this.callState.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      this.callState.isMuted = !audioTrack.enabled
      this.updateCallState()
      return true
    }
    return false
  }

  // Toggle video
  toggleVideo(): boolean {
    if (!this.callState.localStream) return false

    const videoTrack = this.callState.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      this.callState.isVideoEnabled = videoTrack.enabled
      this.updateCallState()
      return true
    }
    return false
  }

  // Send signaling message through Firebase
  private async sendSignalingMessage(type: string, data: any, targetUserId: string): Promise<void> {
    console.log(`Sending ${type} to ${targetUserId}:`, data)
    
    // Import signaling service dynamically to avoid circular dependencies
    const { callSignalingService } = await import('./call-signaling-service')
    
    switch (type) {
      case 'offer':
        await callSignalingService.sendOffer(targetUserId, data, this.callState.callType!)
        break
      case 'answer':
        await callSignalingService.sendAnswer(targetUserId, data)
        break
      case 'ice-candidate':
        await callSignalingService.sendIceCandidate(targetUserId, data)
        break
    }
  }

  // Update call state and notify callbacks
  private updateCallState(): void {
    this.callbacks.onCallStateChange?.(this.getCallState())
  }

  // Check if device supports WebRTC
  static isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.RTCPeerConnection &&
      window.navigator.mediaDevices &&
      window.navigator.mediaDevices.getUserMedia
    )
  }
}







