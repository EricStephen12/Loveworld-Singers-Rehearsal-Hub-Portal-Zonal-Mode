import React from 'react';

const EditPlaylistView = ({
  closeEditPlaylist,
  isCreatingPlaylist,
  editingPlaylist,
  addMoreSongs,
  deleteSongFromPlaylist
}) => {
  return (
    <div className="edit-playlist">
      {/* Header */}
      <div className="edit-playlist-header">
        <button className="close-btn" onClick={closeEditPlaylist}>
          ✕
        </button>
        <h1 className="edit-playlist-title">
          {isCreatingPlaylist ? 'Create New Playlist' : 'Edit Playlist'}
        </h1>
        <div className="header-spacer"></div>
      </div>

      {/* Main Content */}
      <div className="edit-playlist-content">
        {/* Playlist Name Input */}
        <div className="playlist-name-section">
          <div className="input-container">
            <input
              type="text"
              id="playlist-name"
              className="playlist-name-input"
              placeholder="Playlist Name"
              defaultValue={isCreatingPlaylist ? '' : editingPlaylist?.title || 'Chill Morning'}
            />
            <label htmlFor="playlist-name" className="floating-label">
              Playlist Name
            </label>
          </div>
        </div>

        {/* Song List */}
        <div className="edit-song-list">
          {(editingPlaylist?.songs || [
            { id: 1, title: "Golden Hour", artist: "Kacey Musgraves", albumArt: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVvmOevBZjJ6ONt3x5mxHWOoeIoI_yveN1BYktVd9mEYnX6lCrurl6-il0ZVf9h4c2DQxnJo9RJ_AKtlJJao4-jGCqfwMiXySSOwyTTJLf3riyj9KnbHJAXe1bezsZ_sOs8t-imtWo7cn0rMSkf6mFd7qvv-g4r5f5qUxeY7prBzOeCNWfedHhqNxyUaqXs4OmAXcTWMLWRWQbBpJzVmads4Jne-wNdx1qFPZ9qxvtGV3pQDHdI3AAMxQhaFXuKL72AdY9-kTAzSM" },
            { id: 2, title: "Sunday Morning", artist: "Maroon 5", albumArt: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWBRRk68RL-B-gT3X7MCfGIEyVjeN_OJCfgl8gdBmcIc5Di5xSBe0Rew-pwKu3iNCcrJ-cK78r-6uWXSEK3yPMcto8X9XR_gPhZxTQxW8UhdEhs2Lyzml0xGdG9h7sbRhowafX_uAIfjoc4XDHhD8s13E8QQ_z9oBBaNJfX7YQ7Ctdp4O-NS73xfrYGXH1x7IA7ah9CO_oA2b5SSA_rkiA75HsPzVat9WqWnZyOcItHhuFMTQ_gqWRNQLZlf7K4Oc6N4GeEB0Y5vI" },
            { id: 3, title: "Better Together", artist: "Jack Johnson", albumArt: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-btr1KPlfVj2etJLnwqZTBfcov2ky6H_umZxbeGT9j435HD54y7Te9KmrNyg8BhmbTy4xn5X3bD7RiMi5hQ2XHYA-iHNhXCi60jK0HxyWqy-G-WNOHjhc-EF-3E6YtJZwvqL156MjJFv7jcM5YTsSB_V_8wYX9iDaAznRKos0OAkHQFCvm463ml_pU6jjXgM5konGpxwpQkHjH4E-A9jhGMF2uq7hTXMCkFvhcJUthfr8qD7jgYH2LlFFWyhmnW-SCltp5POrZzM" },
            { id: 4, title: "Free Fallin'", artist: "Tom Petty", albumArt: "https://lh3.googleusercontent.com/aida-public/AB6AXuDT8P9ogh34glER409jqb6sX6H-Hdru7Io91-d5anQzEp7hsRSExNsfWuarqfmOz56BSkegurBFLbCkBGFh8RtH4mx7V1G485TpDbeGPdC_-a_ycoXDZpt3DQfDNyimVLtlCouveq_JtzFvXsCnyX0PcnPtmdQvmEddQTQzJHqdkyroR_v5zJNcwl5b1q_2UDUKmgIwkhzXtchDcOQuFg2MkS-J-Wt4uJ9hj2zaCAJyX6qsQ7qSzpU4qFX1jBg9_pQmISGiA77uZqU" }
          ]).map((song) => (
            <div key={song.id} className="edit-song-item">
              <div className="edit-song-thumbnail">
                <img src={song.albumArt} alt={song.title} className="edit-song-album-art" />
              </div>
              <div className="edit-song-details">
                <div className="edit-song-title">{song.title}</div>
                <div className="edit-song-artist">{song.artist}</div>
              </div>
              <button
                className="remove-song-btn"
                onClick={() => deleteSongFromPlaylist(song.id)}
              >
                🗑️
              </button>
              <button className="drag-handle-btn">
                ⋮⋮
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="edit-playlist-footer">
        <button className="add-more-songs-btn" onClick={addMoreSongs}>
          <span className="add-icon">+</span>
          Add More Songs
        </button>
      </div>
    </div>
  );
};

export default EditPlaylistView;
