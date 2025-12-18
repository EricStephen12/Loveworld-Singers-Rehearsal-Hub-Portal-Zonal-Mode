'use client';

import { 
  ChevronDown, MoreVertical, Play, Pause, 
  SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Music, Loader2 
} from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import type { VocalPart } from '../_types';

const partLabels: Record<VocalPart, string> = {
  full: 'Full Mix',
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass'
};

const partColors: Record<VocalPart, string> = {
  full: 'bg-violet-500',
  soprano: 'bg-pink-500',
  alto: 'bg-amber-500',
  tenor: 'bg-blue-500',
  bass: 'bg-emerald-500'
};

export function FullScreenPlayer() {
  const { 
    state, 
    togglePlay, 
    toggleShuffle, 
    toggleRepeat, 
    seek,
    hideFullScreenPlayer, 
    formatTime,
    switchPart,
    getAvailableParts
  } = useAudioLab();
  
  const { player, isFullScreenPlayer } = state;
  const { currentSong, currentPart, isPlaying, currentTime, duration, isShuffled, repeatMode, isLoading } = player;

  if (!isFullScreenPlayer || !currentSong) return null;
  
  const availableParts = getAvailableParts();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 pt-safe">
        <button 
          onClick={hideFullScreenPlayer}
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronDown size={28} />
        </button>
        <span className="text-sm font-medium text-zinc-400">Now Playing</span>
        <button className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Album Art */}
        <div className="w-full max-w-[280px] aspect-square rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 shadow-2xl shadow-violet-500/20 flex items-center justify-center mb-10">
          {currentSong.albumArt ? (
            <img 
              src={currentSong.albumArt} 
              alt={currentSong.title}
              className="w-full h-full object-cover rounded-3xl"
            />
          ) : (
            <Music size={80} className="text-white/40" />
          )}
        </div>

        {/* Song Info */}
        <div className="text-center mb-6 w-full">
          <h2 className="text-2xl font-bold text-white mb-1 truncate">
            {currentSong.title}
          </h2>
          <p className="text-zinc-400">{currentSong.artist}</p>
        </div>

        {/* Vocal Part Selector */}
        {availableParts.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6 w-full">
            {availableParts.map(part => (
              <button
                key={part}
                onClick={() => switchPart(part)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentPart === part
                    ? `${partColors[part]} text-white shadow-lg`
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {partLabels[part]}
              </button>
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="w-full mb-6">
          <div 
            className="h-1 bg-zinc-800 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full relative transition-all duration-150"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 w-full">
          <button 
            onClick={toggleShuffle}
            className={`w-10 h-10 flex items-center justify-center transition-colors ${
              isShuffled ? 'text-violet-400' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Shuffle size={20} />
          </button>
          
          <button className="w-12 h-12 flex items-center justify-center text-white hover:scale-105 transition-transform">
            <SkipBack size={28} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={28} className="text-zinc-900 animate-spin" />
            ) : isPlaying ? (
              <Pause size={28} className="text-zinc-900" fill="currentColor" />
            ) : (
              <Play size={28} className="text-zinc-900 ml-1" fill="currentColor" />
            )}
          </button>
          
          <button className="w-12 h-12 flex items-center justify-center text-white hover:scale-105 transition-transform">
            <SkipForward size={28} fill="currentColor" />
          </button>
          
          <button 
            onClick={toggleRepeat}
            className={`w-10 h-10 flex items-center justify-center transition-colors ${
              repeatMode !== 'off' ? 'text-violet-400' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
