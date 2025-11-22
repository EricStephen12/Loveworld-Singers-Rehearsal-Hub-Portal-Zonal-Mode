'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAudioStore } from '@/lib/audio-store';
import Timeline from '@/components/audio-lab/Timeline';
import AIProducer from '@/components/audio-lab/AIProducer';
import EffectsPanel from '@/components/audio-lab/EffectsPanel';

// Lazy load audioEngine only on client
let audioEngine: any = null;
const getAudioEngine = async () => {
  if (typeof window === 'undefined') return null;
  if (!audioEngine) {
    const { audioEngine: engine } = await import('@/lib/audio-engine');
    audioEngine = engine;
  }
  return audioEngine;
};
import {
    Play,
    Pause,
    Square,
    SkipBack,
    SkipForward,
    Volume2,
    Download,
    ArrowLeft,
    Save,
    Undo,
    Redo,
    User,
    Mic,
    Plus
} from 'lucide-react';
import Threads from '@/components/Threads';

export default function AudioLabEditor() {
    const router = useRouter();
    const {
        tracks,
        isPlaying,
        currentTime,
        duration,
        isRecording,
        play,
        pause,
        stop,
        setCurrentTime,
        seekTo,
        startRecording,
        stopRecording,
        exportMix
    } = useAudioStore();

    const [masterVolume, setMasterVolume] = useState(0.8);
    const [isExporting, setIsExporting] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showMobilePanel, setShowMobilePanel] = useState(false);
    const [activeMobilePanel, setActiveMobilePanel] = useState<'ai' | 'effects' | null>(null);

    useEffect(() => {
        const loadTracks = async () => {
            if (typeof window === 'undefined') return;
            const engine = await getAudioEngine();
            if (!engine) return;
            
            console.log('Loading tracks in editor:', tracks.length);
            for (const track of tracks) {
                try {
                    await engine.loadTrack(track);
                    console.log(`Loaded track: ${track.name}`);
                } catch (error) {
                    console.error(`Failed to load track ${track.name}:`, error);
                }
            }
        };

        if (tracks.length > 0) {
            loadTracks();
        }

        return () => {
            // Don't dispose on every change, only on unmount
        };
    }, [tracks]);

    useEffect(() => {
        const handlePlayback = async () => {
            if (typeof window === 'undefined') return;
            const engine = await getAudioEngine();
            if (!engine) return;
            
            if (isPlaying) {
                engine.play();
            } else {
                engine.pause();
            }
        };
        handlePlayback();
    }, [isPlaying]);

    useEffect(() => {
        const setVolume = async () => {
            if (typeof window === 'undefined') return;
            const engine = await getAudioEngine();
            if (!engine) return;
            
            engine.setMasterVolume(masterVolume);
        };
        setVolume();
    }, [masterVolume]);

    const handlePlay = () => {
        console.log('🎵 Play button clicked');
        console.log('📊 Available tracks:', tracks.map(t => ({ name: t.name, muted: t.muted, url: !!t.audioUrl })));
        
        if (tracks.length === 0) {
            console.log('❌ No tracks to play');
            return;
        }
        
        // Simply call the store's play function
        play();
    };

    const handlePause = () => {
        pause();
    };

    const handleStop = async () => {
        stop();
        if (typeof window === 'undefined') return;
        const engine = await getAudioEngine();
        if (engine) {
            engine.stop();
        }
    };

    const handleSeek = (seconds: number) => {
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        seekTo(newTime);
    };

    const handleRecord = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            await startRecording();
        }
    };

    const openMobilePanel = (panel: 'ai' | 'effects') => {
        setActiveMobilePanel(panel);
        setShowMobilePanel(true);
    };

    const handleExport = async () => {
        if (tracks.length === 0) return;
        if (typeof window === 'undefined') return;

        setIsExporting(true);
        try {
            const engine = await getAudioEngine();
            if (!engine) {
                throw new Error('Audio engine not available');
            }
            
            const audioBlob = await engine.exportMix(tracks);

            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mix_${Date.now()}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (tracks.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎵</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No tracks loaded</h2>
                    <p className="text-gray-600 mb-6">Upload some audio files to start editing</p>
                    <button
                        onClick={() => router.push('/pages/audio-lab')}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Go to Upload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 flex flex-col overflow-hidden relative">
            {/* Animated Threads Background */}
            <div className="absolute inset-0 z-0">
                <Threads
                    amplitude={1}
                    distance={0}
                    enableMouseInteraction={true}
                    color={[0.5, 0.3, 0.9]} // Purple color for threads
                />
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-700/50">
                <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <button
                                onClick={() => router.push('/pages/audio-lab')}
                                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 flex-shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            
                            <div className="min-w-0 flex-1">
                                <h1 className="text-sm sm:text-lg font-bold text-white truncate">Audio Lab</h1>
                                <div className="text-xs text-gray-400 hidden sm:block">
                                    {tracks.length} track{tracks.length !== 1 ? 's' : ''} • {formatTime(duration)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                            <div className="hidden sm:flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">John Doe</div>
                                    <div className="text-xs text-gray-500">Producer</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowSaveDialog(true)}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save</span>
                                </button>

                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {isExporting ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transport Controls - Mobile Optimized */}
            <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                    {/* Playback Controls */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                            onClick={() => handleSeek(-10)}
                            className="p-2 sm:p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <button
                            onClick={isPlaying ? handlePause : handlePlay}
                            className="p-3 sm:p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>

                        <button
                            onClick={handleRecord}
                            className={`p-2 sm:p-3 rounded-lg transition-colors shadow-lg ${
                                isRecording 
                                    ? 'bg-red-600 text-white animate-pulse' 
                                    : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                        >
                            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <button
                            onClick={handleStop}
                            className="p-2 sm:p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <button
                            onClick={() => handleSeek(10)}
                            className="p-2 sm:p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {/* Time Display */}
                    <div className="bg-black text-green-400 px-6 py-3 rounded-lg font-mono text-xl font-bold">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    {/* Master Volume & Controls */}
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">Master</span>
                            <Volume2 className="w-5 h-5 text-gray-500" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={masterVolume}
                                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                                className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-sm text-gray-600 w-8">
                                {Math.round(masterVolume * 100)}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                <Undo className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Editor Layout - Mobile Responsive */}
            <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
                {/* Timeline - Main Area */}
                <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg shadow-sm border border-gray-700/50 h-full overflow-hidden">
                        <Timeline />
                    </div>
                </div>

                {/* Right Sidebar - Mobile: Bottom, Desktop: Right */}
                <div className="w-full lg:w-72 xl:w-80 p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 overflow-y-auto max-h-96 lg:max-h-none">
                    {/* AI Producer */}
                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg shadow-sm border border-gray-700/50 h-64 sm:h-80 lg:h-96">
                        <AIProducer />
                    </div>

                    {/* Effects Panel */}
                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg shadow-sm border border-gray-700/50">
                        <EffectsPanel />
                    </div>
                </div>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
                        <h4 className="font-semibold text-gray-900 mb-4">Save Project</h4>
                        <input
                            type="text"
                            placeholder="Project name..."
                            className="w-full bg-gray-50 text-gray-900 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200"
                        />
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }
      `}</style>
            </div>
        </div>
    );
}