'use client';

import { useEffect, useRef } from 'react';
import { X, Play, Mic, AudioLines, Music, Clock } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { createProject } from '../_lib/project-service';
import type { Song, VocalPart } from '../_types';

interface SongActionSheetProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SongActionSheet({ song, isOpen, onClose }: SongActionSheetProps) {
  const { playSong, setView, setCurrentProject } = useAudioLab();
  const { user } = useAuth();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen || !song) return null;

  const handlePlayNow = async () => {
    await playSong(song);
    onClose();
  };

  const handlePractice = async () => {
    await playSong(song);
    setView('karaoke');
    onClose();
  };

  const handleUseInStudio = async () => {
    if (!user?.uid) return;
    
    // Create a new project with this song as backing track
    const result = await createProject({
      name: `Recording - ${song.title}`,
      ownerId: user.uid,
      referenceSongId: song.id
    });
    
    if (result.success && result.project) {
      // Load the song as backing track
      await playSong(song);
      // Set the project in context
      setCurrentProject(result.project.id);
      setView('studio');
    }
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPartBadges = () => {
    if (!song.availableParts || song.availableParts.length <= 1) return null;
    
    const partColors: Record<VocalPart, string> = {
      full: 'bg-violet-500/20 text-violet-400',
      soprano: 'bg-pink-500/20 text-pink-400',
      alto: 'bg-amber-500/20 text-amber-400',
      tenor: 'bg-blue-500/20 text-blue-400',
      bass: 'bg-emerald-500/20 text-emerald-400'
    };
    
    return (
      <div className="flex gap-1.5 mt-2">
        {song.availableParts.filter(p => p !== 'full').map(part => (
          <span 
            key={part}
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${partColors[part]}`}
          >
            {part}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        ref={sheetRef}
        className="w-full max-w-md bg-[#1a0f24] rounded-t-3xl border-t border-white/10 animate-in slide-in-from-bottom duration-300"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Song Info Header */}
        <div className="px-5 pb-4 border-b border-white/5">
          <div className="flex items-start gap-4">
            {/* Album Art */}
            <div className="relative size-20 rounded-xl overflow-hidden bg-[#261933] shrink-0 shadow-lg">
              {song.albumArt ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${song.albumArt}')` }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Music size={32} className="text-slate-500" />
                </div>
              )}
            </div>
            
            {/* Song Details */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-white text-lg font-bold leading-tight truncate">
                {song.title}
              </h3>
              <p className="text-slate-400 text-sm truncate mt-0.5">
                {song.artist}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDuration(song.duration)}
                </span>
                {song.genre && (
                  <span className="text-violet-400">{song.genre}</span>
                )}
              </div>
              {getPartBadges()}
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="size-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 space-y-3">
          {/* Play Now */}
          <button
            onClick={handlePlayNow}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-violet-500 hover:bg-violet-600 text-white transition-colors active:scale-[0.98]"
          >
            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
              <Play size={24} fill="currentColor" className="ml-0.5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-base">Play Now</p>
              <p className="text-white/70 text-sm">Listen to the full track</p>
            </div>
          </button>

          {/* Practice / Karaoke */}
          <button
            onClick={handlePractice}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#261933] border border-white/5 hover:border-violet-500/30 text-white transition-colors active:scale-[0.98]"
          >
            <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Mic size={24} className="text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-base">Practice</p>
              <p className="text-slate-400 text-sm">Karaoke mode with lyrics</p>
            </div>
          </button>

          {/* Use in Studio */}
          <button
            onClick={handleUseInStudio}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#261933] border border-white/5 hover:border-violet-500/30 text-white transition-colors active:scale-[0.98]"
          >
            <div className="size-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <AudioLines size={24} className="text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-base">Use in Studio</p>
              <p className="text-slate-400 text-sm">Record with backing track</p>
            </div>
          </button>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-8" />
      </div>
    </div>
  );
}
