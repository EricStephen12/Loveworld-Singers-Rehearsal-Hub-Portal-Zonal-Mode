'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, Mic, SlidersHorizontal, Users, ChevronLeft, User, 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  X, ChevronDown, MoreVertical
} from 'lucide-react';
import './App.css';
import './TrackCategories.css';
import './responsive.css';
// @ts-ignore
import PracticePage from './PracticePage';
// @ts-ignore
import CollabPage from './CollabPage';
// @ts-ignore
import MainLibraryView from './MainLibraryView';
// @ts-ignore
import VocalLeadView from './VocalLeadView';
// @ts-ignore
import HarmonyView from './HarmonyView';
// @ts-ignore
import DrumsView from './DrumsView';
// @ts-ignore
import ChatView from './ChatView';
// @ts-ignore
import PlaylistDetailView from './PlaylistDetailView';
// @ts-ignore
import LiveSessionView from './LiveSessionView';
// @ts-ignore
import MusicProductionView from './MusicProductionView';
// @ts-ignore
import EditPlaylistView from './EditPlaylistView';
// @ts-ignore
import ShareView from './ShareView';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
  genre?: string;
  key?: string;
  tempo?: number;
  albumArt?: string;
  color?: string;
}

interface Playlist {
  id: number;
  title: string;
  description: string;
  type: string;
  songs: Song[];
}

interface Message {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  avatar: string;
  isVoiceNote?: boolean;
  duration?: number;
}

interface Collaborator {
  id: number;
  name: string;
  avatar: string;
  color: string;
  online: boolean;
  editing: string | null;
}

interface SessionParticipant {
  id: number;
  name: string;
  avatar: string;
  status: string;
  instrument: string;
}

interface Track {
  id: number;
  name: string;
  type: string;
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  recordArmed: boolean;
  effects: string[];
  level: number;
  waveform: number[];
}

interface Project {
  id: number;
  name: string;
  createdAt: Date;
  participants: string[];
}

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  time: string;
}

type ViewType = 'main' | 'playlist-detail' | 'edit-playlist' | 'practice' | 'vocal-lead' | 'harmony' | 'drums' | 'collab' | 'chat' | 'live-session' | 'music-production' | 'share';
type RepeatMode = 'off' | 'all' | 'one';

