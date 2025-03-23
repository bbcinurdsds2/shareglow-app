import React, { useState, useEffect, useRef } from 'react';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import VideoStream from '@/components/VideoCall/VideoStream';
import CallControls from '@/components/VideoCall/CallControls';
import EffectsPanel from '@/components/VideoCall/EffectsPanel';
import SettingsPanel from '@/components/VideoCall/SettingsPanel';
import ChatPanel from '@/components/VideoCall/ChatPanel';
import IncomingCallDialog from '@/components/VideoCall/IncomingCallDialog';
import { Button } from '@/components/ui/button';
import { Phone, Users } from 'lucide-react';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

// Example remote user for demo purposes
const remoteUser = {
  name: 'Alex Smith',
  stream: null as MediaStream | null,
};

const Index = () => {
  // State for call flow
  const [inCall, setInCall] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [callTarget, setCallTarget] = useState('');
  
  // UI state
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [currentEffect, setCurrentEffect] = useState('none');
  const [volume, setVolume] = useState(0.8);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Refs
  const appContainerRef = useRef<HTMLDivElement>(null);
  
  // Custom hook for media devices
  const {
    localStream,
    screenStream,
    isMicActive,
    isVideoActive,
    isScreenSharing,
    audioInputDevices,
    videoInputDevices,
    audioOutputDevices,
    currentAudioInputId,
    currentVideoInputId,
    currentAudioOutputId,
    startLocalStream,
    stopLocalStream,
    toggleMic,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    applyVideoEffect,
    setAudioInput,
    setVideoInput,
    setAudioOutput,
    flipCamera
  } = useMediaDevices();
  
  // Updated applyEffect function to handle emoji effects
  const applyEffect = () => {
    if (currentEffect === 'none') {
      // Clear any existing effects
      if (appContainerRef.current) {
        const existingEffects = appContainerRef.current.querySelectorAll('.emoji-effect');
        existingEffects.forEach(el => el.remove());
      }
      toast.success('Effects cleared');
      return;
    }
    
    // Create emoji effects
    const container = appContainerRef.current;
    if (!container) return;
    
    // Clear any existing effects first
    const existingEffects = container.querySelectorAll('.emoji-effect');
    existingEffects.forEach(el => el.remove());
    
    // Create new effects based on the selected type
    const createEmojis = () => {
      // Determine the emoji to use
      let emoji = '❤️';
      switch (currentEffect) {
        case 'hearts': emoji = '❤️'; break;
        case 'thumbsup': emoji = '👍'; break;
        case 'wave': emoji = '👋'; break;
        case 'confetti': emoji = '🎉'; break;
        case 'sparkles': emoji = '✨'; break;
        case 'laugh': emoji = '😂'; break;
        case 'stars': emoji = '⭐'; break;
        default: emoji = '❤️';
      }
      
      // Create 20 emoji elements and animate them
      for (let i = 0; i < 20; i++) {
        const emojiEl = document.createElement('div');
        emojiEl.className = 'emoji-effect';
        emojiEl.textContent = emoji;
        emojiEl.style.position = 'absolute';
        emojiEl.style.fontSize = `${Math.random() * 20 + 20}px`;
        emojiEl.style.zIndex = '1000';
        emojiEl.style.userSelect = 'none';
        emojiEl.style.pointerEvents = 'none';
        
        // Random starting position at the bottom
        emojiEl.style.left = `${Math.random() * 100}%`;
        emojiEl.style.top = `${Math.random() * 20 + 80}%`; // Start from bottom area
        
        container.appendChild(emojiEl);
        
        // Animate with GSAP
        gsap.to(emojiEl, {
          y: `-${Math.random() * 300 + 200}px`,
          x: Math.random() * 100 - 50,
          opacity: 0,
          duration: Math.random() * 3 + 2,
          ease: 'power1.out',
          onComplete: () => {
            emojiEl.remove();
          }
        });
      }
    };
    
    // Create initial batch
    createEmojis();
    
    // Create a new batch every second for 5 seconds
    const intervalId = setInterval(createEmojis, 1000);
    setTimeout(() => {
      clearInterval(intervalId);
    }, 5000);
    
    toast.success(`Applied ${currentEffect} effect`);
  };

  // Initialize app animations
  useEffect(() => {
    if (appContainerRef.current) {
      gsap.from(appContainerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  }, []);

  // Handle call start
  const startCall = async () => {
    try {
      await startLocalStream();
      setInCall(true);
      
      // For demo purposes, simulate incoming message
      setTimeout(() => {
        addMessage('Alex Smith', 'Hi there! How are you?');
      }, 5000);
      
      toast.success('Call started successfully');
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call. Please check your camera and microphone permissions.');
    }
  };
  
  // Handle call end
  const endCall = () => {
    stopLocalStream();
    stopScreenShare();
    setInCall(false);
    toast.info('Call ended');
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Handle screen sharing toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      try {
        await startScreenShare();
        toast.success('Screen sharing started');
      } catch (error) {
        console.error('Failed to share screen:', error);
        toast.error('Failed to start screen sharing');
      }
    }
  };
  
  
  // Add a chat message
  const addMessage = (sender: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (sender !== 'Me' && !showChatPanel) {
      toast.info(`New message from ${sender}`);
    }
  };
  
  // Send a chat message
  const sendMessage = (text: string) => {
    addMessage('Me', text);
  };
  
  // Simulate an incoming call for demo
  const simulateIncomingCall = () => {
    setShowIncomingCall(true);
    // Play ringtone sound here
  };
  
  // Handle accepting incoming call
  const handleAnswerCall = async () => {
    try {
      await startLocalStream();
      setInCall(true);
      toast.success(`Call connected with ${remoteUser.name}`);
    } catch (error) {
      console.error('Failed to answer call:', error);
      toast.error('Failed to connect call');
    }
  };
  
  // Handle declining incoming call
  const handleDeclineCall = () => {
    toast.info(`Call from ${remoteUser.name} declined`);
  };
  
  // Initiate a call to someone
  const initiateCall = () => {
    if (!callTarget.trim()) {
      toast.error('Please enter a valid contact');
      return;
    }
    
    toast.loading(`Calling ${callTarget}...`, {
      duration: 3000,
      onAutoClose: () => {
        startCall();
        toast.success(`Connected with ${callTarget}`);
      }
    });
  };

  return (
    <div 
      ref={appContainerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary p-4 sm:p-6"
    >
      {showIncomingCall && (
        <IncomingCallDialog 
          caller={remoteUser}
          onAnswer={handleAnswerCall}
          onDecline={handleDeclineCall}
        />
      )}
      
      {/* Home Screen (Not in call) */}
      {!inCall && (
        <div className="w-full max-w-4xl animate-blur-in">
          <Card className="border-0 shadow-lg glassmorphism">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold tracking-tight">Video Call App</CardTitle>
              <CardDescription className="text-xl mt-2">
                Connect with anyone, anywhere
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Start a new call</h2>
                  <div className="flex flex-col space-y-4">
                    <Input 
                      placeholder="Enter name or number" 
                      value={callTarget}
                      onChange={(e) => setCallTarget(e.target.value)}
                    />
                    <Button 
                      size="lg" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={initiateCall}
                    >
                      <Phone className="h-5 w-5" />
                      Start Call
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={startCall}
                  >
                    <Phone className="h-5 w-5" />
                    New Meeting
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={simulateIncomingCall}
                  >
                    <Users className="h-5 w-5" />
                    Simulate Incoming Call
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              <p>Built with modern web technologies</p>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Video Call Screen (In call) */}
      {inCall && (
        <div className="w-full max-w-6xl h-[80vh] animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Main participant (full size on mobile, 2/3 width on desktop) */}
            <div className="lg:col-span-2 h-full">
              {screenStream ? (
                <VideoStream 
                  stream={screenStream}
                  className="h-full"
                  name={`${callTarget || 'User'}'s Screen`}
                />
              ) : (
                <VideoStream 
                  stream={remoteUser.stream}
                  className="h-full"
                  name={callTarget || remoteUser.name}
                />
              )}
            </div>
            
            {/* Self view with flip camera button */}
            <div className="relative h-full">
              <VideoStream 
                stream={localStream}
                muted={true}
                isSelf={true}
                className="h-full"
                name="Me"
                onFlipCamera={flipCamera}
              />
              
              {/* Screen sharing indicator */}
              {isScreenSharing && (
                <div className="absolute top-4 left-4 p-2 bg-amber-500 text-white rounded-md text-sm font-medium">
                  Screen Sharing
                </div>
              )}
            </div>
          </div>
          
          {/* Call controls */}
          <div className="mt-6 animate-fade-in">
            <CallControls 
              isMicActive={isMicActive}
              isVideoActive={isVideoActive}
              isScreenSharing={isScreenSharing}
              toggleMic={toggleMic}
              toggleVideo={toggleVideo}
              toggleScreenShare={toggleScreenShare}
              endCall={endCall}
              openEffects={() => setShowEffectsPanel(true)}
              openSettings={() => setShowSettingsPanel(true)}
              openChat={() => setShowChatPanel(true)}
              toggleFullscreen={toggleFullscreen}
            />
          </div>
          
          {/* Panels */}
          <EffectsPanel 
            open={showEffectsPanel}
            setOpen={setShowEffectsPanel}
            currentEffect={currentEffect}
            setCurrentEffect={setCurrentEffect}
            applyEffect={applyEffect}
          />
          
          <SettingsPanel 
            open={showSettingsPanel}
            setOpen={setShowSettingsPanel}
            audioInputDevices={audioInputDevices}
            videoInputDevices={videoInputDevices}
            audioOutputDevices={audioOutputDevices}
            currentAudioInputId={currentAudioInputId}
            currentVideoInputId={currentVideoInputId}
            currentAudioOutputId={currentAudioOutputId}
            setAudioInput={setAudioInput}
            setVideoInput={setVideoInput}
            setAudioOutput={setAudioOutput}
            volume={volume}
            setVolume={setVolume}
          />
          
          <ChatPanel 
            open={showChatPanel}
            setOpen={setShowChatPanel}
            messages={messages}
            sendMessage={sendMessage}
          />
        </div>
      )}
      
      {/* Add global styles for emoji effects */}
      <style jsx global>{`
        .emoji-effect {
          position: absolute;
          z-index: 1000;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default Index;
