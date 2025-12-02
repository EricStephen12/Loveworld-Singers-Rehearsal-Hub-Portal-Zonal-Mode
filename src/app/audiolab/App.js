import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import './TrackCategories.css';
import PracticePage from './PracticePage';
import CollabPage from './CollabPage';
import MainLibraryView from './MainLibraryView';
import VocalLeadView from './VocalLeadView';
import HarmonyView from './HarmonyView';
import DrumsView from './DrumsView';
import ChatView from './ChatView';
import PlaylistDetailView from './PlaylistDetailView';
import LiveSessionView from './LiveSessionView';
import MusicProductionView from './MusicProductionView';
import EditPlaylistView from './EditPlaylistView';
import ShareView from './ShareView';

const App = () => {
  const [activeTab, setActiveTab] = useState('Songs');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [currentView, setCurrentView] = useState('main'); // 'main', 'playlist-detail', 'edit-playlist', 'practice', 'vocal-lead', 'harmony', 'drums'
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState(false);
  const [selectedTrackType, setSelectedTrackType] = useState(null);
  const [isKaraokeActive, setIsKaraokeActive] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Alex',
      message: 'Hey everyone! Ready for today\'s session?',
      timestamp: '2:30 PM',
      isOwn: false,
      avatar: '👨‍🎤'
    },
    {
      id: 2,
      user: 'Maria',
      message: 'Yes! I\'ve been practicing the harmony parts',
      timestamp: '2:32 PM',
      isOwn: false,
      avatar: '👩‍🎤'
    },
    {
      id: 3,
      user: 'You',
      message: 'Perfect! Let\'s start with the chorus',
      timestamp: '2:33 PM',
      isOwn: true,
      avatar: '🎵'
    }
  ]);

  // Voice note state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingVoiceNote, setPlayingVoiceNote] = useState(null);
  const [voiceNoteProgress, setVoiceNoteProgress] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Music Production UI state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Alex', avatar: '🎸', color: '#FF6B6B', online: true, editing: 'Track 1' },
    { id: 2, name: 'Sarah', avatar: '🎹', color: '#4ECDC4', online: true, editing: null },
    { id: 3, name: 'Mike', avatar: '🥁', color: '#45B7D1', online: false, editing: null }
  ]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Alex', message: 'Great session today!', time: '2:30 PM' },
    { id: 2, user: 'Sarah', message: 'Love the new chord progression', time: '2:32 PM' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Live session state
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [sessionParticipants, setSessionParticipants] = useState([
    { id: 1, name: 'Alex', avatar: '👨‍🎤', status: 'active', instrument: 'Vocals' },
    { id: 2, name: 'Maria', avatar: '👩‍🎤', status: 'active', instrument: 'Harmony' },
    { id: 3, name: 'You', avatar: '🎵', status: 'active', instrument: 'Lead' }
  ]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isSessionRecording, setIsSessionRecording] = useState(false);
  const [viewerCount, setViewerCount] = useState(12);

  // Edit playlist state
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  // Project creation state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [currentProject, setCurrentProject] = useState(null);

  // Music production state
  const [projectTempo, setProjectTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [isRecordingTrack, setIsRecordingTrack] = useState(false);
  const [recordingTrack, setRecordingTrack] = useState(null);
  const [currentPlayPosition, setCurrentPlayPosition] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [isPlaying_Production, setIsPlaying_Production] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Track data
  const [tracks, setTracks] = useState([
    {
      id: 1,
      name: 'Vocal Lead',
      type: 'audio',
      color: '#E0BBE4',
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      recordArmed: false,
      effects: [],
      level: 75,
      waveform: [20, 45, 60, 30, 80, 55, 40, 70, 35, 90, 25, 65, 50, 85, 40, 75, 30, 60, 45, 80]
    },
    {
      id: 2,
      name: 'Harmony',
      type: 'audio',
      color: '#B19CD9',
      volume: 0.7,
      pan: -0.2,
      muted: false,
      solo: false,
      recordArmed: false,
      effects: [],
      level: 60,
      waveform: [15, 35, 50, 25, 70, 45, 30, 60, 25, 75, 20, 55, 40, 70, 30, 65, 25, 50, 35, 70]
    },
    {
      id: 3,
      name: 'Drums',
      type: 'audio',
      color: '#9B59B6',
      volume: 0.9,
      pan: 0,
      muted: false,
      solo: false,
      recordArmed: false,
      effects: [],
      level: 85,
      waveform: [30, 60, 80, 40, 95, 70, 50, 85, 45, 100, 35, 75, 60, 90, 50, 80, 40, 70, 55, 85]
    }
  ]);

  // AI and music theory state
  const [selectedGenre, setSelectedGenre] = useState('Pop');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [projectKey, setProjectKey] = useState('C');
  const [suggestedChords, setSuggestedChords] = useState(['C', 'Am', 'F', 'G']);

  // Metronome state
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [metronomeVolume, setMetronomeVolume] = useState(0.5);
  const [clickSound, setClickSound] = useState('classic');

  // Audio effects and mixing
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [availableEffects, setAvailableEffects] = useState([
    'Reverb', 'Delay', 'Chorus', 'Compressor', 'EQ', 'Distortion'
  ]);

  // Sample data
  const genres = [
    { name: 'Pop', icon: '🎵' },
    { name: 'Rock', icon: '🎸' },
    { name: 'Jazz', icon: '🎷' },
    { name: 'Classical', icon: '🎼' },
    { name: 'Electronic', icon: '🎛️' },
    { name: 'Folk', icon: '🪕' }
  ];

  const songs = [
    {
      id: 1,
      title: 'Amazing Grace',
      artist: 'Traditional',
      duration: '3:45',
      genre: 'Spiritual',
      key: 'G Major',
      tempo: 72
    },
    {
      id: 2,
      title: 'Hallelujah',
      artist: 'Leonard Cohen',
      duration: '4:32',
      genre: 'Folk',
      key: 'C Major',
      tempo: 60
    },
    {
      id: 3,
      title: 'Ave Maria',
      artist: 'Franz Schubert',
      duration: '5:18',
      genre: 'Classical',
      key: 'Bb Major',
      tempo: 54
    }
  ];

  const playlists = [
    {
      id: 1,
      title: 'Sunday Service',
      description: 'Songs for Sunday worship',
      type: 'choir',
      songs: [songs[0], songs[2]]
    },
    {
      id: 2,
      title: 'Practice Session',
      description: 'Weekly practice repertoire',
      type: 'practice',
      songs: [songs[1]]
    }
  ];

  // Event handlers
  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setIsPlayerVisible(true);
    setCurrentTime(0);
    setDuration(song.duration ? parseInt(song.duration.split(':')[0]) * 60 + parseInt(song.duration.split(':')[1]) : 180);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const hidePlayer = () => {
    setIsPlayerVisible(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openPlaylistDetail = (playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentView('playlist-detail');
  };

  const goBackToMain = () => {
    setCurrentView('main');
    setSelectedPlaylist(null);
  };

  const goToPractice = () => {
    setCurrentView('practice');
  };

  const goBackFromPractice = () => {
    setCurrentView('main');
  };

  // Track type navigation functions
  const goToVocalLead = () => {
    setCurrentView('vocal-lead');
    setSelectedTrackType('vocal-lead');
  };

  const goToHarmony = () => {
    setCurrentView('harmony');
    setSelectedTrackType('harmony');
  };

  const goToDrums = () => {
    setCurrentView('drums');
    setSelectedTrackType('drums');
  };

  const goBackFromTrackView = () => {
    setCurrentView('main');
    setSelectedTrackType(null);
  };

  const openCreatePlaylist = () => {
    setIsCreatingPlaylist(true);
    setCurrentView('edit-playlist');
    setPlaylistTitle('');
    setPlaylistDescription('');
    setSelectedSongs([]);
  };

  const getAllPlaylists = () => {
    return [...playlists, ...userPlaylists];
  };

  const closeEditPlaylist = () => {
    setCurrentView('main');
    setIsCreatingPlaylist(false);
    setEditingPlaylist(null);
    setPlaylistTitle('');
    setPlaylistDescription('');
    setSelectedSongs([]);
  };

  const savePlaylist = () => {
    const newPlaylist = {
      id: Date.now(),
      title: playlistTitle,
      description: playlistDescription,
      type: 'custom',
      songs: selectedSongs
    };
    
    if (isCreatingPlaylist) {
      setUserPlaylists([...userPlaylists, newPlaylist]);
    } else {
      // Update existing playlist logic here
    }
    
    closeEditPlaylist();
  };

  const openEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setIsCreatingPlaylist(false);
    setCurrentView('edit-playlist');
    setPlaylistTitle(playlist.title);
    setPlaylistDescription(playlist.description);
    setSelectedSongs(playlist.songs);
  };

  const removeSongFromPlaylist = (songId) => {
    if (selectedPlaylist) {
      const updatedSongs = selectedPlaylist.songs.filter(song => song.id !== songId);
      setSelectedPlaylist({
        ...selectedPlaylist,
        songs: updatedSongs
      });
    }
  };

  const goToCollab = () => {
    setCurrentView('collab');
  };

  const goBackFromCollab = () => {
    // If there's an active project, clear it and stay in collab view
    if (currentProject) {
      setCurrentProject(null);
    } else {
      // Otherwise go back to main view
      setCurrentView('main');
    }
  };

  // Project creation functions
  const openCreateProject = () => {
    setIsCreatingProject(true);
    setProjectName('');
  };

  const closeCreateProject = () => {
    setIsCreatingProject(false);
    setProjectName('');
  };

  const createProject = () => {
    if (projectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: projectName.trim(),
        createdAt: new Date(),
        participants: []
      };
      setCurrentProject(newProject);
      setIsCreatingProject(false);
      setCurrentView('collab');
    }
  };

  const continueLastRehearsal = () => {
    // Navigate to the last rehearsal session
    setCurrentView('practice');
  };

  const goToChat = () => {
    setCurrentView('chat');
  };

  const goBackFromChat = () => {
    setCurrentView('main');
  };

  const goToLiveSession = () => {
    setCurrentView('live-session');
    setIsLiveSessionActive(true);
  };

  const goBackFromLiveSession = () => {
    setCurrentView('main');
    setIsLiveSessionActive(false);
  };

  const goToMusicProduction = () => {
    setCurrentView('music-production');
  };

  const goBackFromMusicProduction = () => {
    setCurrentView('main');
  };

  const goToShare = () => {
    setCurrentView('share');
  };

  const goBackFromShare = () => {
    setCurrentView('main');
  };

  // Music production functions
  const toggleMetronome = () => {
    setIsMetronomeOn(!isMetronomeOn);
  };

  const startRecording = (trackId) => {
    setIsRecordingTrack(true);
    setRecordingTrack(trackId);
  };

  const stopRecording = () => {
    setIsRecordingTrack(false);
    setRecordingTrack(null);
  };

  const toggleTrackMute = (trackId) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const toggleTrackSolo = (trackId) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const toggleTrackRecordArm = (trackId) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, recordArmed: !track.recordArmed } : track
    ));
  };

  const addEffectToTrack = (trackId, effect) => {
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { ...track, effects: [...track.effects, effect] }
        : track
    ));
  };

  const removeEffectFromTrack = (trackId, effectIndex) => {
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { ...track, effects: track.effects.filter((_, index) => index !== effectIndex) }
        : track
    ));
  };

  const generateAIBeat = () => {
    setAiGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setAiGenerating(false);
      // Add generated beat to tracks
    }, 2000);
  };

  // Chat functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        avatar: '🎵'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleVoiceNotePlay = (noteId) => {
    if (playingVoiceNote === noteId) {
      setPlayingVoiceNote(null);
      setVoiceNoteProgress(0);
    } else {
      setPlayingVoiceNote(noteId);
      // Simulate voice note playback
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setVoiceNoteProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setPlayingVoiceNote(null);
          setVoiceNoteProgress(0);
        }
      }, 100);
    }
  };

  const sendChatMessage = () => {
    if (newChatMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        user: 'You',
        message: newChatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, message]);
      setNewChatMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startRecording_Chat = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    const interval = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 60) {
          stopRecording_Chat();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
    
    // Store interval ID to clear it later
    window.recordingInterval = interval;
  };

  const stopRecording_Chat = () => {
    setIsRecording(false);
    if (window.recordingInterval) {
      clearInterval(window.recordingInterval);
    }
    
    if (recordingDuration > 0) {
      const voiceMessage = {
        id: messages.length + 1,
        user: 'You',
        message: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        avatar: '🎵',
        isVoiceNote: true,
        duration: recordingDuration
      };
      setMessages([...messages, voiceMessage]);
    }
    
    setRecordingDuration(0);
  };

  const openFullScreenPlayer = () => {
    setIsFullScreenPlayer(true);
  };

  const closeFullScreenPlayer = () => {
    setIsFullScreenPlayer(false);
  };

  return (
    <div className="app">
      <div className="app-container">
        {/* Header - Hidden in music production for full-page experience */}
        {currentView !== 'music-production' && (
          <header className="header">
            <div className="header-left">
              {(isPlayerVisible || currentView === 'playlist-detail' || currentView === 'edit-playlist' || currentView === 'practice' || currentView === 'chat' || currentView === 'vocal-lead' || currentView === 'harmony' || currentView === 'drums') && currentView !== 'live-session' && (
                <button className="back-btn" onClick={
                  currentView === 'playlist-detail' ? goBackToMain :
                  currentView === 'edit-playlist' ? closeEditPlaylist :
                  currentView === 'practice' ? goBackFromPractice :
                  currentView === 'chat' ? goBackFromChat :
                  (currentView === 'vocal-lead' || currentView === 'harmony' || currentView === 'drums') ? goBackFromTrackView :
                  hidePlayer
                }>
                  ←
                </button>
              )}
              <h1 className="title">
                {currentView === 'playlist-detail' ? selectedPlaylist?.title :
                 currentView === 'edit-playlist' ? (isCreatingPlaylist ? 'Create Playlist' : 'Edit Playlist') :
                 currentView === 'practice' ? 'Practice Your Voice' :
                 currentView === 'chat' ? 'Live Chat' :
                 currentView === 'collab' ? 'Collaboration' :
                 currentView === 'vocal-lead' ? 'Vocal Lead' :
                 currentView === 'harmony' ? 'Harmony' :
                 currentView === 'drums' ? 'Drums' :
                 currentView === 'live-session' ? 'Live Session' :
                 currentView === 'share' ? 'Share' :
                 'Song Library'}
              </h1>
            </div>
            <div className="header-right">
              <button className="profile-btn">
                <span className="profile-icon">👤</span>
              </button>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <div className={`main-content ${isPlayerVisible ? 'with-player' : ''}`}>
          {currentView === 'main' ? (
            <MainLibraryView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              genres={genres}
              songs={songs}
              playSong={playSong}
              playlists={playlists}
              openCreatePlaylist={openCreatePlaylist}
              openPlaylistDetail={openPlaylistDetail}
              continueLastRehearsal={continueLastRehearsal}
            />
          ) : currentView === 'vocal-lead' ? (
            <VocalLeadView />
          ) : currentView === 'harmony' ? (
            <HarmonyView />
          ) : currentView === 'drums' ? (
            <DrumsView />
          ) : currentView === 'playlist-detail' ? (
            <PlaylistDetailView 
              selectedPlaylist={selectedPlaylist}
              playSong={playSong}
              removeSongFromPlaylist={removeSongFromPlaylist}
            />
          ) : currentView === 'practice' ? (
            <PracticePage
              onBack={goBackFromPractice}
              onKaraokeStateChange={setIsKaraokeActive}
            />
          ) : currentView === 'collab' ? (
            <CollabPage
              onBack={goBackFromCollab}
              currentProject={currentProject}
              openCreateProject={openCreateProject}
              setCurrentProject={setCurrentProject}
            />
          ) : currentView === 'chat' ? (
            <ChatView 
              goBackFromChat={goBackFromChat}
              messages={messages}
              messagesEndRef={messagesEndRef}
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              playingVoiceNote={playingVoiceNote}
              voiceNoteProgress={voiceNoteProgress}
              handleVoiceNotePlay={handleVoiceNotePlay}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
              startRecording={startRecording_Chat}
              stopRecording={stopRecording_Chat}
            />
          ) : currentView === 'live-session' ? (
            <LiveSessionView 
              goBackFromLiveSession={goBackFromLiveSession}
              isLiveSessionActive={isLiveSessionActive}
              sessionParticipants={sessionParticipants}
              sessionDuration={sessionDuration}
              isSessionRecording={isSessionRecording}
              setIsSessionRecording={setIsSessionRecording}
              viewerCount={viewerCount}
            />
          ) : currentView === 'music-production' ? (
            <MusicProductionView
              goBackFromMusicProduction={goBackFromMusicProduction}
              showAIPanel={showAIPanel}
              setShowAIPanel={setShowAIPanel}
              projectTempo={projectTempo}
              isPlaying={isPlaying_Production}
              timeSignature={timeSignature}
              isLooping={isLooping}
              toggleLoop={setIsLooping}
              toggleStudioPlayback={setIsPlaying_Production}
              isStudioRecording={isRecordingTrack}
              toggleStudioRecording={startRecording}
              tracks={tracks || []}
              selectedTrack={selectedTracks}
              setSelectedTrack={setSelectedTracks}
              updateTrackVolume={setMasterVolume}
              updateTrackPan={() => {}}
              toggleTrackMute={toggleTrackMute}
              toggleTrackSolo={toggleTrackSolo}
              showMixer={showMixer}
              setShowMixer={setShowMixer}
              showCollabPanel={showCollabPanel}
              setShowCollabPanel={setShowCollabPanel}
              collaborators={collaborators || []}
              chatMessages={chatMessages || []}
              newChatMessage={newChatMessage}
              setNewChatMessage={setNewChatMessage}
              sendChatMessage={sendChatMessage}
            />
          ) : currentView === 'edit-playlist' ? (
            <EditPlaylistView 
              isCreatingPlaylist={isCreatingPlaylist}
              playlistTitle={playlistTitle}
              setPlaylistTitle={setPlaylistTitle}
              playlistDescription={playlistDescription}
              setPlaylistDescription={setPlaylistDescription}
              selectedSongs={selectedSongs}
              setSelectedSongs={setSelectedSongs}
              songs={songs}
              savePlaylist={savePlaylist}
              closeEditPlaylist={closeEditPlaylist}
            />
          ) : (
            <ShareView />
          )}
        </div>

        {/* Create Project Modal */}
        {isCreatingProject && (
          <div className="modal-overlay">
            <div className="create-project-modal">
              <div className="modal-header">
                <h2>Create New Project</h2>
                <button className="modal-close" onClick={closeCreateProject}>✕</button>
              </div>
              <div className="modal-content">
                <p>Start a new session and invite friends to bring your ideas to life.</p>
                <div className="input-group">
                  <label htmlFor="projectName">Project Name</label>
                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    maxLength={50}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeCreateProject}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={createProject}
                  disabled={!projectName.trim()}
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Music Player */}
        {isPlayerVisible && currentSong && (
          <div className="music-player">
            <div className="player-main">
              <div className="player-song-info" onClick={openFullScreenPlayer}>
                <div className="player-thumbnail">
                  <div className="player-placeholder-image"></div>
                </div>
                <div className="player-text">
                  <h4 className="player-song-title">{currentSong.title}</h4>
                  <p className="player-song-artist">{currentSong.artist}</p>
                </div>
              </div>
              <div className="player-controls">
                <button className="player-btn" onClick={togglePlayPause}>
                  <span>{isPlaying ? '⏸' : '▶️'}</span>
                </button>
                <button className="player-btn" onClick={hidePlayer}>
                  <span>✕</span>
                </button>
              </div>
            </div>
            <div className="player-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`}}
                ></div>
              </div>
              <div className="progress-time">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Player */}
        {isFullScreenPlayer && currentSong && (
          <div className="fullscreen-player">
            <div className="fullscreen-header">
              <button className="fullscreen-back" onClick={closeFullScreenPlayer}>
                ↓
              </button>
              <h3>Now Playing</h3>
              <button className="fullscreen-options">
                ⋮
              </button>
            </div>

            <div className="fullscreen-content">
              <div className="fullscreen-artwork">
                <div className="fullscreen-placeholder-image"></div>
              </div>

              <div className="fullscreen-info">
                <h2 className="fullscreen-title">{currentSong.title}</h2>
                <p className="fullscreen-artist">{currentSong.artist}</p>
              </div>

              <div className="fullscreen-progress">
                <div className="fullscreen-progress-bar">
                  <div
                    className="fullscreen-progress-fill"
                    style={{width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`}}
                  ></div>
                </div>
                <div className="fullscreen-time">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="fullscreen-controls">
                <button className="fullscreen-control-btn" onClick={toggleShuffle}>
                  <span className={isShuffleOn ? 'active' : ''}>🔀</span>
                </button>
                <button className="fullscreen-control-btn">
                  <span>⏮</span>
                </button>
                <button className="fullscreen-play-btn" onClick={togglePlayPause}>
                  <span>{isPlaying ? '⏸' : '▶️'}</span>
                </button>
                <button className="fullscreen-control-btn">
                  <span>⏭</span>
                </button>
                <button className="fullscreen-control-btn" onClick={toggleRepeat}>
                  <span className={repeatMode !== 'off' ? 'active' : ''}>
                    {repeatMode === 'one' ? '🔂' : '🔁'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Hidden in music production and karaoke for full-page experience */}
      {currentView !== 'music-production' && !isKaraokeActive && (
        <nav className="bottom-nav">
          <button
            className={`nav-item ${currentView === 'main' ? 'active' : ''}`}
            onClick={goBackToMain}
          >
            <span className="nav-icon">🎵</span>
            <span className="nav-label">Song Library</span>
          </button>
          <button
            className={`nav-item ${currentView === 'practice' ? 'active' : ''}`}
            onClick={goToPractice}
          >
            <span className="nav-icon">🎤</span>
            <span className="nav-label">Practice</span>
          </button>
          <button
            className={`nav-item ${currentView === 'music-production' ? 'active' : ''}`}
            onClick={goToMusicProduction}
          >
            <span className="nav-icon">🎛️</span>
            <span className="nav-label">Recording</span>
          </button>
          <button
            className={`nav-item ${currentView === 'collab' ? 'active' : ''}`}
            onClick={goToCollab}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Collab</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
