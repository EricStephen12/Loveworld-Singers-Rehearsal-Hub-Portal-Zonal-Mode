import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Maximize2, Minimize2, Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import './KaraokeMode.css';

const KaraokeMode = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180);
  const [pitchAccuracy, setPitchAccuracy] = useState(85);
  const [score, setScore] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [performanceRating, setPerformanceRating] = useState('Great!');
  const [streak, setStreak] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const [hitNotes, setHitNotes] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const animationRef = useRef();

  const lyrics = [
    { time: 5, text: "Welcome to your karaoke session" },
    { time: 10, text: "Sing along with confidence and style" },
    { time: 15, text: "Let your voice shine bright tonight" },
    { time: 20, text: "Every note you sing matters" },
    { time: 25, text: "Feel the rhythm in your heart" },
    { time: 30, text: "This is your moment to shine" },
    { time: 35, text: "Sing like nobody's listening" },
    { time: 40, text: "Your voice is unique and beautiful" },
    { time: 45, text: "Keep going, you're doing great" },
    { time: 50, text: "The music flows through you" }
  ];

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
        
        setPitchAccuracy(prev => {
          const variation = (Math.random() - 0.5) * 10;
          const newAccuracy = Math.max(60, Math.min(100, prev + variation));
          
          setTotalNotes(prevTotal => prevTotal + 1);
          if (newAccuracy > 80) {
            setHitNotes(prevHit => prevHit + 1);
            setStreak(prevStreak => prevStreak + 1);
          } else if (newAccuracy < 70) {
            setStreak(0);
          }

          if (newAccuracy >= 95) setPerformanceRating('Perfect!');
          else if (newAccuracy >= 85) setPerformanceRating('Excellent!');
          else if (newAccuracy >= 75) setPerformanceRating('Good!');
          else if (newAccuracy >= 65) setPerformanceRating('Keep trying!');
          else setPerformanceRating('Practice more!');

          return newAccuracy;
        });

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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, duration, pitchAccuracy, streak]);

  useEffect(() => {
    const activeLine = lyrics.findIndex((lyric, index) => 
      currentTime >= lyric.time && currentTime < (lyrics[index + 1]?.time || duration)
    );
    if (activeLine !== -1) setCurrentLine(activeLine);
  }, [currentTime, duration]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    if (pitchAccuracy >= 90) return '#10b981';
    if (pitchAccuracy >= 80) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="karaoke-container">
      {/* Header */}
      <header className="karaoke-header">
        <button className="icon-btn" onClick={onBack}>
          <ChevronLeft size={22} />
        </button>
        <div className="song-info">
          <h1 className="song-title">Practice Session</h1>
          <p className="artist-name">Vocal Training</p>
        </div>
        <button className="icon-btn" onClick={toggleFullScreen}>
          {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </header>

      {/* Main Content */}
      <div className="karaoke-main">
        {/* Progress */}
        <div className="progress-row">
          <span className="time">{formatTime(currentTime)}</span>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="time">{formatTime(duration)}</span>
        </div>

        {/* Lyrics */}
        <div className="lyrics-area">
          {lyrics.map((lyric, index) => (
            <p
              key={index}
              className={`lyric ${
                index === currentLine ? 'active' :
                index < currentLine ? 'past' : 'upcoming'
              }`}
            >
              {lyric.text}
            </p>
          ))}
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat">
            <span className="stat-value">{score.toLocaleString()}</span>
            <span className="stat-label">Score</span>
          </div>
          <div className="stat">
            <span className="stat-value" style={{ color: getScoreColor() }}>
              {Math.round(pitchAccuracy)}%
            </span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat">
            <span className="stat-value">{streak}</span>
            <span className="stat-label">Streak</span>
          </div>
        </div>

        {/* Performance */}
        <div className="performance" style={{ color: getScoreColor() }}>
          {performanceRating}
        </div>
      </div>

      {/* Controls */}
      <div className="karaoke-controls">
        <button 
          className="control-btn"
          onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
        >
          <RotateCcw size={22} />
        </button>
        <button 
          className={`play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} fill="white" />}
        </button>
        <button 
          className="control-btn"
          onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
        >
          <RotateCw size={22} />
        </button>
      </div>
    </div>
  );
};

export default KaraokeMode;
