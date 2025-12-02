import React, { useState, useEffect, useRef } from 'react';
import './KaraokeMode.css';

const KaraokeMode = ({ onBack }) => {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180); // 3 minutes sample
  const [pitchAccuracy, setPitchAccuracy] = useState(85);
  const [score, setScore] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [performanceRating, setPerformanceRating] = useState('Great!');
  const [streak, setStreak] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const [hitNotes, setHitNotes] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Refs
  const animationRef = useRef();



  // Sample lyrics with timing (in seconds)
  const lyrics = [
    { time: 5, text: "Welcome to your karaoke session", active: false },
    { time: 10, text: "Sing along with confidence and style", active: false },
    { time: 15, text: "Let your voice shine bright tonight", active: false },
    { time: 20, text: "Every note you sing matters", active: false },
    { time: 25, text: "Feel the rhythm in your heart", active: false },
    { time: 30, text: "This is your moment to shine", active: false },
    { time: 35, text: "Sing like nobody's listening", active: false },
    { time: 40, text: "Your voice is unique and beautiful", active: false },
    { time: 45, text: "Keep going, you're doing great", active: false },
    { time: 50, text: "The music flows through you", active: false }
  ];

  // Animation loop for real-time updates
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
        
        // Update pitch accuracy with realistic variation
        setPitchAccuracy(prev => {
          const variation = (Math.random() - 0.5) * 10;
          const newAccuracy = Math.max(60, Math.min(100, prev + variation));

          // Update performance metrics
          setTotalNotes(prevTotal => prevTotal + 1);
          if (newAccuracy > 80) {
            setHitNotes(prevHit => prevHit + 1);
            setStreak(prevStreak => prevStreak + 1);
          } else if (newAccuracy < 70) {
            setStreak(0);
          }

          // Update performance rating
          if (newAccuracy >= 95) setPerformanceRating('Perfect!');
          else if (newAccuracy >= 85) setPerformanceRating('Excellent!');
          else if (newAccuracy >= 75) setPerformanceRating('Good!');
          else if (newAccuracy >= 65) setPerformanceRating('Keep trying!');
          else setPerformanceRating('Practice more!');

          return newAccuracy;
        });

        // Update score based on pitch accuracy and streak
        setScore(prev => {
          const basePoints = pitchAccuracy > 80 ? 10 : 5;
          const streakBonus = Math.min(streak * 2, 50);
          return prev + basePoints + streakBonus;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration, pitchAccuracy]);

  // Update current lyric line
  useEffect(() => {
    const activeLine = lyrics.findIndex(lyric => 
      currentTime >= lyric.time && currentTime < (lyrics[lyrics.indexOf(lyric) + 1]?.time || duration)
    );
    if (activeLine !== -1) {
      setCurrentLine(activeLine);
    }
  }, [currentTime, lyrics, duration]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isRecording && !isPlaying) {
      setIsRecording(true);
    }
  };



  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    if (pitchAccuracy >= 90) return '#4CAF50';
    if (pitchAccuracy >= 80) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="karaoke-mode-clean">
      {/* Fixed Header */}
      <div className="karaoke-header-fixed">
        <button className="back-btn" onClick={onBack}>
          <span className="material-icons">arrow_back</span>
        </button>
        <div className="song-info">
          <h2 className="song-title">Practice Session</h2>
          <p className="artist-name">Vocal Training</p>
        </div>
        <div className="header-controls">
          <button className="control-btn-header" onClick={toggleFullScreen}>
            <span className="material-icons">
              {isFullScreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Karaoke Content */}
      <div className="karaoke-main-content">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          <div className="time-display">{formatTime(duration)}</div>
        </div>

        {/* Lyrics Display */}
        <div className="lyrics-container">
          <div className="lyrics-scroll">
            {lyrics.map((lyric, index) => (
              <div
                key={index}
                className={`lyric-line ${
                  index === currentLine ? 'active' :
                  index < currentLine ? 'past' : 'upcoming'
                }`}
              >
                {lyric.text}
              </div>
            ))}
          </div>
        </div>

        {/* Score Display */}
        <div className="score-display">
          <div className="score-item">
            <span className="score-label">Score</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Accuracy</span>
            <span className="score-value" style={{ color: getScoreColor() }}>
              {Math.round(pitchAccuracy)}%
            </span>
          </div>
          <div className="score-item">
            <span className="score-label">Streak</span>
            <span className="score-value" style={{ color: streak > 5 ? '#4CAF50' : '#FFF' }}>
              {streak}
            </span>
          </div>
          <div className="score-item">
            <span className="score-label">Hit Rate</span>
            <span className="score-value">
              {totalNotes > 0 ? Math.round((hitNotes / totalNotes) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Performance Feedback */}
        <div className="performance-feedback">
          <span className="performance-text" style={{ color: getScoreColor() }}>
            {performanceRating}
          </span>
        </div>
      </div>

      {/* Fixed Player Controls */}
      <div className="karaoke-controls-fixed">
        <div className="primary-controls">
          <button
            className="control-btn secondary"
            onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
          >
            <span className="material-icons">replay_10</span>
          </button>

          <button
            className={`control-btn primary ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlayPause}
          >
            <span className="material-icons">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            className="control-btn secondary"
            onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
          >
            <span className="material-icons">forward_10</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KaraokeMode;
