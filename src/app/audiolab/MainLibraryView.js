import React, { useState } from 'react';
import { Search, Play, MoreVertical, Plus, Music, Users, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
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

  // Sample songs data
  const sampleSongs = [
    {
      id: 1,
      title: "Dancing in the Moonlight",
      artist: "The Midnight",
      genre: "Synthwave",
      duration: "3:45",
      color: "#FFB347"
    },
    {
      id: 2,
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      genre: "Rock",
      duration: "8:02",
      color: "#87CEEB"
    },
    {
      id: 3,
      title: "Lost in Translation",
      artist: "Indie Pop",
      genre: "Alternative",
      duration: "4:12",
      color: "#DDA0DD"
    },
    {
      id: 4,
      title: "Electric Dreams",
      artist: "Synth Pop",
      genre: "Electronic",
      duration: "5:28",
      color: "#98FB98"
    }
  ];

  // Filter songs based on search query
  const filteredSongs = sampleSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterBy === 'All' || song.genre === filterBy;
    return matchesSearch && matchesFilter;
  });

  // Sort songs
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    if (sortBy === 'Alphabetical') return a.title.localeCompare(b.title);
    if (sortBy === 'Duration') return a.duration.localeCompare(b.duration);
    return 0;
  });

  return (
    <div className="song-library-container">
      {/* Fixed Header */}
      <div className="library-header">
        {/* Continue from Last Session Button */}
        <button className="continue-btn" onClick={continueLastRehearsal}>
          <Play size={16} fill="white" />
          <span>Continue Last Session</span>
        </button>

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
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Filter and Sort */}
            <div className="filter-sort-row">
              <div className="filter-group">
                <Filter size={14} />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Genres</option>
                  <option value="Rock">Rock</option>
                  <option value="Pop">Pop</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Synthwave">Synthwave</option>
                  <option value="Alternative">Alternative</option>
                </select>
              </div>
              <div className="sort-group">
                <ArrowUpDown size={14} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="Alphabetical">A-Z</option>
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
              {sortedSongs.length > 0 ? (
                sortedSongs.map((song) => (
                  <div key={song.id} className="song-item" onClick={() => playSong(song)}>
                    <div className="song-album-art" style={{ backgroundColor: song.color }}>
                      <Music size={20} color="white" />
                    </div>
                    <div className="song-details">
                      <h3 className="song-title">{song.title}</h3>
                      <p className="song-artist">{song.artist}</p>
                      <p className="song-meta">{song.genre} • {song.duration}</p>
                    </div>
                    <div className="song-actions">
                      <button className="play-button" onClick={(e) => { e.stopPropagation(); playSong(song); }}>
                        <Play size={14} fill="white" />
                      </button>
                      <button className="more-button" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Music size={40} />
                  <p>No songs found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="playlists-container">
              {/* Create New Playlist Button */}
              <button className="create-playlist-btn" onClick={openCreatePlaylist}>
                <Plus size={18} />
                <span>Create New Playlist</span>
              </button>

              {/* Playlists List */}
              <div className="playlists-list">
                {playlists && playlists.map((playlist) => (
                  <div key={playlist.id} className="playlist-item" onClick={() => openPlaylistDetail(playlist)}>
                    <div className="playlist-cover">
                      <div className="playlist-cover-image">
                        {playlist.type === 'choir' ? <Users size={20} /> : <Music size={20} />}
                      </div>
                    </div>
                    <div className="playlist-info">
                      <h3 className="playlist-title">{playlist.title}</h3>
                      <p className="playlist-description">{playlist.description}</p>
                      <span className="playlist-count">{playlist.songs?.length || 0} songs</span>
                    </div>
                    <button className="playlist-more" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical size={16} />
                    </button>
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
