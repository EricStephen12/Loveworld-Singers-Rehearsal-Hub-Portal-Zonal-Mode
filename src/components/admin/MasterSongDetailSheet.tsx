'use client';

import { useState } from 'react';
import { X, Music, Play, Pause, Key, Clock, Mic, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MasterSong } from '@/lib/master-library-service';
import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';
import { useAudio } from '@/contexts/AudioContext';

interface MasterSongDetailSheetProps {
  song: MasterSong;
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
  onSongUpdated?: (updatedSong: MasterSong) => void;
}

export function MasterSongDetailSheet({ 
  song, 
  isOpen, 
  onClose,
}: MasterSongDetailSheetProps) {
  const router = useRouter();
  const { currentZone } = useZone();
  const { currentSong, isPlaying, currentTime, duration, setCurrentSong, togglePlayPause, setCurrentTime: seekTo } = useAudio();
  
  const isHQ = currentZone ? isHQGroup(currentZone.id) : true;
  const isCurrentSong = currentSong?.id === song.id;
  
  const [selectedPart, setSelectedPart] = useState<string>('full');
  const [showLyrics, setShowLyrics] = useState(true);

  const audioParts = song.audioUrls ? Object.entries(song.audioUrls).filter(([_, url]) => url) : [];
  const currentAudioUrl = song.audioUrls?.[selectedPart as keyof typeof song.audioUrls] || song.audioFile;

  const handlePlayPause = () => {
    if (!currentAudioUrl) return;
    
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      const audioSong = {
        id: song.id,
        title: song.title,
        audioFile: currentAudioUrl,
        writer: song.writer,
        leadSinger: song.leadSinger,
      };
      setCurrentSong(audioSong as any, true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToAudioLab = () => {
    router.push(`/pages/audiolab?song=${song.id}&source=master`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[200] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header with Close Button */}
        <div className="px-5 pb-4 border-b border-gray-100 relative">
          {/* Close Button - Absolute positioned top right */}
          <button
            onClick={onClose}
            className="absolute -top-1 right-5 z-10 w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-sm transition-colors flex items-center justify-center"
          >
            <X size={16} />
          </button>
          
          <div className="relative overflow-hidden rounded-2xl">
            {/* Background image + soft overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('/images/DSC_6155_scaled.jpg')`,
                filter: 'blur(8px)',
                transform: 'scale(1.1)',
              }}
            />
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

            <div className="relative px-4 pt-4 pb-3">
              <div className="flex items-start gap-3 pr-8">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-900 truncate">
                    {song.title}
                  </h3>
                  <p className="text-xs text-slate-600 truncate">
                    {song.writer || 'Unknown writer'}
                  </p>
                </div>
              </div>

              {/* Metadata rows similar to SongDetailModal */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                {song.leadSinger && (
                  <div className="flex justify-between border-b border-white/60 pb-1">
                    <span className="font-semibold uppercase tracking-wide text-[10px] text-slate-600">
                      Lead Singer
                    </span>
                    <span className="font-medium text-slate-900">
                      {song.leadSinger}
                    </span>
                  </div>
                )}
                {song.writer && (
                  <div className="flex justify-between border-b border-white/60 pb-1">
                    <span className="font-semibold uppercase tracking-wide text-[10px] text-slate-600">
                      Writer
                    </span>
                    <span className="text-slate-900">
                      {song.writer}
                    </span>
                  </div>
                )}
                {(song.key || song.tempo) && (
                  <div className="flex justify-between border-b border-white/60 pb-1">
                    <span className="font-semibold uppercase tracking-wide text-[10px] text-slate-600">
                      Key / Tempo
                    </span>
                    <span className="flex items-center gap-2 text-slate-900">
                      {song.key && (
                        <span className="inline-flex items-center gap-1">
                          <Key size={12} className="text-violet-500" />
                          {song.key}
                        </span>
                      )}
                      {song.tempo && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} className="text-violet-500" />
                          {song.tempo}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50/80">
          {/* Audio Player (Master: keep audio) */}
          {currentAudioUrl && (
            <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm">
              {audioParts.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {audioParts.map(([part]) => (
                    <button
                      key={part}
                      onClick={() => setSelectedPart(part)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                        selectedPart === part
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 active:scale-95 transition-all shrink-0"
                >
                  {isCurrentSong && isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
                <span className="text-xs text-slate-500 w-9 text-right tabular-nums shrink-0">
                  {formatTime(isCurrentSong ? currentTime : 0)}
                </span>
                <div className="flex-1 relative h-6 flex items-center">
                  <div className="absolute inset-x-0 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${isCurrentSong && duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={isCurrentSong ? duration || 100 : 100}
                    value={isCurrentSong ? currentTime : 0}
                    onChange={handleSeek}
                    disabled={!isCurrentSong}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-slate-500 w-9 tabular-nums shrink-0">
                  {formatTime(isCurrentSong ? duration : 0)}
                </span>
              </div>
            </div>
          )}

          {/* Lyrics Section (Master: keep lyrics) */}
          {song.lyrics && (
            <div className="mb-4">
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-600" />
                  <span className="font-medium text-slate-900 text-sm">Lyrics</span>
                </div>
                {showLyrics ? (
                  <ChevronUp size={18} className="text-slate-400" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400" />
                )}
              </button>
              {showLyrics && (
                <div className="mt-2 p-4 bg-white rounded-xl border border-slate-100 max-h-[50vh] overflow-y-auto">
                  <div
                    className="text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: song.lyrics }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - Only show for non-HQ zones */}
        {!isHQ && (
          <div className="shrink-0 p-4 border-t border-slate-200 bg-white rounded-b-3xl">
            <button
              onClick={goToAudioLab}
              className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
            >
              <Mic size={20} />
              Practice in AudioLab
            </button>
          </div>
        )}
      </div>
    </>
  );
}
