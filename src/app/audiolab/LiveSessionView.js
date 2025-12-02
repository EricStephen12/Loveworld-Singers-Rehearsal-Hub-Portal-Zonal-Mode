import React from 'react';

const LiveSessionView = ({ 
  goBackFromLiveSession,
  viewerCount,
  liveSessionDuration,
  formatLiveTime,
  isMicOn,
  toggleMic,
  isMonitorOn,
  toggleMonitor,
  endLiveSession,
  isLiveRecording,
  toggleLiveRecording
}) => {
  return (
    <div className="live-session-page">
      {/* Top Overlay */}
      <div className="live-session-top-bar">
        <button className="live-back-btn" onClick={goBackFromLiveSession}>
          ←
        </button>
        <div className="live-session-info">
          <div className="live-indicator">
            <div className="live-dot"></div>
            <span>LIVE</span>
          </div>
          <div className="viewer-count">
            👁 {viewerCount} viewers
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="live-session-content">
        {/* Waveform Visualization */}
        <div className="live-waveform-container">
          <div className="session-info-card">
            <h3>Live Recording Session</h3>
            <div className="session-timer">
              ⏱ {formatLiveTime(liveSessionDuration)}
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="live-controls">
          <button
            className={`control-btn mic-btn ${isMicOn ? 'active' : ''}`}
            onClick={toggleMic}
          >
            {isMicOn ? '🎤' : '🔇'}
          </button>
          <button
            className={`control-btn monitor-btn ${isMonitorOn ? 'active' : ''}`}
            onClick={toggleMonitor}
          >
            🎧
          </button>
          <button className="control-btn effects-btn">
            🎛
          </button>
          <button className="control-btn end-btn" onClick={endLiveSession}>
            ⏹
          </button>
        </div>

        {/* Large Record Button */}
        <button
          className={`live-record-btn ${isLiveRecording ? 'recording' : ''}`}
          onClick={toggleLiveRecording}
        >
          <div className="record-inner"></div>
        </button>
      </div>
    </div>
  );
};

export default LiveSessionView;
