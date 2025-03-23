
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RoomCreator from '@/components/CallRooms/RoomCreator';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  
  // Initialize animations
  useEffect(() => {
    const timeline = gsap.timeline();
    
    timeline.from('.header-card', {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });
    
    timeline.from('.rooms-section', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.3');
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-background to-secondary p-4 sm:p-6"
    >
      <div className="w-full max-w-4xl animate-blur-in">
        {/* User Profile Card */}
        <Card className="border-0 shadow-lg glassmorphism mb-8 header-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{profile?.username?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {profile?.username || user?.email}
                </CardTitle>
                <CardDescription>
                  Audio Call App
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </CardHeader>
        </Card>
        
        {/* Room Creation Section */}
        <div className="rooms-section">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Audio Calls</h2>
          <RoomCreator />
          
          <div className="mt-10 text-center text-sm text-muted-foreground">
            <p>Create a room to generate a code that others can use to join your call.</p>
            <p>All calls use WebRTC for peer-to-peer audio communication.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
