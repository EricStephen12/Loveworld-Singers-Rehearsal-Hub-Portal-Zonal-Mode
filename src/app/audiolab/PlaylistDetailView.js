import React from 'react';

const PlaylistDetailView = ({ 
  selectedPlaylist,
  playSong,
  removeSongFromPlaylist
}) => {
  return (
    <div className="playlist-detail">
      {/* Playlist Header */}
      <div className="playlist-header">
        <div className="playlist-cover">
          <div className={`playlist-cover-image ${selectedPlaylist?.type}`}>
            {selectedPlaylist?.type === 'choir' ? '👥' : '🎵'}
          </div>
        </div>
        <div className="playlist-header-info">
          <h2 className="playlist-detail-title">{selectedPlaylist?.title}</h2>
          <p className="playlist-description">{selectedPlaylist?.description}</p>
          <div className="playlist-stats">
            <span className="playlist-song-count">{selectedPlaylist?.songs?.length || 0} songs</span>
            <span className="playlist-duration">
              {selectedPlaylist?.songs?.reduce((total, song) => {
                const [minutes, seconds] = song.duration.split(':').map(Number);
                return total + minutes * 60 + seconds;
              }, 0) ? 
                Math.floor(selectedPlaylist.songs.reduce((total, song) => {
                  const [minutes, seconds] = song.duration.split(':').map(Number);
                  return total + minutes * 60 + seconds;
                }, 0) / 60) + ' min' : '0 min'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Playlist Actions */}
      <div className="playlist-actions">
        <button className="play-all-btn">
          <span className="play-icon">▶️</span>
          Play All
        </button>
        <button className="shuffle-btn">
          <span className="shuffle-icon">🔀</span>
          Shuffle
        </button>
      </div>

      {/* Songs List */}
      <div className="playlist-songs">
        {selectedPlaylist?.songs?.map((song, index) => (
          <div key={song.id} className="playlist-song-item">
            <div className="song-number">{index + 1}</div>
            <div className="song-thumbnail">
              <img src={song.albumArt} alt={song.title} className="song-album-art" />
            </div>
            <div className="song-details">
              <div className="song-title">{song.title}</div>
              <div className="song-artist">{song.artist}</div>
            </div>
            <div className="song-duration">{song.duration}</div>
            <div className="song-actions">
              <button className="play-btn" onClick={() => playSong(song)}>▶️</button>
              <button className="remove-btn" onClick={() => removeSongFromPlaylist(selectedPlaylist.id, song.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistDetailView;
