'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, Music, Play, Pause, User, Key, Clock, 
  Download, Mic, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MasterSong } from '@/lib/master-library-service';

interface MasterSongDetailSheetProps {
  song: MasterSong;
  isOpen: boolean;
  onClose: () => void;
  // Optional props reserved for future editing capabilities
  canEdit?: boolean;
  onSongUpdated?: (updatedSong: MasterSong) => void;
}

export function MasterSongDetailSheet({ 
  song, 
  isOpen, 
  onClose,
  // currently unused but accepted to match callers
  canEdit,
  onSongUpdated,
}: MasterSongDetailSheetProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedPart, setSelectedPart] = useState<string>('full');
  const [showLyrics, setShowLyrics] = useState(true);
  const [showSolfa, setShowSolfa] = useState(false);

  // Get available audio parts
  const audioParts = song.audioUrls ? Object.entries(song.audioUrls).filter(([_, url]) => url) : [];
  const currentAudioUrl = song.audioUrls?.[selectedPart as keyof typeof song.audioUrls] || song.audioFile;

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (!audioRef.current || !currentAudioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
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

        {/* Header / Song Summary (inspired by SongDetailModal) */}
        <div className="px-5 pb-4 border-b border-gray-100">
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
              <div className="flex items-start gap-3">
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
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/70 text-slate-500 hover:bg-white shadow-sm shrink-0"
                >
                  <X size={16} />
                </button>
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
                {(song.writer || song.importCount) && (
                  <div className="flex justify-between border-b border-white/60 pb-1">
                    <span className="font-semibold uppercase tracking-wide text-[10px] text-slate-600">
                      Writer
                    </span>
                    <span className="flex items-center gap-2 text-slate-900">
                      <span>{song.writer || 'Unknown'}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-medium text-emerald-700">
                        <Download size={12} />
                        {song.importCount || 0} imports
                      </span>
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
              <audio
                ref={audioRef}
                src={currentAudioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Part Selector */}
              {audioParts.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {audioParts.map(([part]) => (
                    <button
                      key={part}
                      onClick={() => {
                        setSelectedPart(part);
                        setIsPlaying(false);
                        if (audioRef.current) audioRef.current.currentTime = 0;
                      }}
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

              {/* Play Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
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
                <div className="mt-2 p-4 bg-white rounded-xl border border-slate-100">
                  <div
                    className="text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: song.lyrics }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-4 border-t border-slate-200 bg-white rounded-b-3xl">
          <button
            onClick={goToAudioLab}
            className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
          >
            <Mic size={20} />
            Practice in AudioLab
          </button>
        </div>
      </div>
    </>
  );
}
