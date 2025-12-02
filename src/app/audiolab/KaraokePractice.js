import React, { useState, useEffect } from 'react';
import './PracticeMode.css';

const KaraokePractice = ({ onBack }) => {
  // Player controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(105); // 1:45
  const [duration, setDuration] = useState(600); // 10:00
  const [volume, setVolume] = useState(0.7);
  const [pitch, setPitch] = useState(0);
  
  // Stats state
  const [score, setScore] = useState(2450);
  const [accuracy, setAccuracy] = useState(92);
  const [streak, setStreak] = useState(15);
  const [hitRate, setHitRate] = useState(88);
  const [progress, setProgress] = useState(78);

  // Timer effect
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  // Player control functions
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  const handlePitchChange = (newPitch) => {
    setPitch(Math.max(-12, Math.min(12, newPitch)));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="practice-mode-page">
      {/* Header */}
      <div className="practice-mode-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-icons">close</span>
        </button>
        <h1 className="practice-mode-title">Karaoke Mode</h1>
        <button className="profile-button">
          <span className="material-icons">mic</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="practice-mode-content">
        {/* Progress Bar */}
        <div className="main-progress-container">
          <div className="progress-bar-main">
            <div 
              className="progress-fill-main karaoke-progress" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text karaoke-text">{progress}%</div>
        </div>

        {/* Song Info */}
        <div className="song-info">
          <h2 className="song-title">Perfect - Ed Sheeran</h2>
          <p className="song-artist">Karaoke Version</p>
          <div className="song-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Motivational Text */}
        <div className="motivation-text">
          <p>🎤 Sing your heart out</p>
          <p>🎵 Feel the music flow through you</p>
          <p>⭐ You're a natural performer</p>
          <p>🎶 Let your voice shine bright</p>
          <p>🌟 Every note tells your story</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card karaoke-card">
            <div className="stat-label">SCORE</div>
            <div className="stat-value">{score.toLocaleString()}</div>
          </div>
          <div className="stat-card karaoke-card">
            <div className="stat-label">ACCURACY</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
          <div className="stat-card karaoke-card">
            <div className="stat-label">STREAK</div>
            <div className="stat-value">{streak}</div>
          </div>
          <div className="stat-card karaoke-card">
            <div className="stat-label">HIT RATE</div>
            <div className="stat-value">{hitRate}%</div>
          </div>
        </div>

        {/* Achievement Button */}
        <div className="achievement-button-container">
          <button className="achievement-button karaoke-achievement">
            🎤 AMAZING PERFORMANCE!
          </button>
        </div>
      </div>

      {/* Fixed Player Controls */}
      <div className="player-controls">
        {/* Main Play Controls */}
        <div className="play-controls">
          <button className="control-btn skip-back">
            <span className="material-icons">replay_10</span>
          </button>
          
          <button className="play-button karaoke-play" onClick={togglePlay}>
            <span className="material-icons">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          
          <button className="control-btn skip-forward">
            <span className="material-icons">forward_10</span>
          </button>
        </div>

        {/* Volume and Pitch Controls */}
        <div className="audio-controls">
          <div className="control-group">
            <label>Volume</label>
            <div className="slider-container">
              <button 
                className="slider-btn"
                onClick={() => handleVolumeChange(volume - 0.1)}
              >
                <span className="material-icons">remove</span>
              </button>
              <div className="slider-track">
                <div 
                  className="slider-fill karaoke-slider" 
                  style={{ width: `${volume * 100}%` }}
                ></div>
                <div 
                  className="slider-thumb" 
                  style={{ left: `${volume * 100}%` }}
                ></div>
              </div>
              <button 
                className="slider-btn"
                onClick={() => handleVolumeChange(volume + 0.1)}
              >
                <span className="material-icons">add</span>
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>Pitch</label>
            <div className="slider-container">
              <button 
                className="slider-btn"
                onClick={() => handlePitchChange(pitch - 1)}
              >
                <span className="material-icons">remove</span>
              </button>
              <div className="pitch-display">{pitch > 0 ? '+' : ''}{pitch}</div>
              <button 
                className="slider-btn"
                onClick={() => handlePitchChange(pitch + 1)}
              >
                <span className="material-icons">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KaraokePractice;
