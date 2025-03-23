
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VideoStreamProps {
  stream: MediaStream | null;
  muted?: boolean;
  isSelf?: boolean;
  className?: string;
  name?: string;
}

const VideoStream: React.FC<VideoStreamProps> = ({
  stream,
  muted = false,
  isSelf = false,
  className,
  name = "User"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={cn(
      "video-container relative overflow-hidden rounded-xl",
      isSelf && "self",
      className
    )}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="video-element"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-muted">
          <div className="animate-pulse text-4xl font-bold text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 text-white text-sm font-medium px-2 py-1 bg-black bg-opacity-40 rounded-md">
        {name} {isSelf && "(You)"}
      </div>
    </div>
  );
};

export default VideoStream;