export default function AudioLabPage() {
  const [activeTab, setActiveTab] = useState('Songs');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState(false);
  const [selectedTrackType, setSelectedTrackType] = useState<string | null>(null);
  const [isKaraokeActive, setIsKaraokeActive] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: 'Alex', message: "Hey everyone! Ready for today's session?", timestamp: '2:30 PM', isOwn: false, avatar: '👨‍🎤' },
    { id: 2, user: 'Maria', message: "Yes! I've been practicing the harmony parts", timestamp: '2:32 PM', isOwn: false, avatar: '👩‍🎤' },
    { id: 3, user: 'You', message: "Perfect! Let's start with the chorus", timestamp: '2:33 PM', isOwn: true, avatar: '🎵' }
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingVoiceNote, setPlayingVoiceNote] = useState<number | null>(null);
  const [voiceNoteProgress, setVoiceNoteProgress] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [collaborators] = useState<Collaborator[]>([
    { id: 1, name: 'Alex', avatar: '🎸', color: '#FF6B6B', online: true, editing: 'Track 1' },
    { id: 2, name: 'Sarah', avatar: '🎹', color: '#4ECDC4', online: true, editing: null },
    { id: 3, name: 'Mike', avatar: '🥁', color: '#45B7D1', online: false, editing: null }
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, user: 'Alex', message: 'Great session today!', time: '2:30 PM' },
    { id: 2, user: 'Sarah', message: 'Love the new chord progression', time: '2:32 PM' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [sessionParticipants] = useState<SessionParticipant[]>([
    { id: 1, name: 'Alex', avatar: '👨‍🎤', status: 'active', instrument: 'Vocals' },
    { id: 2, name: 'Maria', avatar: '👩‍🎤', status: 'active', instrument: 'Harmony' },
    { id: 3, name: 'You', avatar: '🎵', status: 'active', instrument: 'Lead' }
  ]);
  const [sessionDuration] = useState(0);
  const [isSessionRecording, setIsSessionRecording] = useState(false);
  const [viewerCount] = useState(12);

  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [projectTempo] = useState(120);
  const [timeSignature] = useState('4/4');
  const [isRecordingTrack, setIsRecordingTrack] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [isPlaying_Production, setIsPlaying_Production] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);

  const [tracks, setTracks] = useState<Track[]>([
    { id: 1, name: 'Vocal Lead', type: 'audio', color: '#E0BBE4', volume: 0.8, pan: 0, muted: false, solo: false, recordArmed: false, effects: [], level: 75, waveform: [20, 45, 60, 30, 80, 55, 40, 70, 35, 90, 25, 65, 50, 85, 40, 75, 30, 60, 45, 80] },
    { id: 2, name: 'Harmony', type: 'audio', color: '#B19CD9', volume: 0.7, pan: -0.2, muted: false, solo: false, recordArmed: false, effects: [], level: 60, waveform: [15, 35, 50, 25, 70, 45, 30, 60, 25, 75, 20, 55, 40, 70, 30, 65, 25, 50, 35, 70] },
    { id: 3, name: 'Drums', type: 'audio', color: '#9B59B6', volume: 0.9, pan: 0, muted: false, solo: false, recordArmed: false, effects: [], level: 85, waveform: [30, 60, 80, 40, 95, 70, 50, 85, 45, 100, 35, 75, 60, 90, 50, 80, 40, 70, 55, 85] }
  ]);

  const songs: Song[] = [
    { id: 1, title: 'Amazing Grace', artist: 'Traditional', duration: '3:45', genre: 'Spiritual', key: 'G Major', tempo: 72 },
    { id: 2, title: 'Hallelujah', artist: 'Leonard Cohen', duration: '4:32', genre: 'Folk', key: 'C Major', tempo: 60 },
    { id: 3, title: 'Ave Maria', artist: 'Franz Schubert', duration: '5:18', genre: 'Classical', key: 'Bb Major', tempo: 54 }
  ];

  const playlists: Playlist[] = [
    { id: 1, title: 'Sunday Service', description: 'Songs for Sunday worship', type: 'choir', songs: [songs[0], songs[2]] },
    { id: 2, title: 'Practice Session', description: 'Weekly practice repertoire', type: 'practice', songs: [songs[1]] }
  ];

  const genres = [
    { name: 'Pop', icon: '🎵' },
    { name: 'Rock', icon: '🎸' },
    { name: 'Jazz', icon: '🎷' },
    { name: 'Classical', icon: '🎼' },
    { name: 'Electronic', icon: '🎛️' },
    { name: 'Folk', icon: '🪕' }
  ];


  // Event handlers
  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setIsPlayerVisible(true);
    setCurrentTime(0);
    setDuration(song.duration ? parseInt(song.duration.split(':')[0]) * 60 + parseInt(song.duration.split(':')[1]) : 180);
  };

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const toggleShuffle = () => setIsShuffleOn(!isShuffleOn);
  
  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const hidePlayer = () => setIsPlayerVisible(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openPlaylistDetail = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentView('playlist-detail');
  };

  const goBackToMain = () => {
    setCurrentView('main');
    setSelectedPlaylist(null);
  };

  const goToPractice = () => setCurrentView('practice');
  const goBackFromPractice = () => setCurrentView('main');
  const goToVocalLead = () => { setCurrentView('vocal-lead'); setSelectedTrackType('vocal-lead'); };
  const goToHarmony = () => { setCurrentView('harmony'); setSelectedTrackType('harmony'); };
  const goToDrums = () => { setCurrentView('drums'); setSelectedTrackType('drums'); };
  const goBackFromTrackView = () => { setCurrentView('main'); setSelectedTrackType(null); };

  const openCreatePlaylist = () => {
    setIsCreatingPlaylist(true);
    setCurrentView('edit-playlist');
    setPlaylistTitle('');
    setPlaylistDescription('');
    setSelectedSongs([]);
  };

  const closeEditPlaylist = () => {
    setCurrentView('main');
    setIsCreatingPlaylist(false);
    setPlaylistTitle('');
    setPlaylistDescription('');
    setSelectedSongs([]);
  };

  const savePlaylist = () => {
    const newPlaylist: Playlist = {
      id: Date.now(),
      title: playlistTitle,
      description: playlistDescription,
      type: 'custom',
      songs: selectedSongs
    };
    if (isCreatingPlaylist) {
      setUserPlaylists([...userPlaylists, newPlaylist]);
    }
    closeEditPlaylist();
  };

  const removeSongFromPlaylist = (songId: number) => {
    if (selectedPlaylist) {
      const updatedSongs = selectedPlaylist.songs.filter(song => song.id !== songId);
      setSelectedPlaylist({ ...selectedPlaylist, songs: updatedSongs });
    }
  };

  const goToCollab = () => setCurrentView('collab');
  const goBackFromCollab = () => {
    if (currentProject) setCurrentProject(null);
    else setCurrentView('main');
  };

  const openCreateProject = () => { setIsCreatingProject(true); setProjectName(''); };
  const closeCreateProject = () => { setIsCreatingProject(false); setProjectName(''); };
  
  const createProject = () => {
    if (projectName.trim()) {
      const newProject: Project = {
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

  const continueLastRehearsal = () => setCurrentView('practice');
  const goToChat = () => setCurrentView('chat');
  const goBackFromChat = () => setCurrentView('main');
  const goToLiveSession = () => { setCurrentView('live-session'); setIsLiveSessionActive(true); };
  const goBackFromLiveSession = () => { setCurrentView('main'); setIsLiveSessionActive(false); };
  const goToMusicProduction = () => setCurrentView('music-production');
  const goBackFromMusicProduction = () => setCurrentView('main');
  const goToShare = () => setCurrentView('share');
  const goBackFromShare = () => setCurrentView('main');

  const startRecording = () => setIsRecordingTrack(true);
  const stopRecording = () => setIsRecordingTrack(false);
  
  const toggleTrackMute = (trackId: number) => {
    setTracks(tracks.map(track => track.id === trackId ? { ...track, muted: !track.muted } : track));
  };
  
  const toggleTrackSolo = (trackId: number) => {
    setTracks(tracks.map(track => track.id === trackId ? { ...track, solo: !track.solo } : track));
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
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

  const handleVoiceNotePlay = (noteId: number) => {
    if (playingVoiceNote === noteId) {
      setPlayingVoiceNote(null);
      setVoiceNoteProgress(0);
    } else {
      setPlayingVoiceNote(noteId);
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
      const message: ChatMessage = {
        id: chatMessages.length + 1,
        user: 'You',
        message: newChatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, message]);
      setNewChatMessage('');
    }
  };

  const startRecording_Chat = () => {
    setIsRecording(true);
    setRecordingDuration(0);
  };

  const stopRecording_Chat = () => {
    setIsRecording(false);
    if (recordingDuration > 0) {
      const voiceMessage: Message = {
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

  const openFullScreenPlayer = () => setIsFullScreenPlayer(true);
  const closeFullScreenPlayer = () => setIsFullScreenPlayer(false);


  return (
    <div className="app" style={{ width: '100%', maxWidth: '100%' }}>
      <div className="app-container" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Navigation Stack Header - Each view has its own header */}
        <header className="header">
          <div className="header-left">
            {currentView !== 'main' && (
              <button className="back-btn" onClick={
                currentView === 'playlist-detail' ? goBackToMain :
                currentView === 'edit-playlist' ? closeEditPlaylist :
                currentView === 'practice' ? goBackFromPractice :
                currentView === 'chat' ? goBackFromChat :
                currentView === 'collab' ? goBackFromCollab :
                currentView === 'live-session' ? goBackFromLiveSession :
                currentView === 'music-production' ? goBackFromMusicProduction :
                currentView === 'share' ? goBackFromShare :
                (currentView === 'vocal-lead' || currentView === 'harmony' || currentView === 'drums') ? goBackFromTrackView :
                goBackToMain
              }>
                <ChevronLeft size={20} />
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
               currentView === 'music-production' ? 'Music Studio' :
               currentView === 'share' ? 'Share' :
               'Song Library'}
            </h1>
          </div>
          <div className="header-right">
            <button className="profile-btn">
              <User size={20} />
            </button>
          </div>
        </header>

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
            // @ts-ignore - Legacy JS component
            <CollabPage
              onBack={goBackFromCollab}
              currentProject={currentProject}
              openCreateProject={openCreateProject}
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
            // @ts-ignore - Legacy JS component with different props
            <LiveSessionView 
              goBackFromLiveSession={goBackFromLiveSession}
              viewerCount={viewerCount}
              liveSessionDuration={sessionDuration}
              formatLiveTime={(s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`}
              isMicOn={true}
              toggleMic={() => {}}
              isMonitorOn={true}
              toggleMonitor={() => {}}
              endLiveSession={goBackFromLiveSession}
              isLiveRecording={isSessionRecording}
              toggleLiveRecording={() => setIsSessionRecording(!isSessionRecording)}
            />
          ) : currentView === 'music-production' ? (
            // @ts-ignore - Legacy JS component
            <MusicProductionView
              goBackFromMusicProduction={goBackFromMusicProduction}
              projectTempo={projectTempo}
              isPlaying={isPlaying_Production}
              timeSignature={timeSignature}
              isLooping={isLooping}
              toggleLoop={() => setIsLooping(!isLooping)}
              toggleStudioPlayback={() => setIsPlaying_Production(!isPlaying_Production)}
              isStudioRecording={isRecordingTrack}
              toggleStudioRecording={startRecording}
            />
          ) : currentView === 'edit-playlist' ? (
            // @ts-ignore - Legacy JS component
            <EditPlaylistView 
              closeEditPlaylist={closeEditPlaylist}
              isCreatingPlaylist={isCreatingPlaylist}
              editingPlaylist={null}
              addMoreSongs={() => {}}
              deleteSongFromPlaylist={() => {}}
            />
          ) : (
            <ShareView />
          )}
        </div>


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
                <button className="btn-secondary" onClick={closeCreateProject}>Cancel</button>
                <button className="btn-primary" onClick={createProject} disabled={!projectName.trim()}>Create Project</button>
              </div>
            </div>
          </div>
        )}

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
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button className="player-btn" onClick={hidePlayer}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="player-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`}}></div>
              </div>
              <div className="progress-time">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {isFullScreenPlayer && currentSong && (
          <div className="fullscreen-player">
            <div className="fullscreen-header">
              <button className="fullscreen-back" onClick={closeFullScreenPlayer}>
                <ChevronDown size={24} />
              </button>
              <h3>Now Playing</h3>
              <button className="fullscreen-options">
                <MoreVertical size={20} />
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
                  <div className="fullscreen-progress-fill" style={{width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`}}></div>
                </div>
                <div className="fullscreen-time">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <div className="fullscreen-controls">
                <button className={`fullscreen-control-btn ${isShuffleOn ? 'active' : ''}`} onClick={toggleShuffle}>
                  <Shuffle size={20} />
                </button>
                <button className="fullscreen-control-btn">
                  <SkipBack size={24} />
                </button>
                <button className="fullscreen-play-btn" onClick={togglePlayPause}>
                  {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                </button>
                <button className="fullscreen-control-btn">
                  <SkipForward size={24} />
                </button>
                <button className={`fullscreen-control-btn ${repeatMode !== 'off' ? 'active' : ''}`} onClick={toggleRepeat}>
                  {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {currentView !== 'music-production' && !isKaraokeActive && (
        <nav className="bottom-nav">
          <button className={`nav-item ${currentView === 'main' ? 'active' : ''}`} onClick={goBackToMain}>
            <Music size={20} />
            <span className="nav-label">Library</span>
          </button>
          <button className={`nav-item ${currentView === 'practice' ? 'active' : ''}`} onClick={goToPractice}>
            <Mic size={20} />
            <span className="nav-label">Practice</span>
          </button>
          <button className="nav-item" onClick={goToMusicProduction}>
            <SlidersHorizontal size={20} />
            <span className="nav-label">Studio</span>
          </button>
          <button className={`nav-item ${currentView === 'collab' ? 'active' : ''}`} onClick={goToCollab}>
            <Users size={20} />
            <span className="nav-label">Collab</span>
          </button>
        </nav>
      )}
    </div>
  );
}