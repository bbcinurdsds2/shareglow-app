
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Copy, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { WebRTCService } from '@/services/WebRTCService';
import { useAuth } from '@/contexts/AuthContext';
import { gsap } from 'gsap';

interface Participant {
  id: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const Room = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [isMicActive, setIsMicActive] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const webRTCRef = useRef<WebRTCService | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Fetch room information and join the room
  useEffect(() => {
    if (!user || !roomCode) return;

    const fetchRoomAndJoin = async () => {
      try {
        // Get room information from the code
        const { data: roomData, error: roomError } = await supabase
          .from('call_rooms')
          .select('*')
          .eq('room_code', roomCode)
          .eq('is_active', true)
          .single();

        if (roomError || !roomData) {
          toast.error('Invalid or inactive room code');
          navigate('/');
          return;
        }

        setRoomId(roomData.id);

        // Join as participant
        const { error: joinError } = await supabase
          .from('participants')
          .insert({
            room_id: roomData.id,
            user_id: user.id
          });

        if (joinError) {
          console.error('Error joining room:', joinError);
        }

        // Start animation for the room elements
        gsap.from('.room-card', {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1
        });

        setIsConnecting(false);
      } catch (error) {
        console.error('Error in room setup:', error);
        toast.error('Failed to join room');
        navigate('/');
      }
    };

    fetchRoomAndJoin();

    // Cleanup when leaving room
    return () => {
      endCall();
      
      // Mark user as left if they were in a room
      if (roomId && user) {
        supabase
          .from('participants')
          .update({ left_at: new Date().toISOString() })
          .eq('room_id', roomId)
          .eq('user_id', user.id)
          .is('left_at', null)
          .then(({ error }) => {
            if (error) console.error('Error updating participant status:', error);
          });
      }
    };
  }, [user, roomCode, navigate]);

  // Subscribe to participants
  useEffect(() => {
    if (!roomId) return;

    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          id,
          user_id,
          profiles: user_id (
            username,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .is('left_at', null);

      if (error) {
        console.error('Error fetching participants:', error);
        return;
      }

      setParticipants(data as unknown as Participant[]);
    };

    fetchParticipants();

    // Set up real-time subscription for participants
    const participantsSubscription = supabase
      .channel('public:participants')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `room_id=eq.${roomId}`
      }, () => {
        fetchParticipants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(participantsSubscription);
    };
  }, [roomId]);

  // Initialize WebRTC when room is ready
  const startCall = async () => {
    if (!user || !roomId) return;
    
    try {
      if (webRTCRef.current) {
        endCall();
      }
      
      webRTCRef.current = new WebRTCService(roomId, user.id, {
        onLocalStream: (stream) => {
          if (localAudioRef.current) {
            localAudioRef.current.srcObject = stream;
          }
        },
        onRemoteStream: (stream) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.play().catch(err => console.error('Error playing remote audio:', err));
          }
        },
        onConnectionStateChange: (state) => {
          console.log('Connection state changed:', state);
          if (state === 'connected') {
            setIsCallActive(true);
            toast.success('Call connected!');
          } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
            setIsCallActive(false);
          }
        },
        onDisconnect: () => {
          setIsCallActive(false);
          toast.info('Call disconnected');
        }
      });
      
      // Start local stream (audio only)
      await webRTCRef.current.startLocalStream(true);
      
      // Create offer for others to join
      await webRTCRef.current.createOffer();
      
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call. Please check your microphone permissions.');
    }
  };

  const endCall = () => {
    if (webRTCRef.current) {
      webRTCRef.current.endCall();
      webRTCRef.current = null;
    }
    
    setIsCallActive(false);
  };

  const toggleMicrophone = () => {
    if (!localAudioRef.current?.srcObject) return;
    
    const stream = localAudioRef.current.srcObject as MediaStream;
    const audioTracks = stream.getAudioTracks();
    
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = !audioTracks[0].enabled;
      setIsMicActive(audioTracks[0].enabled);
    }
  };

  const copyRoomLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Room link copied to clipboard');
  };

  const leaveRoom = () => {
    endCall();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to join a call room.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {isConnecting ? (
          <Card className="room-card glassmorphism">
            <CardHeader className="text-center">
              <CardTitle>Connecting to Room</CardTitle>
              <CardDescription>Please wait...</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card className="room-card glassmorphism mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Room: {roomCode}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 mt-2">
                  <div className="bg-primary/10 rounded-lg px-3 py-1 flex items-center gap-2">
                    Room Code: <span className="font-mono font-bold">{roomCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={copyRoomLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  {isCallActive ? (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75"></div>
                        <Avatar className="h-24 w-24 border-4 border-primary">
                          <AvatarFallback>{profile?.username?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                        </Avatar>
                      </div>
                      <p className="text-xl font-semibold">Call in progress</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={startCall} 
                      size="lg" 
                      className="bg-green-500 hover:bg-green-600 rounded-full h-16 w-16 p-0"
                    >
                      <Phone className="h-6 w-6" />
                    </Button>
                  )}
                  
                  <div className="flex space-x-4 mt-4">
                    {isCallActive && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={isMicActive ? "" : "bg-destructive hover:bg-destructive/90"}
                        onClick={toggleMicrophone}
                      >
                        {isMicActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={copyRoomLink}
                    >
                      <UserPlus className="h-5 w-5" />
                    </Button>
                    
                    {isCallActive ? (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={endCall}
                      >
                        <PhoneOff className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={leaveRoom}
                      >
                        Leave Room
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="room-card glassmorphism">
              <CardHeader>
                <CardTitle className="text-xl">Participants ({participants.length})</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {participants.map((participant) => (
                    <div 
                      key={participant.id} 
                      className="flex flex-col items-center p-3 rounded-lg bg-background/50"
                    >
                      <Avatar className="h-12 w-12 mb-2">
                        <AvatarFallback>
                          {participant.profiles.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                        {participant.profiles.avatar_url && (
                          <AvatarImage src={participant.profiles.avatar_url} />
                        )}
                      </Avatar>
                      <span className="text-sm font-medium truncate w-full text-center">
                        {participant.profiles.username}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Hidden audio elements for WebRTC streams */}
      <audio ref={localAudioRef} autoPlay muted className="hidden" />
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </div>
  );
};

export default Room;
