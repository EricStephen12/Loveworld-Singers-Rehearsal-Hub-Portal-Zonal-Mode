/**
 * WebRTC Service for AudioLab
 * Handles peer-to-peer audio connections for live sessions
 */

import { WebRTCSignaling, SignalMessage } from './webrtc-signaling';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  audioStream?: MediaStream;
  isHost: boolean;
  pendingCandidates: RTCIceCandidateInit[]; // Queue for ICE candidates before remote description
}

export class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private config: WebRTCConfig;
  private onRemoteStreamAdded: ((userId: string, stream: MediaStream) => void) | null = null;
  private onDataReceived: ((userId: string, data: any) => void) | null = null;
  private onConnectionStateChanged: ((userId: string, state: string) => void) | null = null;
  private signalingService: WebRTCSignaling | null = null;
  private sessionId: string | null = null;
  private userId: string | null = null;

  constructor(config?: Partial<WebRTCConfig>) {
    // Use multiple STUN servers and free TURN servers for better connectivity
    this.config = {
      iceServers: config?.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // Free TURN servers from Open Relay Project (for NAT traversal)
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
    };
  }

  initializeSignaling(sessionId: string, userId: string): void {
    this.sessionId = sessionId;
    this.userId = userId;
    this.signalingService = new WebRTCSignaling(sessionId, userId);
    
    // Start listening for incoming signals
    this.signalingService.startListening((message) => {
      this.handleSignalMessage(message);
    });
  }

  async initializeLocalStream(): Promise<boolean> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      return true;
    } catch (error) {
      console.error('Error initializing local stream:', error);
      return false;
    }
  }

  private async handleSignalMessage(message: SignalMessage): Promise<void> {
    const { type, from, payload } = message;
    console.log(`[WebRTC] Received signal: ${type} from ${from}`);
    
    if (!this.peerConnections.has(from)) {
      // Create peer connection if it doesn't exist
      this.createPeerConnection(from, false);
    }
    
    const peer = this.peerConnections.get(from);
    const pc = peer?.connection;
    if (!pc) return;
    
    try {
      switch (type) {
        case 'offer':
          console.log('[WebRTC] Processing offer...');
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          
          // Process any queued ICE candidates
          if (peer.pendingCandidates.length > 0) {
            console.log(`[WebRTC] Processing ${peer.pendingCandidates.length} queued ICE candidates`);
            for (const candidate of peer.pendingCandidates) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            peer.pendingCandidates = [];
          }
          
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await this.signalingService?.sendSignal(from, 'answer', answer);
          console.log('[WebRTC] Sent answer');
          break;
          
        case 'answer':
          console.log('[WebRTC] Processing answer...');
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          
          // Process any queued ICE candidates
          if (peer.pendingCandidates.length > 0) {
            console.log(`[WebRTC] Processing ${peer.pendingCandidates.length} queued ICE candidates`);
            for (const candidate of peer.pendingCandidates) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            peer.pendingCandidates = [];
          }
          break;
          
        case 'ice-candidate':
          // Queue ICE candidates if remote description not set yet
          if (!pc.remoteDescription) {
            console.log('[WebRTC] Queuing ICE candidate (no remote description yet)');
            peer.pendingCandidates.push(payload);
          } else {
            console.log('[WebRTC] Adding ICE candidate');
            await pc.addIceCandidate(new RTCIceCandidate(payload));
          }
          break;
      }
    } catch (error) {
      console.error('[WebRTC] Error handling signal message:', error);
    }
  }

  createPeerConnection(userId: string, isHost: boolean): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.config);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle remote streams
    pc.ontrack = (event) => {
      if (this.onRemoteStreamAdded) {
        this.onRemoteStreamAdded(userId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.signalingService) {
        // Send candidate to remote peer via signaling
        this.signalingService.sendSignal(userId, 'ice-candidate', event.candidate);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.removePeerConnection(userId);
      }
    };

    // Create data channel for text chat and signaling
    const dataChannel = pc.createDataChannel('chat', {
      ordered: true,
    });

    dataChannel.onopen = () => {
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onDataReceived) {
          this.onDataReceived(userId, data);
        }
      } catch (e) {
        console.error('Error parsing data channel message:', e);
      }
    };

    pc.ondatachannel = (event) => {
      event.channel.onmessage = (dataEvent) => {
        try {
          const data = JSON.parse(dataEvent.data);
          if (this.onDataReceived) {
            this.onDataReceived(userId, data);
          }
        } catch (e) {
          console.error('Error parsing data channel message:', e);
        }
      };
    };

    this.peerConnections.set(userId, {
      id: userId,
      connection: pc,
      dataChannel,
      isHost,
      pendingCandidates: []
    });

    return pc;
  }

  async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.getPeerConnection(userId);
    if (!pc) throw new Error('Peer connection not found');

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(userId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.getPeerConnection(userId);
    if (!pc) throw new Error('Peer connection not found');

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(userId: string, desc: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.getPeerConnection(userId);
    if (!pc) throw new Error('Peer connection not found');

    await pc.setRemoteDescription(new RTCSessionDescription(desc));
  }

  async addIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.getPeerConnection(userId);
    if (!pc) throw new Error('Peer connection not found');

    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  sendToPeer(userId: string, data: any): boolean {
    const peer = this.peerConnections.get(userId);
    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
      return false;
    }

    peer.dataChannel.send(JSON.stringify(data));
    return true;
  }

  sendToAll(data: any): void {
    this.peerConnections.forEach((peer, userId) => {
      if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
        peer.dataChannel.send(JSON.stringify(data));
      }
    });
  }

  getPeerConnection(userId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(userId)?.connection;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getAllPeerIds(): string[] {
    return Array.from(this.peerConnections.keys());
  }

  removePeerConnection(userId: string): void {
    const peer = this.peerConnections.get(userId);
    if (peer) {
      peer.connection.close();
      this.peerConnections.delete(userId);
    }
  }

  closeAllConnections(): void {
    this.peerConnections.forEach(peer => {
      peer.connection.close();
    });
    this.peerConnections.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // Public method to send signals through the signaling service
  async sendSignal(toUserId: string, type: string, payload: any): Promise<void> {
    if (this.signalingService) {
      await this.signalingService.sendSignal(toUserId, type as any, payload);
    }
  }

  // Set callback handlers
  setOnRemoteStreamAdded(handler: (userId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamAdded = handler;
  }

  setOnDataReceived(handler: (userId: string, data: any) => void): void {
    this.onDataReceived = handler;
  }
}