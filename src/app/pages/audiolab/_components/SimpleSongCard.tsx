import React, { useState } from 'react';

import { Play, Pause, Music, ChevronDown, Mic, BookOpen } from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import type { Song, VocalPart } from '../_types';

export interface SimpleSongCardProps {
    song: Song;
    songNumber: number;
    isPlaying: boolean;
    isLoading: boolean;
    currentPart: VocalPart | null;
    currentTime: number;
    duration: number;
    onClick?: () => void;
    isHighlighted?: boolean;
}



export function SimpleSongCard({
    song,
    songNumber,
    isPlaying,
    isLoading,
    currentPart,
    currentTime,
    duration,
    onClick,
    isHighlighted = false,
}: SimpleSongCardProps) {

    const availableParts = song.availableParts || ['full'];

    const getPartLabel = (part: VocalPart) => {
        const labels: Record<string, string> = {
            full: 'Full Mix',
            soprano: 'Soprano',
            alto: 'Alto',
            tenor: 'Tenor',
            bass: 'Bass',
        };
        return labels[part] || part;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`
            rounded-xl border transition-all hover:shadow-lg hover:shadow-violet-500/10 overflow-hidden
            ${isHighlighted ? 'bg-violet-900/40 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-2 ring-violet-500/20' : 'bg-[#261933] border-white/10'}
            ${isHighlighted ? 'animate-pulse-subtle' : ''}
        `}>
            {isHighlighted && (
                <style>{`
                    @keyframes pulse-subtle {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.85; }
                    }
                    .animate-pulse-subtle {
                        animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                `}</style>
            )}
            {/* Main Row - Always Visible */}
            <div
                onClick={onClick}
                className={`
          flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all
          hover:bg-white/5 active:scale-[0.99]
          ${isPlaying ? 'bg-violet-500/10 border-l-4 border-l-violet-500' : ''}
        `}
            >
                {/* Number / Playing Indicator */}
                <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
          ${isPlaying
                        ? 'bg-violet-600'
                        : 'bg-gradient-to-br from-violet-500 to-purple-600'
                    }
        `}>
                    {isPlaying ? (
                        <div className="flex gap-0.5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="w-0.5 bg-white rounded-full animate-pulse"
                                    style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }}
                                />
                            ))}
                        </div>
                    ) : (
                        <span className="text-white font-bold text-sm">{songNumber}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm truncate ${isPlaying ? 'text-violet-200' : 'text-white'}`}>
                        {song.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                        {song.artist || 'Unknown artist'}
                        {song.key && ` • ${song.key}`}
                    </p>
                </div>
            </div>


        </div>
    );
}
