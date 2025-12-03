import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, Share2, MoreHorizontal, Plus, Music, 
  SkipBack, Play, Pause, SkipForward, Circle, Mic,
  Volume2, Folder, Settings, Headphones, Sliders
} from 'lucide-react';
import './ModernAudioStudio.css';

const MusicProductionView = ({
  goBackFromMusicProduction,
  projectTempo = 120,
  isPlaying,
  timeSignature = '4/4',
  isLooping,
  toggleLoop,
  toggleStudioPlayback,
  isStudioRecording,
  toggleStudioRecording
}) => {
  const [playheadPosition, setPlayheadPosition] = useState(25);
  const [masterVolume, setMasterVolume] = useState(75);
  const timelineRef = useRef(null);

  const tracks = [
    { id: 1, name: 'Vocals', color: '#8B5CF6', volume: 85, muted: false, solo: false },
    { id: 2, name: 'Guitar', color: '#06B6D4', volume: 78, muted: false, solo: false },
    { id: 3, name: 'Drums', color: '#10B981', volume: 82, muted: false, solo: false }
  ];

  const handleTimelineClick = (e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setPlayheadPosition(Math.max(0, Math.min(100, percentage)));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="studio-container">
      {/* Header */}
      <header className="studio-header">
        <div className="header-left">
          <button className="icon-btn" onClick={goBackFromMusicProduction}>
            <ChevronLeft size={20} />
          </button>
          <div className="project-info">
            <h1 className="project-name">Smart Echoes</h1>
            <span className="project-meta">{projectTempo} BPM • {timeSignature}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn">
            <Share2 size={18} />
          </button>
          <button className="icon-btn">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="studio-main">
        {/* Track List */}
        <div className="track-list">
          {tracks.map(track => (
            <div key={track.id} className="track-row">
              <div className="track-header">
                <div className="track-color" style={{ backgroundColor: track.color }} />
                <span className="track-name">{track.name}</span>
                <div className="track-controls">
                  <button className={`track-btn ${track.muted ? 'active' : ''}`}>M</button>
                  <button className={`track-btn ${track.solo ? 'active' : ''}`}>S</button>
                </div>
              </div>
              <div className="track-waveform" style={{ backgroundColor: `${track.color}15` }}>
                <div className="waveform-visual">
                  {Array.from({ length: 60 }, (_, i) => (
                    <div
                      key={i}
                      className="wave-bar"
                      style={{
                        height: `${20 + Math.random() * 60}%`,
                        backgroundColor: track.color,
                        opacity: 0.7
                      }}
                    />
                  ))}
                </div>
                <div 
                  className="track-playhead" 
                  style={{ left: `${playheadPosition}%` }}
                />
              </div>
            </div>
          ))}

          {/* Add Track */}
          <button className="add-track-btn">
            <Plus size={18} />
            <span>Add Track</span>
          </button>
        </div>

        {/* Timeline */}
        <div className="timeline" ref={timelineRef} onClick={handleTimelineClick}>
          <div className="timeline-markers">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="marker">
                <span>{i * 5}s</span>
              </div>
            ))}
          </div>
          <div className="playhead" style={{ left: `${playheadPosition}%` }}>
            <div className="playhead-head" />
            <div className="playhead-line" />
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="transport-bar">
        <div className="transport-left">
          <span className="time-display">{formatTime(playheadPosition * 0.4)}</span>
          <button className="transport-icon-btn">
            <Volume2 size={18} />
          </button>
        </div>

        <div className="transport-center">
          <button className="transport-btn">
            <SkipBack size={20} />
          </button>
          <button 
            className={`play-btn-large ${isPlaying ? 'playing' : ''}`}
            onClick={() => toggleStudioPlayback(!isPlaying)}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} fill="white" />}
          </button>
          <button className="transport-btn">
            <SkipForward size={20} />
          </button>
        </div>

        <div className="transport-right">
          <button className="transport-icon-btn">
            <Folder size={18} />
          </button>
          <button 
            className={`record-btn ${isStudioRecording ? 'recording' : ''}`}
            onClick={() => toggleStudioRecording()}
          >
            <Circle size={16} fill={isStudioRecording ? '#ef4444' : 'currentColor'} />
          </button>
          <button className="transport-icon-btn">
            <Sliders size={18} />
          </button>
          <button className="transport-icon-btn">
            <Mic size={18} />
          </button>
          <button className="transport-icon-btn">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicProductionView;
