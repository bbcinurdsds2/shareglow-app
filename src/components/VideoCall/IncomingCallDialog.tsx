
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff } from 'lucide-react';
import { gsap } from 'gsap';

interface IncomingCallDialogProps {
  caller: {
    name: string;
    avatar?: string;
  };
  onAnswer: () => void;
  onDecline: () => void;
}

const IncomingCallDialog: React.FC<IncomingCallDialogProps> = ({
  caller,
  onAnswer,
  onDecline
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [ringCount, setRingCount] = useState(0);

  useEffect(() => {
    // Animation for the avatar pulsing effect
    const pulseAnimation = gsap.to('.caller-avatar', {
      scale: 1.05,
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    // Create timer for the ringing sound/effect
    const ringInterval = setInterval(() => {
      setRingCount(prev => prev + 1);
      // Play ring sound here if you have one
    }, 3000);

    // Auto-decline after 30 seconds (10 rings)
    const declineTimeout = setTimeout(() => {
      if (isOpen) {
        handleDecline();
      }
    }, 30000);

    return () => {
      pulseAnimation.kill();
      clearInterval(ringInterval);
      clearTimeout(declineTimeout);
    };
  }, [isOpen]);

  const handleAnswer = () => {
    setIsOpen(false);
    onAnswer();
  };

  const handleDecline = () => {
    setIsOpen(false);
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glassmorphism">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-semibold mb-2">Incoming Call</DialogTitle>
          <div className="flex justify-center mb-2">
            <Avatar className="caller-avatar h-24 w-24 ring-4 ring-primary/20">
              {caller.avatar ? (
                <AvatarImage src={caller.avatar} alt={caller.name} />
              ) : (
                <AvatarFallback className="text-3xl">{caller.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
          </div>
          <DialogDescription className="text-xl font-medium">
            {caller.name}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex justify-center sm:justify-center gap-4 mt-6">
          <Button 
            variant="destructive" 
            size="lg" 
            className="rounded-full h-16 w-16 p-0"
            onClick={handleDecline}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button 
            variant="default" 
            size="lg" 
            className="rounded-full h-16 w-16 p-0 bg-green-500 hover:bg-green-600"
            onClick={handleAnswer}
          >
            <Phone className="h-6 w-6" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallDialog;
