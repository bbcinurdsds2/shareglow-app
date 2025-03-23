
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, PhoneCall } from 'lucide-react';

const RoomCreator = () => {
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!user) {
      toast.error('Please sign in to create a room');
      return;
    }

    try {
      setIsCreating(true);
      
      // Use the Supabase function to generate a room code on the server
      const { data, error } = await supabase.rpc('generate_room_code');
      
      if (error) throw error;
      
      const generatedCode = data;
      
      // Create the room
      const { data: roomData, error: roomError } = await supabase
        .from('call_rooms')
        .insert({
          room_code: generatedCode,
          created_by: user.id
        })
        .select()
        .single();
      
      if (roomError) throw roomError;
      
      // Navigate to the new room
      navigate(`/room/${generatedCode}`);
      toast.success('Room created successfully!');
    } catch (error: any) {
      toast.error(`Failed to create room: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!user) {
      toast.error('Please sign in to join a room');
      return;
    }

    if (!roomCode) {
      toast.error('Please enter a room code');
      return;
    }

    try {
      setIsJoining(true);
      
      // Check if room exists
      const { data, error } = await supabase
        .from('call_rooms')
        .select()
        .eq('room_code', roomCode)
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        toast.error('Invalid or inactive room code');
        return;
      }
      
      // Navigate to the room
      navigate(`/room/${roomCode}`);
    } catch (error: any) {
      toast.error(`Failed to join room: ${error.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-0 shadow-lg glassmorphism">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Create a Room</CardTitle>
          <CardDescription>
            Start a new audio call and invite others to join
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Create a new room and share the code with others to join your call.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={createRoom} 
            disabled={isCreating || !user} 
            className="w-full"
          >
            <Phone className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'Create Room'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-0 shadow-lg glassmorphism">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Join a Room</CardTitle>
          <CardDescription>
            Enter a room code to join an existing call
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter room code (e.g. ABC123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={joinRoom} 
            disabled={isJoining || !roomCode || !user} 
            className="w-full"
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            {isJoining ? 'Joining...' : 'Join Room'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoomCreator;
