import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  ScreenShare, MonitorOff, MessageSquare, Settings, Maximize
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CallControlsProps {
  isMicActive: boolean;
  isVideoActive: boolean;
  isScreenSharing: boolean;
  toggleMic: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  endCall: () => void;
  openEffects: () => void;
  openSettings: () => void;
  openChat: () => void;
  toggleFullscreen: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  isMicActive,
  isVideoActive,
  isScreenSharing,
  toggleMic,
  toggleVideo,
  toggleScreenShare,
  endCall,
  openEffects,
  openSettings,
  openChat,
  toggleFullscreen
}) => {
  return (
    <TooltipProvider>
      <div className="w-full flex justify-center space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "control-button",
                !isMicActive && "bg-destructive hover:bg-destructive"
              )}
              onClick={toggleMic}
            >
              {isMicActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMicActive ? "Mute Microphone" : "Unmute Microphone"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "control-button",
                !isVideoActive && "bg-destructive hover:bg-destructive"
              )}
              onClick={toggleVideo}
            >
              {isVideoActive ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVideoActive ? "Turn Off Camera" : "Turn On Camera"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "control-button",
                isScreenSharing && "bg-amber-500 hover:bg-amber-600"
              )}
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? 
                <MonitorOff className="h-5 w-5" /> : 
                <ScreenShare className="h-5 w-5" />
              }
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isScreenSharing ? "Stop Screen Sharing" : "Share Screen"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="destructive" 
              size="icon" 
              className="control-button"
              onClick={endCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>End Call</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="control-button"
              onClick={openChat}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open Chat</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="control-button"
              onClick={openEffects}
            >
              <span className="text-sm font-bold">fx</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Screen Effects</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="control-button"
              onClick={openSettings}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="control-button"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fullscreen</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default CallControls;
