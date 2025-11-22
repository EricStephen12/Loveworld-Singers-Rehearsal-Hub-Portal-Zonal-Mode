'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAudioStore } from '@/lib/audio-store';
import { Upload, User, Play, Pause, FileAudio } from 'lucide-react';
import Orb from '@/components/Orb';

export default function AudioLabUpload() {
  const router = useRouter();
  const { addTrack, tracks, clearAll } = useAudioStore();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      ['.mp3', '.wav', '.m4a', '.aac', '.flac'].some(ext => file.name.toLowerCase().endsWith(ext))
    );

    for (const file of audioFiles) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        await handleFileUpload(file);
      }
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const trackName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      await addTrack(file, trackName);
      
      // Create audio element for playback
      const audio = new Audio(URL.createObjectURL(file));
      setAudioElements(prev => ({
        ...prev,
        [trackName]: audio
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePlayPause = (trackName: string) => {
    const audio = audioElements[trackName];
    if (!audio) return;

    if (playingTrack === trackName) {
      // Pause current track
      audio.pause();
      setPlayingTrack(null);
    } else {
      // Stop any currently playing track
      if (playingTrack && audioElements[playingTrack]) {
        audioElements[playingTrack].pause();
        audioElements[playingTrack].currentTime = 0;
      }
      
      // Play new track
      audio.currentTime = 0;
      audio.play();
      setPlayingTrack(trackName);
      
      // Handle when track ends
      audio.onended = () => {
        setPlayingTrack(null);
      };
    }
  };

  const canStartEditing = tracks.length > 0;

  const startEditing = () => {
    if (canStartEditing) {
      router.push('/pages/audio-lab/editor');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `Recording_${Date.now()}.wav`, { type: 'audio/wav' });
        await handleFileUpload(file);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Store timer reference
      (recorder as any).timer = timer;

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      clearInterval((mediaRecorder as any).timer);
      setIsRecording(false);
      setRecordingTime(0);
      setMediaRecorder(null);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearTracks = () => {
    // Stop any playing audio
    if (playingTrack && audioElements[playingTrack]) {
      audioElements[playingTrack].pause();
    }
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    setPlayingTrack(null);
    setAudioElements({});
    clearAll();
  };

  return (
    <div className="bg-gray-900 min-h-screen overflow-y-auto">
      {/* Content */}
      <div className="relative z-10">
      {/* Header with User Profile - Responsive */}
      <div className="bg-gray-800/90 backdrop-blur-sm shadow-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Audio Lab</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-white">John Doe</div>
                  <div className="text-xs text-gray-400">Producer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">Upload Your Audio</h2>
          <p className="text-base sm:text-lg text-white/80 px-4 drop-shadow">Drag and drop your audio files or click to browse</p>
        </div>

        {/* Big Upload Circle - Responsive */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="relative">
            {/* Subtle Orb Background - Exactly matches upload circle size */}
            <div className="absolute inset-0 w-72 h-72 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] rounded-full opacity-40">
              <Orb
                hoverIntensity={0.15}
                rotateOnHover={true}
                hue={280}
                forceHoverState={false}
              />
            </div>
            
            <div
              className={`relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] border-4 border-dashed rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden backdrop-blur-sm ${
                dragOver
                  ? 'border-purple-500 bg-purple-500/10 scale-105 shadow-2xl'
                  : tracks.length > 0
                  ? 'border-purple-400 bg-purple-400/5 shadow-xl'
                  : 'border-gray-600 hover:border-purple-400 hover:bg-purple-400/5 shadow-lg'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => tracks.length === 0 && document.getElementById('file-upload')?.click()}
          >
            {tracks.length === 0 ? (
              // Upload State
              <>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6 transition-colors ${
                  dragOver ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  <Upload className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${dragOver ? 'text-white' : 'text-white'}`} />
                </div>
                
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2 px-4 text-center drop-shadow">
                  {uploading ? 'Processing...' : 'Upload Audio'}
                </h3>
                
                <p className="text-sm sm:text-base text-white/90 text-center px-6 sm:px-8 mb-3 sm:mb-4 drop-shadow">
                  Drop your audio files here or click to browse
                </p>
                
                <div className="text-xs sm:text-sm text-white/70 text-center px-4 drop-shadow">
                  Supports: MP3, WAV, FLAC, M4A, AAC
                </div>
              </>
            ) : (
              // Success State - Show checkmark in circle
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2 text-center drop-shadow">
                  {tracks.length} File{tracks.length !== 1 ? 's' : ''} Ready
                </h3>
                
                <p className="text-sm sm:text-base text-white/80 text-center drop-shadow">
                  Files uploaded successfully
                </p>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm rounded-full">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-400"></div>
              </div>
            )}
            </div>
          </div>
          
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
        </div>

        {/* Modern Uploaded Files Section */}
        {tracks.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Uploaded Files</h3>
                  <p className="text-sm text-white/60">{tracks.length} file{tracks.length !== 1 ? 's' : ''} ready for editing</p>
                </div>
                <button
                  onClick={clearTracks}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm rounded-lg transition-all duration-200"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid gap-3">
                {tracks.map((track, index) => (
                  <div key={track.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayPause(track.name)}
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg group-hover:scale-105"
                      >
                        {playingTrack === track.name ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
                      </button>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-white truncate">{track.name}</h4>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                            Track {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <span>{Math.round(track.duration)}s</span>
                          <span>•</span>
                          <span>44.1kHz</span>
                          <span>•</span>
                          <span className="text-green-400">Ready</span>
                        </div>
                      </div>
                      
                      {/* Waveform Visualization */}
                      <div className="hidden sm:block w-24 h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center space-x-0.5">
                          {Array.from({ length: 20 }, (_, i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-gradient-to-t from-purple-500 to-purple-300 rounded-full opacity-60"
                              style={{ height: `${Math.random() * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add More Files Button */}
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="w-full mt-4 p-4 border-2 border-dashed border-white/20 hover:border-purple-400/50 rounded-xl text-white/60 hover:text-white/80 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 bg-white/10 group-hover:bg-purple-500/20 rounded-lg flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Add More Files</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Start Creating Button - Always visible */}
        <div className="text-center">
          <button
            onClick={startEditing}
            disabled={tracks.length === 0 || uploading}
            className={`w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all duration-200 shadow-lg ${
              tracks.length > 0 && !uploading
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
              <span className="truncate">
                {tracks.length > 0 
                  ? `Start Creating (${tracks.length} file${tracks.length !== 1 ? 's' : ''})`
                  : 'Start Creating'
                }
              </span>
            </div>
          </button>
          
          <p className="text-sm text-gray-500 mt-3">
            {tracks.length > 0 
              ? 'Ready to mix and edit your audio files'
              : 'Upload audio files to get started'
            }
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}