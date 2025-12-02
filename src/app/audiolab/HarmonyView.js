import React from 'react';
import './TrackCategories.css';

const HarmonyView = () => {
  return (
    <div className="track-detail-view">
      <div className="track-detail-header">
        <div className="track-info">
          <div className="track-dot" style={{backgroundColor: '#B19CD9'}}></div>
          <div className="track-details">
            <h2 className="track-name">Harmony</h2>
            <p className="track-type">Audio Track</p>
          </div>
        </div>
      </div>
      
      {/* Ace Studio Features for Harmony */}
      <div className="ace-studio-features">
        <div className="feature-section">
          <h3>Harmony Generation</h3>
          <div className="feature-controls">
            <button className="feature-btn">🎼 Auto Harmonize</button>
            <button className="feature-btn">🎵 Chord Progression</button>
            <button className="feature-btn">🎶 Voice Layering</button>
          </div>
        </div>
        
        <div className="feature-section">
          <h3>Voice Blending</h3>
          <div className="feature-controls">
            <button className="feature-btn">🎚️ Mix Balance</button>
            <button className="feature-btn">🔊 Spatial Audio</button>
            <button className="feature-btn">🎭 Vocal Doubling</button>
          </div>
        </div>
        
        <div className="feature-section">
          <h3>AI Assistance</h3>
          <div className="feature-controls">
            <button className="feature-btn">🤖 Smart Suggestions</button>
            <button className="feature-btn">🎯 Pitch Matching</button>
            <button className="feature-btn">⏱️ Timing Sync</button>
          </div>
        </div>
      </div>
      
      {/* Waveform Display */}
      <div className="track-waveform-large">
        <div className="waveform-container-large" style={{background: 'linear-gradient(90deg, #B19CD9, #9A7FB8)'}}>
          <div className="waveform-bars-large">
            {Array.from({length: 100}).map((_, i) => (
              <div key={i} className="waveform-bar-large" style={{height: `${Math.random() * 50 + 15}px`}}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HarmonyView;
