
import { useState, useEffect, useCallback } from 'react';

interface UseMediaDevicesOutput {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMicActive: boolean;
  isVideoActive: boolean;
  isScreenSharing: boolean;
  audioInputDevices: MediaDeviceInfo[];
  videoInputDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  currentAudioInputId: string;
  currentVideoInputId: string;
  currentAudioOutputId: string;
  startLocalStream: () => Promise<void>;
  stopLocalStream: () => void;
  toggleMic: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  applyVideoEffect: (effectType: string) => void;
  setAudioInput: (deviceId: string) => Promise<void>;
  setVideoInput: (deviceId: string) => Promise<void>;
  setAudioOutput: (deviceId: string) => void;
  flipCamera: () => Promise<void>;
}

export function useMediaDevices(): UseMediaDevicesOutput {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMicActive, setIsMicActive] = useState(true);
  const [isVideoActive, setIsVideoActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  
  const [currentAudioInputId, setCurrentAudioInputId] = useState('');
  const [currentVideoInputId, setCurrentVideoInputId] = useState('');
  const [currentAudioOutputId, setCurrentAudioOutputId] = useState('');

  // Get available media devices
  const getMediaDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      
      setAudioInputDevices(audioInputs);
      setVideoInputDevices(videoInputs);
      setAudioOutputDevices(audioOutputs);
      
      // Set default devices if not already set
      if (!currentAudioInputId && audioInputs.length > 0) {
        setCurrentAudioInputId(audioInputs[0].deviceId);
      }
      
      if (!currentVideoInputId && videoInputs.length > 0) {
        setCurrentVideoInputId(videoInputs[0].deviceId);
      }
      
      if (!currentAudioOutputId && audioOutputs.length > 0) {
        setCurrentAudioOutputId(audioOutputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating media devices:', error);
    }
  }, [currentAudioInputId, currentVideoInputId, currentAudioOutputId]);

  // Set video input device - moved up to fix the reference in flipCamera
  const setVideoInput = useCallback(async (deviceId: string) => {
    if (deviceId === currentVideoInputId) return;
    
    setCurrentVideoInputId(deviceId);
    
    // Restart stream with new device if we already have a stream
    if (localStream && isVideoActive) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { 
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        // Stop old video tracks
        localStream.getVideoTracks().forEach(track => track.stop());
        
        // Remove old video tracks and add new ones
        localStream.getVideoTracks().forEach(track => localStream.removeTrack(track));
        newStream.getVideoTracks().forEach(track => localStream.addTrack(track));
        
        // Update state to reflect new camera state
        setIsVideoActive(true);
      } catch (error) {
        console.error('Error switching video input:', error);
      }
    }
  }, [localStream, isVideoActive, currentVideoInputId]);

  // Flip between front and back cameras (particularly useful on mobile)
  const flipCamera = useCallback(async () => {
    if (!localStream || videoInputDevices.length < 2) return;
    
    try {
      // Find the current camera index
      const currentIndex = videoInputDevices.findIndex(device => device.deviceId === currentVideoInputId);
      if (currentIndex === -1) return;
      
      // Select the next camera in the list
      const nextIndex = (currentIndex + 1) % videoInputDevices.length;
      const nextCameraId = videoInputDevices[nextIndex].deviceId;
      
      // Switch to the new camera
      await setVideoInput(nextCameraId);
      
      console.log(`Camera flipped to: ${videoInputDevices[nextIndex].label}`);
    } catch (error) {
      console.error('Error flipping camera:', error);
    }
  }, [localStream, videoInputDevices, currentVideoInputId, setVideoInput]);

  // Start local stream with selected devices
  const startLocalStream = useCallback(async () => {
    try {
      if (localStream) {
        stopLocalStream();
      }
      
      const constraints: MediaStreamConstraints = {
        audio: currentAudioInputId 
          ? { deviceId: { exact: currentAudioInputId } } 
          : true,
        video: currentVideoInputId 
          ? { 
              deviceId: { exact: currentVideoInputId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      setIsMicActive(true);
      setIsVideoActive(true);
      
      // Make sure we have the latest device list
      await getMediaDevices();
      
    } catch (error) {
      console.error('Error starting local stream:', error);
      // If video fails, try fallback to just audio
      if (isVideoActive) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: currentAudioInputId 
              ? { deviceId: { exact: currentAudioInputId } } 
              : true,
            video: false
          });
          setLocalStream(audioStream);
          setIsVideoActive(false);
          setIsMicActive(true);
        } catch (audioError) {
          console.error('Failed to get audio-only stream:', audioError);
        }
      }
    }
  }, [
    localStream, 
    currentAudioInputId, 
    currentVideoInputId, 
    isVideoActive, 
    getMediaDevices
  ]);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks.forEach(track => {
          track.enabled = enabled;
        });
        setIsMicActive(enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks.forEach(track => {
          track.enabled = enabled;
        });
        setIsVideoActive(enabled);
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      if (screenStream) {
        stopScreenShare();
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        } as MediaTrackConstraints,
        audio: false
      });
      
      // Add event listener for when user stops sharing via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });
      
      setScreenStream(stream);
      setIsScreenSharing(true);
      
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }, [screenStream]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    }
  }, [screenStream]);

  // Apply video effect
  const applyVideoEffect = useCallback((effectType: string) => {
    if (!localStream) return;
    
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;
    
    // This would be implemented with a video processing library or WebGL for real effects
    console.log(`Applying ${effectType} effect to video`);
    
    // Simple implementation: we could use MediaStreamTrackProcessor and MediaStreamTrackGenerator
    // from the Insertable Streams API, but that's experimental
    // For now we'll just log the effect type
    
    // In a real implementation:
    // 1. Create a canvas and get its context
    // 2. Draw video frames to the canvas with the desired effect
    // 3. Create a new MediaStream from the canvas
    
  }, [localStream]);

  // Set audio input device
  const setAudioInput = useCallback(async (deviceId: string) => {
    if (deviceId === currentAudioInputId) return;
    
    setCurrentAudioInputId(deviceId);
    
    // Restart stream with new device if we already have a stream
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const videoConstraints = videoTrack ? {
        deviceId: { exact: currentVideoInputId },
        width: videoTrack.getSettings().width,
        height: videoTrack.getSettings().height
      } : false;
      
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
          video: videoConstraints
        });
        
        // Stop old audio tracks
        localStream.getAudioTracks().forEach(track => track.stop());
        
        // Remove old audio tracks and add new ones
        localStream.getAudioTracks().forEach(track => localStream.removeTrack(track));
        newStream.getAudioTracks().forEach(track => localStream.addTrack(track));
        
        // Update state to reflect new mic state
        setIsMicActive(true);
      } catch (error) {
        console.error('Error switching audio input:', error);
      }
    }
  }, [localStream, currentAudioInputId, currentVideoInputId]);

  // Set audio output device (for browsers that support it)
  const setAudioOutput = useCallback((deviceId: string) => {
    setCurrentAudioOutputId(deviceId);
    // We would use HTMLMediaElement.setSinkId() for compatible browsers
    // This would need to be called on all audio elements
  }, []);

  // Initialize
  useEffect(() => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Browser does not support getUserMedia API');
      return;
    }

    // Get available media devices
    getMediaDevices();

    // Cleanup when component unmounts
    return () => {
      stopLocalStream();
      stopScreenShare();
    };
  }, [getMediaDevices, stopLocalStream, stopScreenShare]);

  // Update devices list when devices change
  useEffect(() => {
    const handleDeviceChange = () => {
      getMediaDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [getMediaDevices]);

  return {
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
  };
}
