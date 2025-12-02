import React, { useState } from 'react';
import './SongLibrary.css';

const MainLibraryView = ({
  activeTab,
  setActiveTab,
  genres,
  songs,
  playSong,
  playlists,
  openCreatePlaylist,
  openPlaylistDetail,
  continueLastRehearsal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Alphabetical');
  const [filterBy, setFilterBy] = useState('All');

  // Sample songs data matching the design
  const sampleSongs = [
    {
      id: 1,
      title: "Dancing in the Moonlight",
      artist: "The Midnight",
      genre: "Synthwave",
      duration: "3:45",
      albumArt: "🌙",
      color: "#FFB347"
    },
    {
      id: 2,
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      genre: "Rock",
      duration: "8:02",
      albumArt: "🎸",
      color: "#87CEEB"
    },
    {
      id: 3,
      title: "Lost in Translation",
      artist: "Indie Pop",
      genre: "Alternative",
      duration: "4:12",
      albumArt: "🎭",
      color: "#DDA0DD"
    },
    {
      id: 4,
      title: "Electric Dreams",
      artist: "Synth Pop",
      genre: "Electronic",
      duration: "5:28",
      albumArt: "⚡",
      color: "#98FB98"
    }
  ];

  return (
    <div className="song-library-container">
      {/* Fixed Header */}
      <div className="library-header">
        {/* Continue from Last Session Button */}
        <div className="continue-session">
          <button className="continue-btn" onClick={continueLastRehearsal}>
            <span className="continue-icon">▶</span>
            <span className="continue-text">CONTINUE FROM THE LAST SESSION</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="library-tabs">
          <button
            className={`tab-button ${activeTab === 'Songs' ? 'active' : ''}`}
            onClick={() => setActiveTab('Songs')}
          >
            Songs
          </button>
          <button
            className={`tab-button ${activeTab === 'Playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('Playlists')}
          >
            Playlists
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="library-content">
        {activeTab === 'Songs' && (
          <>
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by title, song, voice part..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Filter and Sort */}
            <div className="filter-sort-container">
              <div className="filter-section">
                <span className="filter-label">Filter</span>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  <option value="Rock">Rock</option>
                  <option value="Pop">Pop</option>
                  <option value="Electronic">Electronic</option>
                </select>
              </div>
              <div className="sort-section">
                <span className="sort-label">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="Alphabetical">Alphabetical</option>
                  <option value="Recent">Recent</option>
                  <option value="Duration">Duration</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Songs List */}
        <div className="songs-list-container">
          {activeTab === 'Songs' ? (
            <div className="songs-list">
              {sampleSongs.map((song) => (
                <div key={song.id} className="song-item" onClick={() => playSong(song)}>
                  <div className="song-album-art" style={{ backgroundColor: song.color }}>
                    <span className="album-art-emoji">{song.albumArt}</span>
                  </div>
                  <div className="song-details">
                    <h3 className="song-title">{song.title}</h3>
                    <p className="song-artist">{song.artist}</p>
                    <p className="song-genre">{song.genre} • {song.duration}</p>
                  </div>
                  <div className="song-actions">
                    <button className="play-button">
                      <span className="play-icon">▶</span>
                    </button>
                    <button className="more-button">
                      <span className="more-icon">⋮</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="playlists-container">
              {/* Create New Playlist Button */}
              <div className="create-playlist-section pinned">
                <button className="create-playlist-btn" onClick={openCreatePlaylist}>
                  <span style={{fontSize: '18px'}}>+</span>
                  Create New Playlist
                </button>
              </div>

              {/* Playlists List */}
              <div className="playlists-list">
                {playlists && playlists.map((playlist) => (
                  <div key={playlist.id} className="playlist-item" onClick={() => openPlaylistDetail(playlist)}>
                    <div className="playlist-cover">
                      <div className={`playlist-cover-image ${playlist.type}`}>
                        {playlist.type === 'choir' ? '👥' : '🎵'}
                      </div>
                    </div>
                    <div className="playlist-info">
                      <h3 className="playlist-title">{playlist.title}</h3>
                      <p className="playlist-description">{playlist.description}</p>
                      <span className="playlist-count">{playlist.songs?.length || 0} songs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
      </div>
    </div>
  );
};

export default MainLibraryView;
