import React, { useState } from 'react';
import { Plus, Link2, Music, Clock, Users, ChevronRight, Sparkles } from 'lucide-react';
import './CollabPage.css';

const CollabPage = ({ onBack, currentProject, openCreateProject }) => {
  const [projectCode, setProjectCode] = useState('');

  const recentProjects = [
    { id: 1, name: 'Midnight Melody', time: '2h ago', members: 3, color: '#7c3aed' },
    { id: 2, name: 'Summer Vibes', time: '1d ago', members: 5, color: '#06b6d4' },
    { id: 3, name: 'Acoustic Session', time: '3d ago', members: 2, color: '#10b981' }
  ];

  return (
    <div className="collab-page">
      {/* Hero Section */}
      <div className="collab-hero">
        <div className="hero-icon">
          <Sparkles size={32} />
        </div>
        <h1 className="hero-title">Collaborate</h1>
        <p className="hero-subtitle">Create music together in real-time</p>
      </div>

      {/* Actions */}
      <div className="collab-actions">
        {/* Create Project */}
        <button className="action-card create" onClick={openCreateProject}>
          <div className="action-icon">
            <Plus size={24} />
          </div>
          <div className="action-text">
            <span className="action-title">New Project</span>
            <span className="action-desc">Start fresh</span>
          </div>
        </button>

        {/* Join Project */}
        <div className="action-card join">
          <div className="action-icon join-icon">
            <Link2 size={24} />
          </div>
          <div className="action-text">
            <span className="action-title">Join Project</span>
            <span className="action-desc">Enter code</span>
          </div>
        </div>
      </div>

      {/* Join Input */}
      <div className="join-section">
        <div className="join-input-wrapper">
          <input
            type="text"
            className="join-input"
            placeholder="Enter project code..."
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
            maxLength={8}
          />
          <button 
            className="join-btn"
            disabled={projectCode.length < 4}
          >
            Join
          </button>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="recent-section">
        <h2 className="section-title">Recent</h2>
        <div className="recent-list">
          {recentProjects.map((project) => (
            <div key={project.id} className="recent-card">
              <div className="project-avatar" style={{ background: project.color }}>
                <Music size={18} color="white" />
              </div>
              <div className="project-details">
                <h3 className="project-name">{project.name}</h3>
                <div className="project-meta">
                  <span><Clock size={12} /> {project.time}</span>
                  <span><Users size={12} /> {project.members}</span>
                </div>
              </div>
              <ChevronRight size={18} className="arrow" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollabPage;
