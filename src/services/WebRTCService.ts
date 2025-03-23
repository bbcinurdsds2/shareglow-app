
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type PeerSignal = {
  type: 'offer' | 'answer' | 'ice-candidate';
  sender: string;
  receiver: string;
  data: any;
};

export type PeerEvents = {
  onLocalStream: (stream: MediaStream) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onDisconnect: () => void;
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private roomId: string;
  private userId: string;
  private events: PeerEvents;
  private signalChannel: any; // Supabase channel
  
  constructor(roomId: string, userId: string, events: PeerEvents) {
    this.roomId = roomId;
    this.userId = userId;
    this.events = events;
    
    // Initialize WebRTC peer connection with STUN servers
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });
    
    // Set up event handlers
    this.setupPeerConnectionListeners();
    this.setupSignalingChannel();
  }
  
  // Setup WebRTC event listeners
  private setupPeerConnectionListeners() {
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          sender: this.userId,
          receiver: 'all', // We'll filter on the receiving side
          data: event.candidate
        });
      }
    };
    
    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      this.events.onConnectionStateChange(this.peerConnection.connectionState);
      
      if (this.peerConnection.connectionState === 'disconnected' || 
          this.peerConnection.connectionState === 'failed') {
        this.events.onDisconnect();
      }
    };
    
    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach(track => {
          if (this.remoteStream) {
            this.remoteStream.addTrack(track);
          }
        });
        this.events.onRemoteStream(this.remoteStream);
      }
    };
  }
  
  // Setup signaling channel using Supabase Realtime
  private setupSignalingChannel() {
    this.signalChannel = supabase.channel(`room:${this.roomId}`, {
      config: {
        broadcast: { self: false }
      }
    });
    
    this.signalChannel
      .on('broadcast', { event: 'signal' }, async (payload: { payload: PeerSignal }) => {
        const signal = payload.payload;
        
        // Process only signals that are intended for us or for "all"
        if (signal.receiver !== this.userId && signal.receiver !== 'all') return;
        
        try {
          if (signal.type === 'offer') {
            await this.handleOffer(signal.data);
          } else if (signal.type === 'answer') {
            await this.handleAnswer(signal.data);
          } else if (signal.type === 'ice-candidate') {
            await this.handleIceCandidate(signal.data);
          }
        } catch (error) {
          console.error('Error handling signal:', error);
        }
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to signaling channel:', status);
        }
      });
  }
  
  // Start local media stream (audio only for this implementation)
  public async startLocalStream(audioOnly: boolean = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: !audioOnly
      });
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
      
      this.events.onLocalStream(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      toast.error('Failed to access microphone. Please check permissions.');
      throw error;
    }
  }
  
  // Create and send an offer
  public async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignal({
        type: 'offer',
        sender: this.userId,
        receiver: 'all',
        data: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create call offer.');
    }
  }
  
  // Handle an incoming offer
  private async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.sendSignal({
        type: 'answer',
        sender: this.userId,
        receiver: 'all',
        data: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }
  
  // Handle an incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }
  
  // Handle an incoming ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }
  
  // Send a signal through the signaling channel
  private sendSignal(signal: PeerSignal) {
    this.signalChannel.send({
      type: 'broadcast',
      event: 'signal',
      payload: signal
    });
  }
  
  // End the call and clean up resources
  public endCall() {
    // Stop all tracks in local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    this.peerConnection.close();
    
    // Unsubscribe from signaling channel
    if (this.signalChannel) {
      supabase.removeChannel(this.signalChannel);
    }
  }
}
