import React, { useState } from 'react';

import { Play, Pause, Music, ChevronDown, Mic, BookOpen } from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import type { Song, VocalPart } from '../_types';

export interface SimpleSongCardProps {
    song: Song;
    songNumber: number;
    isPlaying: boolean;
    isLoading: boolean;
    isExpanded: boolean;
    currentPart: VocalPart | null;
    currentTime: number;
    duration: number;
    onToggleExpand: () => void;
    onPlayPart: (part: VocalPart) => void;
    onSeek?: (time: number) => void;
    onStartKaraoke?: () => void;
    isKaraokeLoading?: boolean;
}

// Standardized lyrics formatter from MasterSongDetailSheet
const formatLyricsForDisplay = (lyrics: any): string => {
    if (!lyrics) return '';

    let html = '';
    if (Array.isArray(lyrics)) {
        html = lyrics.map(line => (line as any).text || line).join('\n');
    } else {
        html = lyrics as string;
    }

    // Convert HTML back to plain text format like the edit modal shows
    let text = html
        // Convert </div><div> to double newlines (paragraph breaks)
        .replace(/<\/div>\s*<div>/gi, '\n\n')
        // Convert <div> opening tags to nothing (start of content)
        .replace(/<div[^>]*>/gi, '')
        // Convert </div> closing tags to nothing
        .replace(/<\/div>/gi, '')
        // Convert <br> to single newlines
        .replace(/<br\s*\/?>/gi, '\n')
        // Keep bold tags for display
        .replace(/<b>/gi, '<b>')
        .replace(/<\/b>/gi, '</b>')
        .replace(/<strong>/gi, '<b>')
        .replace(/<\/strong>/gi, '</b>')
        // Remove any other HTML tags
        .replace(/<(?!b>|\/b>)[^>]*>/g, '')
        // Convert HTML entities
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        // Clean up excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return text;
};

export function SimpleSongCard({
    song,
    songNumber,
    isPlaying,
    isLoading,
    isExpanded,
    currentPart,
    currentTime,
    duration,
    onToggleExpand,
    onPlayPart,
    onSeek,
    onStartKaraoke,
    isKaraokeLoading,
}: SimpleSongCardProps) {
    const [showLyrics, setShowLyrics] = useState(false);
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
        <div className="bg-[#261933] rounded-xl border border-white/10 overflow-hidden transition-all hover:shadow-lg hover:shadow-violet-500/10">
            {/* Main Row - Always Visible */}
            <div
                onClick={onToggleExpand}
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

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm truncate ${isPlaying ? 'text-violet-200' : 'text-white'}`}>
                        {song.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                        {song.artist || 'Unknown artist'}
                        {song.key && ` • ${song.key}`}
                    </p>
                </div>

                {/* Expand Indicator */}
                <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Progress Bar (Only when playing) */}
            {isPlaying && (
                <div className="px-3 pb-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-mono">{formatTime(currentTime)}</span>
                        <span className="font-mono">{formatTime(duration)}</span>
                    </div>
                    <div
                        className="relative h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
                        onClick={(e) => {
                            if (onSeek && duration > 0) {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const percentage = x / rect.width;
                                onSeek(percentage * duration);
                            }
                        }}
                    >
                        <div
                            className="absolute inset-y-0 left-0 bg-violet-500 rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Expanded Parts List */}
            {isExpanded && (
                <div className="border-t border-white/10 bg-black/20 p-3 space-y-2">
                    {/* Karaoke Button */}
                    {onStartKaraoke && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartKaraoke();
                            }}
                            disabled={isKaraokeLoading}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 rounded-xl text-white font-bold text-sm transition-all shadow-lg active:scale-[0.98] ${isKaraokeLoading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/20'
                                }`}
                        >
                            {isKaraokeLoading ? (
                                <>
                                    <div className="w-5 h-5">
                                        <CustomLoader size="sm" />
                                    </div>
                                    <span>Launching Karaoke...</span>
                                </>
                            ) : (
                                <>
                                    <Mic size={18} />
                                    <span>Start Karaoke Session</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Lyrics Section */}
                    {song.lyrics && (
                        <div className="mb-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowLyrics(!showLyrics);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen size={16} className="text-violet-400" />
                                    <span className="font-bold text-xs text-white">Lyrics</span>
                                </div>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showLyrics ? 'rotate-180' : ''}`} />
                            </button>

                            {showLyrics && (
                                <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                    <style>{`
                                        .lyrics-content {
                                            white-space: pre-wrap;
                                            word-wrap: break-word;
                                            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
                                            font-size: 14px;
                                            line-height: 1.6;
                                            color: #e2e8f0;
                                        }
                                        .lyrics-content b,
                                        .lyrics-content strong {
                                            font-weight: 700;
                                            color: #fff;
                                        }
                                    `}</style>
                                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        <pre
                                            className="lyrics-content"
                                            dangerouslySetInnerHTML={{ __html: formatLyricsForDisplay(song.lyrics) }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 pb-1">
                        Available Parts
                    </div>

                    {availableParts.map((part) => {
                        const isThisPartPlaying = isPlaying && currentPart === part;
                        const isThisPartLoading = isLoading && currentPart === part;
                        const hasAudio = part === 'full'
                            ? song.audioUrls?.full || song.audioUrl
                            : song.audioUrls?.[part];

                        return (
                            <button
                                key={part}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (hasAudio) onPlayPart(part);
                                }}
                                disabled={!hasAudio || isThisPartLoading}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${isThisPartPlaying
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                        : hasAudio
                                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                            : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                                    }
                `}
                            >
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${isThisPartPlaying ? 'bg-white/20' : 'bg-white/10'}
                `}>
                                    {isThisPartLoading ? (
                                        <div className="w-4 h-4">
                                            <CustomLoader size="sm" />
                                        </div>
                                    ) : isThisPartPlaying ? (
                                        <Pause className="w-4 h-4" />
                                    ) : (
                                        <Play className="w-4 h-4 ml-0.5" />
                                    )}
                                </div>
                                <span className="font-medium text-sm">{getPartLabel(part)}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
