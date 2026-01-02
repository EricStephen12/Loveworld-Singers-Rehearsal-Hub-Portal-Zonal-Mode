'use client';

import { Music, Play, Pause, ChevronDown, Mic } from 'lucide-react';
import type { Song, VocalPart } from '../_types';

export interface CollapsibleSongCardProps {
  song: Song;
  isExpanded: boolean;
  isPlaying: boolean;
  isHighlighted?: boolean;
  currentPart: VocalPart | null;
  currentTime: number;
  duration: number;
  onToggleExpand: () => void;
  onPlayAll: () => void;
  onPlayPart: (part: VocalPart) => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onStartKaraoke?: () => void; // New: direct karaoke start
}

const partColors: Record<string, { bg: string; text: string; activeBg: string }> = {
  full: { bg: 'bg-violet-500/20', text: 'text-violet-400', activeBg: 'bg-violet-500' },
  soprano: { bg: 'bg-pink-500/20', text: 'text-pink-400', activeBg: 'bg-pink-500' },
  alto: { bg: 'bg-amber-500/20', text: 'text-amber-400', activeBg: 'bg-amber-500' },
  tenor: { bg: 'bg-blue-500/20', text: 'text-blue-400', activeBg: 'bg-blue-500' },
  bass: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', activeBg: 'bg-emerald-500' },
};

// Default colors for custom parts
const customPartColors = [
  { bg: 'bg-orange-500/20', text: 'text-orange-400', activeBg: 'bg-orange-500' },
  { bg: 'bg-cyan-500/20', text: 'text-cyan-400', activeBg: 'bg-cyan-500' },
  { bg: 'bg-lime-500/20', text: 'text-lime-400', activeBg: 'bg-lime-500' },
  { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', activeBg: 'bg-fuchsia-500' },
  { bg: 'bg-rose-500/20', text: 'text-rose-400', activeBg: 'bg-rose-500' },
];

const getPartColors = (part: VocalPart, index: number) => {
  if (partColors[part]) return partColors[part];
  // Use rotating colors for custom parts
  return customPartColors[index % customPartColors.length];
};

const partLabels: Record<string, string> = {
  full: 'Full Mix',
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
};

const getPartLabel = (part: VocalPart) => {
  return partLabels[part] || part; // Use part name as label for custom parts
};

export function CollapsibleSongCard({
  song,
  isExpanded,
  isPlaying,
  isHighlighted,
  currentPart,
  currentTime,
  duration,
  onToggleExpand,
  onPlayAll,
  onPlayPart,
  onPause,
  onSeek,
  onStartKaraoke,
}: CollapsibleSongCardProps) {
  const isThisSongPlaying = isPlaying && currentPart !== null;
  const availableParts = song.availableParts || ['full'];
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  return (
    <div className={`rounded-xl bg-[#261933] border overflow-hidden transition-all duration-300 ${
      isHighlighted 
        ? 'border-violet-400 ring-4 ring-violet-500/30 shadow-xl shadow-violet-500/30 bg-violet-500/5' 
        : 'border-white/5'
    }`}>
      {/* Card Header - Always visible */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
      >
        {/* Album Art */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg shadow-sm">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: song.albumArt ? `url('${song.albumArt}')` : 'none', 
              backgroundColor: '#1a0f24' 
            }}
          />
          {!song.albumArt && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Music size={18} className="text-slate-500" />
            </div>
          )}
        </div>
        
        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{song.title}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="truncate">{song.artist}</span>
          </div>
          {/* Part badges */}
          {availableParts.length > 1 && (
            <div className="flex gap-1 mt-1">
              {availableParts.filter(p => p !== 'full').slice(0, 4).map((part, index) => {
                const colors = getPartColors(part, index);
                return (
                  <span 
                    key={part}
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase ${colors.bg} ${colors.text}`}
                  >
                    {part.charAt(0)}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Expand/Collapse Icon */}
        <ChevronDown 
          size={20} 
          className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          {/* Play All Button */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isThisSongPlaying && currentPart === 'full') {
                  onPause();
                } else {
                  onPlayAll();
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm transition-colors"
            >
              {isThisSongPlaying && currentPart === 'full' ? (
                <>
                  <Pause size={18} fill="currentColor" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  <span>Play All</span>
                </>
              )}
            </button>
            
            {/* Karaoke Button */}
            {onStartKaraoke && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartKaraoke();
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm transition-colors"
              >
                <Mic size={18} />
                <span>Karaoke</span>
              </button>
            )}
          </div>

          {/* Vocal Parts List */}
          <div className="space-y-1">
            {availableParts.map((part, index) => {
              const isActive = isThisSongPlaying && currentPart === part;
              const colors = getPartColors(part, index);
              
              return (
                <button
                  key={part}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isActive) {
                      onPause();
                    } else {
                      onPlayPart(part);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? `${colors.activeBg} text-white` 
                      : `${colors.bg} ${colors.text} hover:bg-white/10`
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-white/20' : colors.bg
                  }`}>
                    {isActive ? (
                      <Pause size={14} fill="currentColor" />
                    ) : (
                      <Play size={14} fill="currentColor" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{getPartLabel(part)}</span>
                  {isActive && (
                    <span className="ml-auto text-xs opacity-80">Playing</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Inline Playback Controls - Only show when playing */}
          {isThisSongPlaying && (
            <div className="mt-4 pt-3 border-t border-white/10">
              {/* Progress Bar */}
              <div 
                className="w-full h-2 bg-white/10 rounded-full cursor-pointer mb-2"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Time Display */}
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
