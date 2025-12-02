import React from 'react';
import './TrackCategories.css';

const DrumsView = () => {
  return (
    <div className="track-detail-view">
      <div className="track-detail-header">
        <div className="track-info">
          <div className="track-dot" style={{backgroundColor: '#9B59B6'}}></div>
          <div className="track-details">
            <h2 className="track-name">Drums</h2>
            <p className="track-type">Audio Track</p>
          </div>
        </div>
      </div>
      
      {/* Ace Studio Features for Drums */}
      <div className="ace-studio-features">
        <div className="feature-section">
          <h3>Drum Programming</h3>
          <div className="feature-controls">
            <button className="feature-btn">🥁 Beat Generator</button>
            <button className="feature-btn">🎵 Pattern Library</button>
            <button className="feature-btn">🎛️ Drum Machine</button>
          </div>
        </div>
        
        <div className="feature-section">
          <h3>Rhythm Tools</h3>
          <div className="feature-controls">
            <button className="feature-btn">⏱️ Quantization</button>
            <button className="feature-btn">🎚️ Groove Templates</button>
            <button className="feature-btn">🔄 Loop Builder</button>
          </div>
        </div>
        
        <div className="feature-section">
          <h3>Sound Design</h3>
          <div className="feature-controls">
            <button className="feature-btn">🎛️ Drum Synthesis</button>
            <button className="feature-btn">🔊 Sample Layering</button>
            <button className="feature-btn">🎭 Effects Chain</button>
          </div>
        </div>
      </div>
      
      {/* Waveform Display */}
      <div className="track-waveform-large">
        <div className="waveform-container-large" style={{background: 'linear-gradient(90deg, #9B59B6, #8E44AD)'}}>
          <div className="waveform-bars-large">
            {Array.from({length: 100}).map((_, i) => (
              <div key={i} className="waveform-bar-large" style={{height: `${Math.random() * 70 + 25}px`}}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrumsView;
