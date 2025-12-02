import React from 'react';
import './TrackCategories.css';

const VocalLeadView = () => {
  return (
    <div className="track-detail-view">
      <div className="track-detail-header">
        <div className="track-info">
          <div className="track-dot" style={{backgroundColor: '#E0BBE4'}}></div>
          <div className="track-details">
            <h2 className="track-name">Vocal Lead</h2>
            <p className="track-type">Audio Track</p>
          </div>
        </div>
      </div>
      
      {/* Ace Studio Features */}
      <div className="ace-studio-features">
        <div className="feature-section">
          <h3>AI Voice Synthesis</h3>
          <div className="feature-controls">
            <button className="feature-btn">🎤 Generate Vocals</button>
            <button className="feature-btn">🎵 Voice Cloning</button>
            <button className="feature-btn">🎛️ Voice Effects</button>
          </div>
        </div>
        
        <div className="feature-section">
          <h3>Real-time Processing</h3>
          <div className="feature-controls">
            <button className="feature-btn">🔄 Auto-Tune</button>
            <button className="feature-btn">🎚️ Pitch Correction</button>
            <button className="feature-btn">🎭 Voice Modulation</button>
          </div>
        </div>
        
        <div className="feature-section">
          <h3>Collaboration Tools</h3>
          <div className="feature-controls">
            <button className="feature-btn">👥 Multi-user Editing</button>
            <button className="feature-btn">💬 Voice Comments</button>
            <button className="feature-btn">🔄 Version Control</button>
          </div>
        </div>
      </div>
      
      {/* Waveform Display */}
      <div className="track-waveform-large">
        <div className="waveform-container-large" style={{background: 'linear-gradient(90deg, #E0BBE4, #D8A7CA)'}}>
          <div className="waveform-bars-large">
            {Array.from({length: 100}).map((_, i) => (
              <div key={i} className="waveform-bar-large" style={{height: `${Math.random() * 60 + 20}px`}}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocalLeadView;
