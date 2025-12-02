import React, { useState, useRef } from 'react';
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
  // BandLab Studio State
  const [playheadPosition, setPlayheadPosition] = useState(25);
  const [masterVolume, setMasterVolume] = useState(75);
  const [showAIVoicePanel, setShowAIVoicePanel] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Female Pop');
  const [aiLyrics, setAiLyrics] = useState('');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedTool, setSelectedTool] = useState('select');

  const timelineRef = useRef(null);

  // Modern Audio Editor Tracks Data
  const tracks = [
    {
      id: 1,
      name: 'Track 1',
      color: '#8B5CF6',
      volume: 85,
      muted: false,
      solo: false,
      waveform: Array.from({length: 400}, () => Math.random() * 100)
    },
    {
      id: 2,
      name: 'Track 2',
      color: '#06B6D4',
      volume: 78,
      muted: false,
      solo: false,
      waveform: Array.from({length: 400}, () => Math.random() * 100)
    },
    {
      id: 3,
      name: 'Track 3',
      color: '#10B981',
      volume: 82,
      muted: false,
      solo: false,
      waveform: Array.from({length: 400}, () => Math.random() * 100)
    }
  ];

  // ACE Studio AI Voice Options
  const aiVoiceOptions = [
    'Female Pop',
    'Male Rock',
    'Female R&B',
    'Male Rap',
    'Female Country',
    'Male Jazz',
    'Child Voice',
    'Robotic'
  ];
  // iOS Functions
  const handleTimelineClick = (e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setPlayheadPosition(percentage);
    }
  };

  const generateAIVoice = () => {
    if (!aiLyrics.trim()) return;

    setIsGeneratingVoice(true);
    // Simulate AI voice generation
    setTimeout(() => {
      setIsGeneratingVoice(false);
      setShowAIVoicePanel(false);
      // Add generated voice track
      console.log(`Generated AI voice: ${selectedVoice} with lyrics: ${aiLyrics}`);
    }, 3000);
  };

  return (
    <div className="modern-audio-studio">
      {/* Top Header */}
      <div className="studio-header">
        <div className="header-left">
          <button className="back-btn" onClick={goBackFromMusicProduction}>
            ←
          </button>
          <div className="project-info">
            <span className="project-name">Smart Echoes</span>
            <span className="project-status">Online • Mix</span>
          </div>
        </div>
        <div className="header-right">
          <button className="share-btn">🔗</button>
          <button className="menu-btn">⋯</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="studio-content">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          {tracks.map(track => (
            <div key={track.id} className="track-control">
              <div className="track-icon" style={{ backgroundColor: track.color }}>
                🎵
              </div>
              <div className="track-volume">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={track.volume}
                  className="vertical-slider"
                  orient="vertical"
                />
              </div>
            </div>
          ))}

          {/* Add Track Button */}
          <div className="add-track-btn">
            <button className="add-btn">+</button>
          </div>
        </div>

        {/* Waveform Display Area */}
        <div className="waveform-display">
          {/* Timeline */}
          <div className="timeline-ruler" ref={timelineRef} onClick={handleTimelineClick}>
            <div className="timeline-markers">
              {Array.from({length: 20}, (_, i) => (
                <div key={i} className="timeline-marker" style={{ left: `${i * 5}%` }}>
                  <div className="marker-line"></div>
                  <span className="marker-time">{i}s</span>
                </div>
              ))}
            </div>
            <div className="playhead-cursor" style={{ left: `${playheadPosition}%` }}>
              <div className="playhead-line"></div>
            </div>
          </div>

          {/* Waveform Tracks */}
          <div className="waveform-tracks">
            {tracks.map(track => (
              <div key={track.id} className="waveform-track">
                <div className="waveform-container" style={{ backgroundColor: `${track.color}20` }}>
                  <div className="waveform-bars">
                    {track.waveform.map((height, i) => (
                      <div
                        key={i}
                        className="waveform-bar"
                        style={{
                          height: `${height}%`,
                          backgroundColor: track.color
                        }}
                      />
                    ))}
                  </div>
                  <div className="track-playhead" style={{ left: `${playheadPosition}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Transport Controls */}
      <div className="bottom-transport">
        <div className="transport-left">
          <span className="time-display">00:00</span>
          <button className="volume-btn">🔊</button>
        </div>

        <div className="transport-center">
          <button className="transport-btn">⏮</button>
          <button
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={toggleStudioPlayback}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="transport-btn">⏭</button>
        </div>

        <div className="transport-right">
          <button className="tool-btn">📁</button>
          <button
            className={`record-btn ${isStudioRecording ? 'recording' : ''}`}
            onClick={toggleStudioRecording}
          >
            ●
          </button>
          <button className="tool-btn">🎛</button>
          <button
            className="tool-btn ai-voice-btn"
            onClick={() => setShowAIVoicePanel(true)}
            title="ACE Studio AI Voice"
          >
            🎤
          </button>
          <button className="tool-btn">⚙️</button>
          <button className="tool-btn">🎧</button>
        </div>
      </div>

      {/* ACE Studio AI Voice Panel */}
      {showAIVoicePanel && (
        <div className="ai-voice-overlay">
          <div className="ai-voice-panel">
            <div className="panel-header">
              <h3>ACE Studio AI Voice</h3>
              <button
                className="close-btn"
                onClick={() => setShowAIVoicePanel(false)}
              >
                ×
              </button>
            </div>

            <div className="panel-content">
              <div className="voice-selection">
                <label>Voice Type:</label>
                <select
                  className="voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {aiVoiceOptions.map(voice => (
                    <option key={voice} value={voice}>{voice}</option>
                  ))}
                </select>
              </div>

              <div className="lyrics-input">
                <label>Lyrics:</label>
                <textarea
                  className="lyrics-textarea"
                  value={aiLyrics}
                  onChange={(e) => setAiLyrics(e.target.value)}
                  placeholder="Enter your lyrics here..."
                  rows={4}
                />
              </div>

              <div className="panel-actions">
                <button
                  className="generate-btn"
                  onClick={generateAIVoice}
                  disabled={!aiLyrics.trim() || isGeneratingVoice}
                >
                  {isGeneratingVoice ? 'Generating...' : 'Generate AI Voice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicProductionView;

