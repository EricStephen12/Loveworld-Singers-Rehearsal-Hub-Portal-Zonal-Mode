import React, { useState, useEffect } from 'react';
import './CollabPage.css';

const CollabPage = ({ onBack, currentProject, openCreateProject }) => {
  const [projectCode, setProjectCode] = useState('');

  // Mouse tracking for card glow effects
  useEffect(() => {
    const handleMouseMove = (e, card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const cards = document.querySelectorAll('.card-glow');
    cards.forEach(card => {
      const mouseMoveHandler = (e) => handleMouseMove(e, card);
      card.addEventListener('mousemove', mouseMoveHandler);

      return () => {
        card.removeEventListener('mousemove', mouseMoveHandler);
      };
    });
  }, []);

  const handleCreateProject = () => {
    openCreateProject();
  };

  const handleJoinProject = () => {
    if (projectCode.trim()) {
      console.log('Joining project with code:', projectCode);
      // Add your join project logic here
    }
  };

  const handleRecentProject = (projectName) => {
    console.log('Opening recent project:', projectName);
    // Add your recent project logic here
  };

  return (
    <div className="collab-container">
      {/* Header */}
      <header className="collab-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-icons">arrow_back_ios_new</span>
        </button>
        <h1 className="header-title">Collaboration</h1>
        <div style={{ width: '3rem' }}></div> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="collab-main">
        <div className="collab-section">
          {/* Create New Project Card */}
          <div className="card-glow project-card animate-fadeIn">
            <div className="card-header">
              <div className="icon-container create-icon">
                <span className="material-icons">add_circle</span>
              </div>
              <h2 className="card-title">Create New Project</h2>
            </div>
            <p className="card-description">
              Start a new session and invite friends to bring your ideas to life.
            </p>
            <button className="btn-glow primary-button" onClick={handleCreateProject}>
              <span className="shine"></span>
              <span className="button-text">Create Project</span>
            </button>
          </div>

          {/* Join Existing Project Card */}
          <div className="card-glow project-card animate-fadeIn animate-fadeIn-delay-1">
            <div className="card-header">
              <div className="icon-container join-icon">
                <span className="material-icons">link</span>
              </div>
              <h2 className="card-title">Join Existing Project</h2>
            </div>
            <p className="card-description">
              Enter a project code or use an invitation link to jump in.
            </p>
            <div className="join-input-group">
              <input
                type="text"
                className="project-code-input"
                placeholder="Enter code..."
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinProject()}
              />
              <button className="btn-glow join-button" onClick={handleJoinProject}>
                <span className="shine"></span>
                <span className="button-text">Join</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Collaborations */}
        <div className="recent-section animate-fadeIn animate-fadeIn-delay-2">
          <h3 className="section-title">Recent Collaborations</h3>
          <div className="recent-projects">
            <div
              className="card-glow recent-project-card animate-fadeIn animate-fadeIn-delay-3"
              onClick={() => handleRecentProject('Midnight Melody')}
            >
              <div className="project-icon music-icon">
                <span className="material-icons">music_note</span>
              </div>
              <div className="project-info">
                <p className="project-name">Midnight Melody</p>
                <p className="project-time">Updated 2 hours ago</p>
              </div>
              <div className="collaborators">
                <img
                  className="avatar"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  alt="User avatar"
                />
                <img
                  className="avatar"
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
                  alt="User avatar"
                />
                <div className="avatar-count">+2</div>
              </div>
              <span className="material-icons chevron">chevron_right</span>
            </div>

            <div
              className="card-glow recent-project-card animate-fadeIn animate-fadeIn-delay-4"
              onClick={() => handleRecentProject('City Lights Beat')}
            >
              <div className="project-icon beat-icon">
                <span className="material-icons">graphic_eq</span>
              </div>
              <div className="project-info">
                <p className="project-name">City Lights Beat</p>
                <p className="project-time">Updated yesterday</p>
              </div>
              <div className="collaborators">
                <img
                  className="avatar"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
                  alt="User avatar"
                />
                <img
                  className="avatar"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
                  alt="User avatar"
                />
              </div>
              <span className="material-icons chevron">chevron_right</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CollabPage;
