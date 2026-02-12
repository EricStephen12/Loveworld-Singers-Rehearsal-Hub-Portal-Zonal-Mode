'use client';

import { useState } from 'react';
import { X, Music, Play, Pause, Key, Clock, Mic, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MasterSong } from '@/lib/master-library-service';
import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';
import { useAudio } from '@/contexts/AudioContext';
import CustomLoader from '@/components/CustomLoader';

interface MasterSongDetailSheetProps {
  song: MasterSong;
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
  onSongUpdated?: (updatedSong: MasterSong) => void;
}

// Helper function to convert HTML back to plain text for display (matching edit modal format)
const formatLyricsForDisplay = (html: string): string => {
  if (!html) return '';

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

  const [showLyrics, setShowLyrics] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Only use Full Mix audio in the detail sheet - other parts are for AudioLab
  const fullMixUrl = song.audioUrls?.full || song.audioFile;

  const handlePlayPause = () => {
    if (!fullMixUrl) return;

    if (isCurrentSong) {
      togglePlayPause();
    } else {
      const audioSong = {
        id: song.id,
        title: song.title,
        audioFile: fullMixUrl,
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
    setIsNavigating(true);
    // Navigate to AudioLab library with song title to auto-search
    router.push(`/pages/audiolab?view=library&program=ongoing&song=${encodeURIComponent(song.title)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[200] animate-fadeIn"
        onClick={onClose}
      />

      {/* Sheet - Full screen on mobile, bottom sheet on larger screens */}
      <div className="fixed inset-0 sm:inset-auto sm:bottom-0 sm:left-0 sm:right-0 z-[200] bg-white sm:rounded-t-3xl shadow-2xl animate-slide-up sm:max-h-[90vh] flex flex-col safe-area-inset-bottom">
        {/* Handle - Only show on larger screens */}
        <div className="hidden sm:flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header with Close Button */}
        <div className="px-4 sm:px-5 pt-3 sm:pt-0 pb-4 border-b border-gray-100 relative shrink-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 sm:-top-1 right-4 sm:right-5 z-10 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-sm transition-colors flex items-center justify-center"
          >
            <X size={18} className="sm:w-4 sm:h-4" />
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
              <div className="flex items-start gap-3 pr-10">
                <div className="w-12 h-12 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Music className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-base font-semibold text-slate-900 line-clamp-2">
                    {song.title}
                  </h3>
                  <p className="text-sm sm:text-xs text-slate-600 truncate mt-0.5">
                    {song.writer || 'Unknown writer'}
                  </p>
                </div>
              </div>

              {/* Metadata rows */}
              <div className="mt-4 sm:mt-3 space-y-2 sm:space-y-1.5 text-sm sm:text-xs text-slate-700">
                {song.leadSinger && (
                  <div className="flex justify-between border-b border-white/60 pb-1.5 sm:pb-1">
                    <span className="font-semibold uppercase tracking-wide text-[11px] sm:text-[10px] text-slate-600">
                      Lead Singer
                    </span>
                    <span className="font-medium text-slate-900">
                      {song.leadSinger}
                    </span>
                  </div>
                )}
                {song.writer && (
                  <div className="flex justify-between border-b border-white/60 pb-1.5 sm:pb-1">
                    <span className="font-semibold uppercase tracking-wide text-[11px] sm:text-[10px] text-slate-600">
                      Writer
                    </span>
                    <span className="text-slate-900">
                      {song.writer}
                    </span>
                  </div>
                )}
                {song.category && (
                  <div className="flex justify-between border-b border-white/60 pb-1.5 sm:pb-1">
                    <span className="font-semibold uppercase tracking-wide text-[11px] sm:text-[10px] text-slate-600">
                      Category
                    </span>
                    <span className="text-slate-900">
                      {song.category}
                    </span>
                  </div>
                )}
                {(song.key || song.tempo) && (
                  <div className="flex justify-between border-b border-white/60 pb-1.5 sm:pb-1">
                    <span className="font-semibold uppercase tracking-wide text-[11px] sm:text-[10px] text-slate-600">
                      Key / Tempo
                    </span>
                    <span className="flex items-center gap-2 text-slate-900">
                      {song.key && (
                        <span className="inline-flex items-center gap-1">
                          <Key size={14} className="sm:w-3 sm:h-3 text-violet-500" />
                          {song.key}
                        </span>
                      )}
                      {song.tempo && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} className="sm:w-3 sm:h-3 text-violet-500" />
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
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 bg-slate-50/80 min-h-0">
          {/* Audio Player */}
          {fullMixUrl && (
            <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 active:scale-95 transition-all shrink-0"
                >
                  {isCurrentSong && isPlaying ? <Pause size={20} className="sm:w-[18px] sm:h-[18px]" /> : <Play size={20} className="sm:w-[18px] sm:h-[18px] ml-0.5" />}
                </button>
                <span className="text-sm sm:text-xs text-slate-500 w-10 sm:w-9 text-right tabular-nums shrink-0">
                  {formatTime(isCurrentSong ? currentTime : 0)}
                </span>
                <div className="flex-1 relative h-8 sm:h-6 flex items-center">
                  <div className="absolute inset-x-0 h-1.5 sm:h-1 bg-slate-200 rounded-full overflow-hidden">
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
                <span className="text-sm sm:text-xs text-slate-500 w-10 sm:w-9 tabular-nums shrink-0">
                  {formatTime(isCurrentSong ? duration : 0)}
                </span>
              </div>
            </div>
          )}

          {/* Lyrics Section */}
          {song.lyrics && (
            <div className="mb-4">
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className="w-full flex items-center justify-between px-4 sm:px-3 py-3 sm:py-2.5 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="sm:w-[18px] sm:h-[18px] text-purple-600" />
                  <span className="font-medium text-slate-900 text-base sm:text-sm">Lyrics</span>
                </div>
                {showLyrics ? (
                  <ChevronUp size={20} className="sm:w-[18px] sm:h-[18px] text-slate-400" />
                ) : (
                  <ChevronDown size={20} className="sm:w-[18px] sm:h-[18px] text-slate-400" />
                )}
              </button>
              {showLyrics && (
                <div className="mt-2 p-4 bg-white rounded-xl border border-slate-100 overflow-y-auto">
                  <style>{`
                    .lyrics-content {
                      white-space: pre-wrap;
                      word-wrap: break-word;
                      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
                      font-size: 14px;
                      line-height: 1.6;
                    }
                    .lyrics-content div {
                      margin-bottom: 0;
                      padding: 0;
                    }
                    .lyrics-content br {
                      display: block;
                      content: "";
                    }
                    .lyrics-content b,
                    .lyrics-content strong {
                      font-weight: 700;
                    }
                  `}</style>
                  <pre
                    className="lyrics-content text-slate-800 whitespace-pre-wrap font-mono text-sm"
                    dangerouslySetInnerHTML={{ __html: formatLyricsForDisplay(song.lyrics) }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - Only show for non-HQ zones */}
        {!isHQ && (
          <div className="shrink-0 p-4 border-t border-slate-200 bg-white sm:rounded-b-3xl safe-area-inset-bottom">
            <button
              onClick={goToAudioLab}
              disabled={isNavigating}
              className="w-full py-4 sm:py-3.5 bg-slate-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm text-base sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isNavigating ? (
                <>
                  <CustomLoader size="sm" />
                  <span className="ml-2">Opening AudioLab...</span>
                </>
              ) : (
                <>
                  <Mic size={22} className="sm:w-5 sm:h-5" />
                  Practice in AudioLab
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
