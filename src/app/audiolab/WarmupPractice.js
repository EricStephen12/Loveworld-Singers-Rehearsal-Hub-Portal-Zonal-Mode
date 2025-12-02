import React, { useState, useEffect } from 'react';
import './PracticeMode.css';

const WarmupPractice = ({ onBack }) => {
  // Player controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(45); // 0:45
  const [duration, setDuration] = useState(300); // 5:00
  const [volume, setVolume] = useState(0.6);
  const [pitch, setPitch] = useState(0);
  
  // Stats state
  const [score, setScore] = useState(1250);
  const [accuracy, setAccuracy] = useState(85);
  const [streak, setStreak] = useState(8);
  const [hitRate, setHitRate] = useState(82);
  const [progress, setProgress] = useState(45);

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
    <div className="practice-mode-page warmup-theme">
      {/* Header */}
      <div className="practice-mode-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-icons">close</span>
        </button>
        <h1 className="practice-mode-title">Vocal Warm-Up</h1>
        <button className="profile-button">
          <span className="material-icons">waves</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="practice-mode-content">
        {/* Progress Bar */}
        <div className="main-progress-container">
          <div className="progress-bar-main">
            <div 
              className="progress-fill-main warmup-progress" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text warmup-text">{progress}%</div>
        </div>

        {/* Exercise Info */}
        <div className="song-info">
          <h2 className="song-title">Breathing & Scales</h2>
          <p className="song-artist">Vocal Warm-Up Session</p>
          <div className="song-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Motivational Text */}
        <div className="motivation-text">
          <p>🫁 Breathe deep and steady</p>
          <p>🎵 Warm up those vocal cords</p>
          <p>💪 Build your vocal strength</p>
          <p>🌊 Let your voice flow naturally</p>
          <p>⚡ Prepare for greatness</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card warmup-card">
            <div className="stat-label">SCORE</div>
            <div className="stat-value">{score.toLocaleString()}</div>
          </div>
          <div className="stat-card warmup-card">
            <div className="stat-label">ACCURACY</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
          <div className="stat-card warmup-card">
            <div className="stat-label">STREAK</div>
            <div className="stat-value">{streak}</div>
          </div>
          <div className="stat-card warmup-card">
            <div className="stat-label">HIT RATE</div>
            <div className="stat-value">{hitRate}%</div>
          </div>
        </div>

        {/* Achievement Button */}
        <div className="achievement-button-container">
          <button className="achievement-button warmup-achievement">
            🫁 EXCELLENT WARM-UP!
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
          
          <button className="play-button warmup-play" onClick={togglePlay}>
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
                  className="slider-fill warmup-slider" 
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

export default WarmupPractice;
