'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudioStore } from '@/lib/audio-store';
import { Volume2, VolumeX, Headphones, Trash2 } from 'lucide-react';

export default function Timeline() {
  const { tracks, currentTime, duration, isPlaying, setCurrentTime, setVolume, toggleMute, toggleSolo, removeTrack } = useAudioStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [waveforms, setWaveforms] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Generate waveforms for all tracks
    tracks.forEach(async (track) => {
      if (track.audioBuffer && !waveforms[track.id]) {
        const waveformSvg = generateWaveform(track.audioBuffer, track.id);
        setWaveforms(prev => ({ ...prev, [track.id]: waveformSvg }));
      }
    });
  }, [tracks]);

  const generateWaveform = (audioBuffer: AudioBuffer, trackId: string): string => {
    const channelData = audioBuffer.getChannelData(0);
    const samples = 800; // More detailed waveform
    const blockSize = Math.floor(channelData.length / samples);
    const bars = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[i * blockSize + j]);
      }
      const average = sum / blockSize;
      const height = Math.max(1, average * 60);
      bars.push(`<rect x="${i}" y="${30 - height/2}" width="0.8" height="${height}" fill="currentColor" opacity="0.7"/>`);
    }

    return `<svg width="800" height="60" viewBox="0 0 800 60" class="w-full h-full">${bars.join('')}</svg>`;
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrackColor = (index: number): string => {
    const colors = ['text-purple-400', 'text-blue-400', 'text-green-400', 'text-yellow-400', 'text-red-400'];
    return colors[index % colors.length];
  };

  const getTrackBgColor = (index: number): string => {
    const colors = ['bg-purple-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-yellow-500/20', 'bg-red-500/20'];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Timeline</h3>
        <div className="text-sm text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Time Ruler */}
      <div className="relative mb-4">
        <div className="h-6 bg-gray-700 rounded relative overflow-hidden">
          {/* Time markers */}
          {Array.from({ length: Math.ceil(duration / 10) + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-gray-600"
              style={{ left: `${(i * 10 / duration) * 100}%` }}
            >
              <span className="absolute top-0 left-1 text-xs text-gray-400">
                {formatTime(i * 10)}
              </span>
            </div>
          ))}
          
          {/* Playhead */}
          <div
            className="absolute top-0 w-0.5 h-full bg-white z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="space-y-3">
        {tracks.map((track, index) => (
          <div key={track.id} className="bg-gray-700/50 rounded-lg p-3">
            {/* Track Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className={`font-medium ${getTrackColor(index)}`}>
                  {track.name}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => toggleMute(track.id)}
                    className={`p-1 rounded ${track.muted ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-300'} hover:bg-opacity-80`}
                  >
                    {track.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleSolo(track.id)}
                    className={`p-1 rounded ${track.solo ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-gray-300'} hover:bg-opacity-80`}
                  >
                    <Headphones className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="p-1 rounded bg-gray-600 text-gray-300 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Vol</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => setVolume(track.id, parseFloat(e.target.value))}
                  className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400 w-8">
                  {Math.round(track.volume * 100)}
                </span>
              </div>
            </div>

            {/* Waveform */}
            <div
              ref={index === 0 ? timelineRef : null}
              className={`relative h-16 ${getTrackBgColor(index)} rounded cursor-pointer overflow-hidden`}
              onClick={handleTimelineClick}
            >
              {waveforms[track.id] && (
                <div className={`${getTrackColor(index)} opacity-80`}>
                  <div dangerouslySetInnerHTML={{ __html: waveforms[track.id] }} />
                </div>
              )}
              
              {/* Track duration indicator */}
              <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                {formatTime(track.duration)}
              </div>
              
              {/* Muted overlay */}
              {track.muted && (
                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                  <VolumeX className="w-6 h-6 text-red-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tracks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">🎵</div>
          <p>No tracks loaded</p>
          <p className="text-sm">Upload some audio files to get started</p>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}