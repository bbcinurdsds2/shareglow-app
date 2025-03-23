
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Laugh, Hand, Star, PartyPopper, ThumbsUp, Sparkles, Smile } from 'lucide-react';

interface EffectsPanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentEffect: string;
  setCurrentEffect: (effect: string) => void;
  applyEffect: () => void;
}

const effects = [
  { id: 'none', name: 'None', icon: Smile, description: 'No effects' },
  { id: 'hearts', name: 'Hearts', icon: Heart, description: 'Floating heart emojis' },
  { id: 'thumbsup', name: 'Thumbs Up', icon: ThumbsUp, description: 'Thumbs up emoji' },
  { id: 'wave', name: 'Wave', icon: Hand, description: 'Waving hand emoji' },
  { id: 'confetti', name: 'Confetti', icon: PartyPopper, description: 'Celebration with confetti' },
  { id: 'sparkles', name: 'Sparkles', icon: Sparkles, description: 'Sparkles effect' },
  { id: 'laugh', name: 'Laugh', icon: Laugh, description: 'Laughing emoji' },
  { id: 'stars', name: 'Stars', icon: Star, description: 'Stars animation' },
];

const EffectsPanel: React.FC<EffectsPanelProps> = ({
  open,
  setOpen,
  currentEffect,
  setCurrentEffect,
  applyEffect
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] glassmorphism">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Live Emoji Effects</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {effects.map((effect) => {
              const IconComponent = effect.icon;
              return (
                <div
                  key={effect.id}
                  className={`
                    emoji-effect-selector cursor-pointer hover:scale-105 transition-transform
                    bg-muted rounded-lg p-3 text-center
                    ${currentEffect === effect.id ? 'ring-2 ring-primary ring-offset-2' : ''}
                  `}
                  onClick={() => setCurrentEffect(effect.id)}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">{effect.name}</p>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              applyEffect();
              setOpen(false);
            }}>
              Apply Effect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EffectsPanel;
