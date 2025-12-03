import React, { useState } from 'react';
import { Mic, Activity, Music2, TrendingUp, Trophy, Target, ChevronRight } from 'lucide-react';
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
    setIsKaraokeActive(false);
    setIsWarmupActive(false);
    setIsPitchTrainingActive(false);
    setIsStrengthActive(false);

    switch(mode) {
      case 'karaoke':
        setIsKaraokeActive(true);
        setShowKaraokeMode(true);
        if (onKaraokeStateChange) onKaraokeStateChange(true);
        break;
      case 'warmup':
        setIsWarmupActive(true);
        let progress = warmupProgress;
        const interval = setInterval(() => {
          progress += 5;
          setWarmupProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            setIsWarmupActive(false);
          }
        }, 300);
        break;
      case 'pitch':
        setIsPitchTrainingActive(true);
        setTimeout(() => setIsPitchTrainingActive(false), 3000);
        break;
      case 'strength':
        setIsStrengthActive(true);
        setTimeout(() => setIsStrengthActive(false), 3000);
        break;
      default:
        break;
    }
  };

  const handleChallengeAttempt = () => {
    const success = Math.random() > 0.5;
    setTimeout(() => {
      if (success) {
        setSessionsCompleted(prev => Math.min(prev + 1, 5));
        setWeeklyProgress(prev => Math.min(prev + 10, 100));
      }
    }, 1000);
  };

  const handleBackFromKaraoke = () => {
    setShowKaraokeMode(false);
    setIsKaraokeActive(false);
    if (onKaraokeStateChange) onKaraokeStateChange(false);
  };

  if (showKaraokeMode) {
    return <KaraokeMode onBack={handleBackFromKaraoke} />;
  }

  const practiceCards = [
    {
      id: 'karaoke',
      title: 'Karaoke Mode',
      description: 'Sing along with lyrics and instrumentals',
      icon: Mic,
      color: '#7c3aed',
      bgColor: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      isActive: isKaraokeActive
    },
    {
      id: 'warmup',
      title: 'Vocal Warm-Up',
      description: 'Prepare your voice with guided exercises',
      icon: Activity,
      color: '#f59e0b',
      bgColor: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      isActive: isWarmupActive,
      progress: warmupProgress
    },
    {
      id: 'pitch',
      title: 'Pitch Training',
      description: 'Improve your pitch accuracy',
      icon: Music2,
      color: '#10b981',
      bgColor: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      isActive: isPitchTrainingActive
    },
    {
      id: 'strength',
      title: 'Vocal Strength',
      description: 'Build power and extend your range',
      icon: TrendingUp,
      color: '#ef4444',
      bgColor: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      isActive: isStrengthActive
    }
  ];

  return (
    <div className="practice-page">
      <div className="practice-content">
        {/* Header */}
        <div className="practice-header">
          <h1 className="practice-title">Practice Your Voice</h1>
          <p className="practice-subtitle">Choose a mode to train, warm up, or perform</p>
        </div>

        {/* Practice Modes Grid */}
        <div className="practice-grid">
          {practiceCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className={`practice-card ${card.isActive ? 'active' : ''}`}
                onClick={() => handlePracticeStart(card.id)}
              >
                <div className="card-icon-wrapper" style={{ background: card.bgColor }}>
                  <IconComponent size={24} color="white" />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                  {card.progress !== undefined && (
                    <div className="card-progress">
                      <div className="progress-bar-small">
                        <div 
                          className="progress-fill-small" 
                          style={{ width: `${card.progress}%`, background: card.color }}
                        />
                      </div>
                      <span className="progress-text">{card.progress}%</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={18} className="card-arrow" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress-section">
        {/* Weekly Progress */}
        <div className="progress-card">
          <div className="progress-icon-wrapper">
            <Trophy size={20} color="#7c3aed" />
          </div>
          <div className="progress-info">
            <h3 className="progress-title">Weekly Progress</h3>
            <p className="progress-subtitle">{sessionsCompleted}/5 sessions completed</p>
          </div>
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-progress">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle-fill"
                strokeDasharray={`${weeklyProgress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="progress-percentage">{weeklyProgress}%</span>
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="challenge-card">
          <div className="challenge-icon-wrapper">
            <Target size={20} color="#ef4444" />
          </div>
          <div className="challenge-info">
            <h3 className="challenge-title">Daily Challenge</h3>
            <p className="challenge-subtitle">Hit a perfect high C!</p>
          </div>
          <button className="challenge-btn" onClick={handleChallengeAttempt}>
            Try Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
