
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoStreamProps {
  stream: MediaStream | null;
  muted?: boolean;
  isSelf?: boolean;
  className?: string;
  name?: string;
  onFlipCamera?: () => void;
}

const VideoStream: React.FC<VideoStreamProps> = ({
  stream,
  muted = false,
  isSelf = false,
  className,
  name = "User",
  onFlipCamera
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div 
      className={cn(
        "video-container relative overflow-hidden rounded-xl",
        isSelf && "self",
        className
      )}
      onMouseEnter={() => isSelf && setShowControls(true)}
      onMouseLeave={() => isSelf && setShowControls(false)}
      onTouchStart={() => isSelf && setShowControls(prevState => !prevState)}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="video-element w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-muted">
          <div className="animate-pulse text-4xl font-bold text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Camera flip button */}
      {isSelf && onFlipCamera && showControls && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlipCamera();
                }}
              >
                <SwitchCamera className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip Camera</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="absolute bottom-4 left-4 text-white text-sm font-medium px-2 py-1 bg-black bg-opacity-40 rounded-md">
        {name} {isSelf && "(You)"}
      </div>
    </div>
  );
};

export default VideoStream;
