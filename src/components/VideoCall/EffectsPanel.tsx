
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface EffectsPanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentEffect: string;
  setCurrentEffect: (effect: string) => void;
  applyEffect: () => void;
}

const effects = [
  { id: 'none', name: 'None', description: 'No effects applied' },
  { id: 'blur', name: 'Blur Background', description: 'Blur the background around you' },
  { id: 'grayscale', name: 'Grayscale', description: 'Black and white filter' },
  { id: 'sepia', name: 'Sepia', description: 'Warm brownish tone' },
  { id: 'invert', name: 'Invert', description: 'Invert all colors' },
  { id: 'confetti', name: 'Confetti', description: 'Celebration effect with confetti' },
  { id: 'hearts', name: 'Hearts', description: 'Floating heart shapes' },
  { id: 'bubbles', name: 'Bubbles', description: 'Animated bubble particles' },
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
          <DialogTitle className="text-xl font-semibold">Screen Effects</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {effects.map((effect) => (
              <div
                key={effect.id}
                className={`
                  screen-effect-selector cursor-pointer bg-muted rounded-lg p-3 text-center
                  ${currentEffect === effect.id ? 'active' : ''}
                `}
                onClick={() => setCurrentEffect(effect.id)}
              >
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">{effect.name.charAt(0)}</span>
                </div>
                <p className="text-sm font-medium">{effect.name}</p>
              </div>
            ))}
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
