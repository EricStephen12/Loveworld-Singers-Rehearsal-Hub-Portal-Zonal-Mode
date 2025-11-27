'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(
  () => import('react-player').then((mod) => mod.default),
  { ssr: false }
)
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipForward,
  SkipBack,
  Settings,
  Loader2
} from 'lucide-react'

interface CustomVideoPlayerProps {
  url: string
  isYouTube?: boolean
  poster?: string
  onProgress?: (progress: { played: number; playedSeconds: number }) => void
  onEnded?: () => void
  onDuration?: (duration: number) => void
}

export default function CustomVideoPlayer({
  url,
  isYouTube = false,
  poster,
  onProgress,
  onEnded,
  onDuration
}: CustomVideoPlayerProps) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [playedSeconds, setPlayedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  // Ensure component is mounted before rendering ReactPlayer
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Use refs for keyboard shortcuts to avoid dependency issues
  const playingRef = useRef(playing)
  const volumeRef = useRef(volume)
  const mutedRef = useRef(muted)

  // Handle progress updates
  const handleProgress = useCallback((state: { played: number; playedSeconds: number; loaded: number }) => {
    if (!seeking) {
      setPlayed(state.played)
      setPlayedSeconds(state.playedSeconds)
      if (onProgress) {
        onProgress({ played: state.played, playedSeconds: state.playedSeconds })
      }
    }
  }, [seeking, onProgress])
  
  // Keep refs in sync with state
  useEffect(() => {
    playingRef.current = playing
  }, [playing])
  
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])
  
  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  // Format time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Show/hide controls on mouse move
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false)
      }
    }, 3000)
  }, [playing])



  // Handle seek change
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value))
  }

  // Handle seek mouse down
  const handleSeekMouseDown = () => {
    setSeeking(true)
  }

  // Handle seek mouse up
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false)
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.currentTarget.value))
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    setPlaying(!playing)
  }

  // Toggle mute
  const toggleMute = () => {
    setMuted(!muted)
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setMuted(newVolume === 0)
  }

  // Skip forward
  const skipForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(playedSeconds + 10, 'seconds')
    }
  }

  // Skip backward
  const skipBackward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(Math.max(0, playedSeconds - 10), 'seconds')
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts - using refs to avoid dependency issues
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          setPlaying(!playingRef.current)
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (playerRef.current) {
            playerRef.current.seekTo(Math.max(0, playedSeconds - 10), 'seconds')
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (playerRef.current) {
            playerRef.current.seekTo(playedSeconds + 10, 'seconds')
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(1, volumeRef.current + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, volumeRef.current - 0.1))
          break
        case 'm':
        case 'M':
          e.preventDefault()
          setMuted(!mutedRef.current)
          break
        case 'f':
        case 'F':
          e.preventDefault()
          if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen()
          } else {
            document.exitFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playedSeconds])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  // Early return AFTER all hooks
  if (!url) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <p className="text-white">No video URL provided</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (playing) {
          setShowControls(false)
        }
      }}
    >
      {/* Video Player */}
      <div className="absolute inset-0">
        {isMounted && typeof window !== 'undefined' && (
          <ReactPlayer
            {...{
              ref: playerRef,
              url: url,
              playing: playing,
              volume: volume,
              muted: muted,
              playbackRate: playbackRate,
              width: "100%",
              height: "100%",
              controls: false,
              light: poster && !playing ? poster : false,
              onProgress: handleProgress,
              pip: false,
              stopOnUnmount: false,
              onDuration: (dur: number) => {
                setDuration(dur)
                if (onDuration) {
                  onDuration(dur)
                }
              },
              onEnded: () => {
                setPlaying(false)
                setPlayed(0)
                setPlayedSeconds(0)
                if (onEnded) {
                  onEnded()
                }
              },
              onReady: () => {
                setIsLoading(false)
              },
              onStart: () => {
                setIsLoading(false)
              },
              onBuffer: () => setIsLoading(true),
              onBufferEnd: () => setIsLoading(false),
              onError: (error: any) => {
                console.error('Video player error:', error)
                setPlayerError('Failed to load video. Please try again.')
                setIsLoading(false)
              },
              config: {
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                    cc_load_policy: 0,
                    controls: 0,
                    fs: 0,
                    enablejsapi: 1,
                    autoplay: 0
                  }
                }
              }
            } as any}
          />
        )}
      </div>

      {/* Error Message */}
      {playerError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center p-6">
            <p className="text-white text-lg mb-4">{playerError}</p>
            <button
              onClick={() => {
                setPlayerError(null)
                setIsLoading(true)
                if (playerRef.current) {
                  playerRef.current.seekTo(0)
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Custom Controls */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4">
          {/* Add any top controls here if needed */}
        </div>

        {/* Center Play Button */}
        {!playing && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
            >
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress Bar */}
          <div className="w-full">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${played * 100}%, rgba(255,255,255,0.2) ${played * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {playing ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
              )}
            </button>

            {/* Skip Backward */}
            <button
              onClick={skipBackward}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Rewind 10s"
            >
              <SkipBack className="w-6 h-6 text-white" />
            </button>

            {/* Skip Forward */}
            <button
              onClick={skipForward}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Forward 10s"
            >
              <SkipForward className="w-6 h-6 text-white" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-sm font-mono ml-auto">
              {formatTime(playedSeconds)} / {formatTime(duration)}
            </div>

            {/* Playback Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 space-y-1 min-w-[120px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate)
                        setShowSettings(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded hover:bg-white/20 text-white text-sm ${
                        playbackRate === rate ? 'bg-red-600' : ''
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-6 h-6 text-white" />
              ) : (
                <Maximize className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  )
}



