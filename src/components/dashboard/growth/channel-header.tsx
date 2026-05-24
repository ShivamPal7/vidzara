"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconLogout, IconLoader } from '@tabler/icons-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChannelHeaderProps {
  channelTitle: string;
  channelHandle: string;
  thumbnailUrl: string;
  subscriberCount: number;
}

export function ChannelHeader({
  channelTitle,
  channelHandle,
  thumbnailUrl,
  subscriberCount,
}: ChannelHeaderProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const router = useRouter();

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect your YouTube channel from Vidzara?")) {
      try {
        setIsDisconnecting(true);
        const res = await fetch('/api/auth/youtube/disconnect', {
          method: 'DELETE',
        });
        if (res.ok) {
          router.refresh();
        } else {
          alert('Failed to disconnect channel. Please try again.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while disconnecting.');
      } finally {
        setIsDisconnecting(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-between pb-6 border-b border-border/50">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary/20">
          <AvatarImage src={thumbnailUrl} alt={channelTitle} />
          <AvatarFallback>{channelTitle.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{channelTitle}</h1>
            <Badge variant="secondary" className="font-mono bg-primary/10 text-primary border-primary/20">
              {subscriberCount.toLocaleString()} subs
            </Badge>
          </div>
          <p className="text-muted-foreground">{channelHandle}</p>
        </div>
      </div>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 disabled:opacity-50"
      >
        {isDisconnecting ? (
          <IconLoader className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <IconLogout className="w-4 h-4 mr-2" />
        )}
        Disconnect
      </Button>
    </div>
  );
}

