'use client';

import { Play, Pause, X, Music, Loader2 } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import type { VocalPart } from '../_types';

const partLabels: Record<VocalPart, string> = {
  full: 'Full',
  soprano: 'S',
  alto: 'A',
  tenor: 'T',
  bass: 'B'
};

export function MiniPlayer() {
  const { state, togglePlay, hidePlayer, showFullScreenPlayer, switchPart, getAvailableParts } = useAudioLab();
  const { player, isPlayerVisible } = state;
  const { currentSong, currentPart, isPlaying, currentTime, duration, isLoading } = player;

  if (!isPlayerVisible || !currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const availableParts = getAvailableParts();

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 px-2 pb-2">
      <div className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-800">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center gap-3 p-3">
          {/* Album art / Song info - tappable for fullscreen */}
          <button 
            onClick={showFullScreenPlayer}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
              {currentSong.albumArt ? (
                <img 
                  src={currentSong.albumArt} 
                  alt={currentSong.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Music size={20} className="text-white/80" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate">
                {currentSong.title}
              </h4>
              <div className="flex items-center gap-2">
                <p className="text-xs text-zinc-400 truncate">
                  {currentSong.artist}
                </p>
                {currentPart !== 'full' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium uppercase">
                    {currentPart}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Part Selector (if multiple parts available) */}
          {availableParts.length > 1 && (
            <div className="flex items-center gap-0.5 mr-1">
              {availableParts.map(part => (
                <button
                  key={part}
                  onClick={() => switchPart(part)}
                  className={`w-7 h-7 rounded-md text-[10px] font-bold transition-colors ${
                    currentPart === part
                      ? 'bg-violet-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {partLabels[part]}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="text-zinc-900 animate-spin" />
              ) : isPlaying ? (
                <Pause size={18} className="text-zinc-900" fill="currentColor" />
              ) : (
                <Play size={18} className="text-zinc-900 ml-0.5" fill="currentColor" />
              )}
            </button>
            
            <button
              onClick={hidePlayer}
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
