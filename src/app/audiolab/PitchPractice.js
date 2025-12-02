import React, { useState, useEffect } from 'react';
import './PracticeMode.css';

const PitchPractice = ({ onBack }) => {
  // Player controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(125); // 2:05
  const [duration, setDuration] = useState(480); // 8:00
  const [volume, setVolume] = useState(0.8);
  const [pitch, setPitch] = useState(0);
  
  // Stats state
  const [score, setScore] = useState(3150);
  const [accuracy, setAccuracy] = useState(94);
  const [streak, setStreak] = useState(22);
  const [hitRate, setHitRate] = useState(91);
  const [progress, setProgress] = useState(67);

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
    <div className="practice-mode-page pitch-theme">
      {/* Header */}
      <div className="practice-mode-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-icons">close</span>
        </button>
        <h1 className="practice-mode-title">Pitch Training</h1>
        <button className="profile-button">
          <span className="material-icons">tune</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="practice-mode-content">
        {/* Progress Bar */}
        <div className="main-progress-container">
          <div className="progress-bar-main">
            <div 
              className="progress-fill-main pitch-progress" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text pitch-text">{progress}%</div>
        </div>

        {/* Exercise Info */}
        <div className="song-info">
          <h2 className="song-title">Perfect Pitch Challenge</h2>
          <p className="song-artist">Ear Training Session</p>
          <div className="song-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Motivational Text */}
        <div className="motivation-text">
          <p>🎼 Train your musical ear</p>
          <p>🎯 Hit every note perfectly</p>
          <p>🔊 Listen and match the tone</p>
          <p>🎵 Develop perfect pitch</p>
          <p>🌟 Your accuracy is improving</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card pitch-card">
            <div className="stat-label">SCORE</div>
            <div className="stat-value">{score.toLocaleString()}</div>
          </div>
          <div className="stat-card pitch-card">
            <div className="stat-label">ACCURACY</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
          <div className="stat-card pitch-card">
            <div className="stat-label">STREAK</div>
            <div className="stat-value">{streak}</div>
          </div>
          <div className="stat-card pitch-card">
            <div className="stat-label">HIT RATE</div>
            <div className="stat-value">{hitRate}%</div>
          </div>
        </div>

        {/* Achievement Button */}
        <div className="achievement-button-container">
          <button className="achievement-button pitch-achievement">
            🎯 PERFECT PITCH!
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
          
          <button className="play-button pitch-play" onClick={togglePlay}>
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
                  className="slider-fill pitch-slider" 
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

export default PitchPractice;
