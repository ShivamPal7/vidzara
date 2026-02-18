"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Updated to likely correct path

interface VideoPlayerProps {
    videoId?: string;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

const VideoPlayer = ({ videoId = "d_UIueUQpcc" }: VideoPlayerProps) => {
    const [isPlayerActive, setIsPlayerActive] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const playerRef = useRef<any>(null);

    const loadVideo = () => {
        setIsPlayerActive(true);

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const initPlayer = () => {
            playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    rel: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    loop: 1,
                    playlist: videoId,
                },
                events: {
                    onReady: (event: any) => {
                        setIsPlayerReady(true);
                        event.target.playVideo();
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }
    };

    useEffect(() => {
        return () => {
            if (playerRef.current) {
                try {
                     playerRef.current.destroy();
                } catch (e) {
                    console.error("Error destroying player", e);
                }
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full rounded-[inherit] overflow-hidden bg-background isolate group">
            
            {/* YouTube Iframe Container */}
             <div id={`youtube-player-${videoId}`} className={`w-full h-full absolute inset-0 ${isPlayerActive ? 'z-10' : '-z-10'}`} />

            {/* Placeholder/Loading State - Always visible until player is active */}
            {!isPlayerActive && (
                <div 
                    className="absolute inset-0 z-20 cursor-pointer"
                    onClick={loadVideo}
                >
                    <Image
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                    
                     {/* Overlay Darken */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-300">
                             <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1 fill-white" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
