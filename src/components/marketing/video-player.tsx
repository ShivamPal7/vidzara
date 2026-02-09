"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasInteractedRef = useRef(false);

    useEffect(() => {
        // Load YouTube IFrame API
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
                    controls: 0, // Set to 0 to hide controls initially as per request/snippet logic
                    mute: 1,
                    rel: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    loop: 1,
                    playlist: videoId,
                },
                events: {
                    onReady: (event: any) => {
                        setIsPlayerReady(true);
                        event.target.mute();
                        event.target.playVideo();
                    },
                    onStateChange: (event: any) => {
                        // Ensure it keeps playing if it pauses unexpectedly before interaction
                        if (event.data === window.YT.PlayerState.PAUSED && !hasInteractedRef.current) {
                            event.target.playVideo();
                        }
                    }
                },
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoId]);

    const handleInteraction = () => {
        if (playerRef.current && isPlayerReady) {
            playerRef.current.unMute();
            playerRef.current.seekTo(0);
            playerRef.current.playVideo();
            // playerRef.current.playVideo(); // Redundant call removed
            setHasInteracted(true);
            hasInteractedRef.current = true;

            // Optional: Enable controls after interaction if desired
            // Not easily possible without reloading iframe with controls=1, 
            // but we can leave it as a clean "marketing" player or implement custom pause/play if needed.
            // For now, adhering to "play video from start" and "unmute".
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full rounded-[inherit] overflow-hidden bg-background isolate">

            {/* YouTube Iframe Container */}
            <div id={`youtube-player-${videoId}`} className="w-full h-full absolute inset-0 -z-10" />

            {/* Placeholder/Loading State */}
            {!isPlayerReady && (
                <div className="absolute inset-0 bg-background z-0">
                    <Image
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        fill
                        className="object-cover opacity-50 blur-sm"
                    />
                </div>
            )}

            {/* Overlay Controls */}
            <AnimatePresence>
                {!hasInteracted && isPlayerReady && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: 'none' }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer group"
                        onClick={handleInteraction}
                    >
                        {/* Dark Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />



                        {/* Top Right Unmute Button */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.05 }}
                            className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 transition-colors"
                        >
                            <VolumeX className="size-4 md:size-5 text-white" />
                            <span className="text-xs md:text-sm font-medium text-white">Tap to unmute</span>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VideoPlayer;
