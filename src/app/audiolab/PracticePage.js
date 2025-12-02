import React, { useState } from 'react';
import './PracticePage.css';
import KaraokeMode from './KaraokeMode';

const PracticePage = ({ onBack, onKaraokeStateChange }) => {
  const [showKaraokeMode, setShowKaraokeMode] = useState(false);
  const [warmupProgress, setWarmupProgress] = useState(45);
  const [weeklyProgress, setWeeklyProgress] = useState(60);
  const [sessionsCompleted, setSessionsCompleted] = useState(3);
  const [isKaraokeActive, setIsKaraokeActive] = useState(false);
  const [isWarmupActive, setIsWarmupActive] = useState(false);
  const [isPitchTrainingActive, setIsPitchTrainingActive] = useState(false);
  const [isStrengthActive, setIsStrengthActive] = useState(false);

  const handlePracticeStart = (mode) => {
    console.log('🎤 Practice button clicked for mode:', mode);

    // Reset all active states
    setIsKaraokeActive(false);
    setIsWarmupActive(false);
    setIsPitchTrainingActive(false);
    setIsStrengthActive(false);

    // Set the active mode
    switch(mode) {
      case 'karaoke':
        console.log('🎤 Setting Karaoke Mode active...');
        setIsKaraokeActive(true);
        setShowKaraokeMode(true);
        if (onKaraokeStateChange) onKaraokeStateChange(true);
        console.log('🎤 Karaoke Mode should now be visible');
        break;
      case 'warmup':
        setIsWarmupActive(true);
        console.log('🎯 Starting Vocal Warm-Up - Preparing exercises...');
        let progress = warmupProgress;
        const interval = setInterval(() => {
          progress += 5;
          setWarmupProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            alert('✅ Warm-up complete! Your voice is ready for practice.');
          }
        }, 300);
        break;
      case 'pitch':
        setIsPitchTrainingActive(true);
        console.log('🎼 Starting Pitch Training - Calibrating audio...');
        setTimeout(() => {
          alert('🎯 Pitch training ready! Listen to the tone and match your voice.');
        }, 500);
        break;
      case 'strength':
        setIsStrengthActive(true);
        console.log('💪 Starting Vocal Strength Training - Loading exercises...');
        setTimeout(() => {
          alert('🏋️ Vocal strength training activated! Follow the breathing exercises.');
        }, 500);
        break;
      default:
        console.log(`Starting ${mode} practice mode`);
    }
  };

  const handleChallengeAttempt = () => {
    console.log('🎯 Attempting daily challenge - Hit a perfect high C!');
    const success = Math.random() > 0.5;
    setTimeout(() => {
      if (success) {
        alert('🎉 Amazing! You hit the perfect high C! Challenge completed!');
        setSessionsCompleted(prev => Math.min(prev + 1, 5));
        setWeeklyProgress(prev => Math.min(prev + 10, 100));
      } else {
        alert('🎵 Good attempt! Keep practicing - you\'re getting closer to that perfect high C!');
      }
    }, 1000);
  };

  const handleBackFromKaraoke = () => {
    setShowKaraokeMode(false);
    setIsKaraokeActive(false);
    if (onKaraokeStateChange) onKaraokeStateChange(false);
  };

  // Show Karaoke Mode if active
  if (showKaraokeMode) {
    console.log('🎤 Rendering Karaoke Mode component');
    return <KaraokeMode onBack={handleBackFromKaraoke} />;
  }

  console.log('🎤 Rendering Practice Page, showKaraokeMode:', showKaraokeMode);

  return (
    <div className="practice-page">
      {/* Upper Content Container */}
      <div className="practice-content">
        {/* Header */}
        <div className="practice-header">
          <div className="header-spacer"></div>
          <div className="header-content">
            <h1 className="practice-title">Practice Your Voice</h1>
            <p className="practice-subtitle">Choose a mode to train, warm up, or perform.</p>
          </div>
        </div>

        {/* Practice Modes Grid */}
        <div className="practice-grid">
          {/* Karaoke Mode */}
          <div
            className={`practice-card karaoke-card ${isKaraokeActive ? 'active' : ''}`}
            onClick={() => {
              console.log('🎤 Karaoke card clicked!');
              handlePracticeStart('karaoke');
            }}
            style={{ cursor: 'pointer' }}
          >
          <div className="card-visual karaoke-visual">
            <span className="material-icon">🎤</span>
          </div>
          <div className="card-content">
            <div className="card-header">
              <span className="card-icon">🎤</span>
              <h3 className="card-title">Karaoke Mode</h3>
            </div>
            <p className="card-description">Sing along with instrumentals and lyrics.</p>
            <button
              className={`practice-btn ${isKaraokeActive ? 'active' : ''}`}
              onClick={() => handlePracticeStart('karaoke')}
            >
              {isKaraokeActive ? 'ACTIVE' : 'START PRACTICE'}
            </button>
          </div>
          </div>

          {/* Vocal Warm-Up */}
          <div className={`practice-card warmup-card ${isWarmupActive ? 'active' : ''}`}>
          <div className="card-visual warmup-visual">
            <div className="pulse-outer"></div>
            <div className="pulse-inner"></div>
          </div>
          <div className="card-content">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <h3 className="card-title">Vocal Warm-Up</h3>
            </div>
            <p className="card-description">Prepare your voice with guided exercises.</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${warmupProgress}%` }}
              ></div>
            </div>
            <button
              className={`practice-btn ${isWarmupActive ? 'active' : ''}`}
              onClick={() => handlePracticeStart('warmup')}
            >
              {isWarmupActive ? 'WARMING UP...' : 'START WARM-UP'}
            </button>
          </div>
          </div>

          {/* Pitch & Ear Training */}
          <div className={`practice-card pitch-card ${isPitchTrainingActive ? 'active' : ''}`}>
          <div className="card-visual pitch-visual">
            <svg className="wave-svg" fill="none" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 25C12.3333 45.1667 29.8 51.5 40 40C51.5 27 60.5 5.5 75 25C89.5 44.5 98 45 98 45"
                stroke="#6A0DAD"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="card-content">
            <div className="card-header">
              <span className="card-icon">🎼</span>
              <h3 className="card-title">Pitch & Ear Training</h3>
            </div>
            <p className="card-description">Train your pitch and improve vocal accuracy.</p>
            <button
              className={`practice-btn ${isPitchTrainingActive ? 'active' : ''}`}
              onClick={() => handlePracticeStart('pitch')}
            >
              {isPitchTrainingActive ? 'TRAINING...' : 'START TRAINING'}
            </button>
          </div>
          </div>

          {/* Vocal Strength & Range */}
          <div className={`practice-card strength-card ${isStrengthActive ? 'active' : ''}`}>
          <div className="card-visual strength-visual">
            <div className="strength-bars">
              <div className="bar bar-1"></div>
              <div className="bar bar-2"></div>
              <div className="bar bar-3"></div>
              <div className="bar bar-4"></div>
            </div>
          </div>
          <div className="card-content">
            <div className="card-header">
              <span className="card-icon">📈</span>
              <h3 className="card-title">Vocal Strength & Range</h3>
            </div>
            <p className="card-description">Build vocal power and increase your range.</p>
            <button
              className={`practice-btn ${isStrengthActive ? 'active' : ''}`}
              onClick={() => handlePracticeStart('strength')}
            >
              {isStrengthActive ? 'WORKING OUT...' : 'START WORKOUT'}
            </button>
          </div>
        </div>
        </div>
      </div>
      {/* End Upper Content Container */}

      {/* Progress Section - Centered */}
      <div className="progress-section">
        {/* Weekly Progress */}
        <div className="progress-card">
          <div className="progress-info">
            <h3 className="progress-title">Weekly Progress</h3>
            <p className="progress-subtitle">{sessionsCompleted}/5 sessions completed this week</p>
          </div>
          <div className="progress-circle">
            <span className="progress-percentage">{weeklyProgress}%</span>
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="challenge-card">
          <div className="challenge-info">
            <h3 className="challenge-title">Daily Challenge</h3>
            <p className="challenge-subtitle">Hit a perfect high C!</p>
          </div>
          <button
            className="challenge-btn"
            onClick={handleChallengeAttempt}
          >
            ATTEMPT
          </button>
        </div>
      </div>
      {/* End Progress Section */}
    </div>
  );
};

export default PracticePage;
