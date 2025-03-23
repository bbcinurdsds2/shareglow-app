
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mic, Video, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SettingsPanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  audioInputDevices: MediaDeviceInfo[];
  videoInputDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  currentAudioInputId: string;
  currentVideoInputId: string;
  currentAudioOutputId: string;
  setAudioInput: (deviceId: string) => void;
  setVideoInput: (deviceId: string) => void;
  setAudioOutput: (deviceId: string) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  setOpen,
  audioInputDevices,
  videoInputDevices,
  audioOutputDevices,
  currentAudioInputId,
  currentVideoInputId,
  currentAudioOutputId,
  setAudioInput,
  setVideoInput,
  setAudioOutput,
  volume,
  setVolume
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] glassmorphism">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Call Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="audio" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic className="h-4 w-4" /> Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Video
            </TabsTrigger>
            <TabsTrigger value="output" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" /> Output
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mic-select">Microphone</Label>
              <Select 
                value={currentAudioInputId} 
                onValueChange={setAudioInput}
              >
                <SelectTrigger id="mic-select">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {audioInputDevices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="camera-select">Camera</Label>
              <Select 
                value={currentVideoInputId} 
                onValueChange={setVideoInput}
              >
                <SelectTrigger id="camera-select">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {videoInputDevices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="speaker-select">Speaker</Label>
              <Select 
                value={currentAudioOutputId} 
                onValueChange={setAudioOutput}
              >
                <SelectTrigger id="speaker-select">
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {audioOutputDevices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume-slider">Volume</Label>
                <span className="text-sm">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                id="volume-slider"
                min={0}
                max={1}
                step={0.01}
                value={[volume]}
                onValueChange={(values) => setVolume(values[0])}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
