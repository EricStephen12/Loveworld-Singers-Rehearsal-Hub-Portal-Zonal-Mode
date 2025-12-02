import React from 'react';

const ShareView = () => {
  return (
    <div className="share-view">
      <div className="share-header">
        <h2>Share Your Music</h2>
        <p>Share your recordings and collaborate with others</p>
      </div>
      
      <div className="share-content">
        <div className="share-section">
          <h3>Recent Recordings</h3>
          <div className="recordings-list">
            <div className="recording-item">
              <div className="recording-info">
                <h4>My Latest Track</h4>
                <p>Recorded 2 hours ago</p>
              </div>
              <button className="share-btn">Share</button>
            </div>
            <div className="recording-item">
              <div className="recording-info">
                <h4>Harmony Practice</h4>
                <p>Recorded yesterday</p>
              </div>
              <button className="share-btn">Share</button>
            </div>
          </div>
        </div>
        
        <div className="share-section">
          <h3>Collaboration Invites</h3>
          <div className="invites-list">
            <div className="invite-item">
              <div className="invite-info">
                <h4>Join "Summer Vibes" Project</h4>
                <p>Invited by Sarah M.</p>
              </div>
              <div className="invite-actions">
                <button className="accept-btn">Accept</button>
                <button className="decline-btn">Decline</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="share-section">
          <h3>Social Features</h3>
          <div className="social-actions">
            <button className="social-btn">
              <span>📱</span>
              Share to Social Media
            </button>
            <button className="social-btn">
              <span>📧</span>
              Send via Email
            </button>
            <button className="social-btn">
              <span>🔗</span>
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareView;
