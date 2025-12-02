import React, { useState, useEffect } from 'react';
import './PracticeMode.css';

const StrengthPractice = ({ onBack }) => {
  // Player controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(180); // 3:00
  const [duration, setDuration] = useState(720); // 12:00
  const [volume, setVolume] = useState(0.75);
  const [pitch, setPitch] = useState(0);
  
  // Stats state
  const [score, setScore] = useState(4200);
  const [accuracy, setAccuracy] = useState(89);
  const [streak, setStreak] = useState(18);
  const [hitRate, setHitRate] = useState(86);
  const [progress, setProgress] = useState(55);

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
    <div className="practice-mode-page strength-theme">
      {/* Header */}
      <div className="practice-mode-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-icons">close</span>
        </button>
        <h1 className="practice-mode-title">Vocal Strength</h1>
        <button className="profile-button">
          <span className="material-icons">fitness_center</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="practice-mode-content">
        {/* Progress Bar */}
        <div className="main-progress-container">
          <div className="progress-bar-main">
            <div 
              className="progress-fill-main strength-progress" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text strength-text">{progress}%</div>
        </div>

        {/* Exercise Info */}
        <div className="song-info">
          <h2 className="song-title">Power & Range Builder</h2>
          <p className="song-artist">Vocal Strength Training</p>
          <div className="song-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Motivational Text */}
        <div className="motivation-text">
          <p>💪 Build vocal power</p>
          <p>🚀 Expand your range</p>
          <p>🔥 Push your limits</p>
          <p>⚡ Feel the strength grow</p>
          <p>🏆 You're getting stronger</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card strength-card">
            <div className="stat-label">SCORE</div>
            <div className="stat-value">{score.toLocaleString()}</div>
          </div>
          <div className="stat-card strength-card">
            <div className="stat-label">ACCURACY</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
          <div className="stat-card strength-card">
            <div className="stat-label">STREAK</div>
            <div className="stat-value">{streak}</div>
          </div>
          <div className="stat-card strength-card">
            <div className="stat-label">HIT RATE</div>
            <div className="stat-value">{hitRate}%</div>
          </div>
        </div>

        {/* Achievement Button */}
        <div className="achievement-button-container">
          <button className="achievement-button strength-achievement">
            💪 VOCAL POWERHOUSE!
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
          
          <button className="play-button strength-play" onClick={togglePlay}>
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
                  className="slider-fill strength-slider" 
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

export default StrengthPractice;
