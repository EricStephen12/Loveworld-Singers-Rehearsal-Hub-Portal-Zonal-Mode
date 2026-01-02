'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Music, CheckCircle, XCircle, Clock, Eye, MessageSquare, 
  User, Calendar, ArrowLeft, RefreshCw, FileText, Play, Pause
} from 'lucide-react'
import { 
  getAllSubmittedSongs, 
  getPendingSongs, 
  approveSong, 
  rejectSong,
  replyToSubmission,
  deleteSubmissionAsAdmin,
  SongSubmission 
} from '@/lib/song-submission-service'
import { useAuth } from '@/hooks/useAuth'
import { useAdminTheme } from '@/components/admin/AdminThemeProvider'
import { useZone } from '@/hooks/useZone'
import { isHQGroup } from '@/config/zones'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

interface SubmittedSongsPageProps {
  embedded?: boolean
}

export default function SubmittedSongsPage({ embedded = false }: SubmittedSongsPageProps = { embedded: false }) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { theme } = useAdminTheme()
  const { currentZone, isSuperAdmin } = useZone()
  const [songs, setSongs] = useState<SongSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedSong, setSelectedSong] = useState<SongSubmission | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const audioRefsRef = React.useRef<Map<string, HTMLAudioElement>>(new Map())
  
  // Check if current zone is HQ (can see all submissions)
  const isHQ = currentZone?.id ? isHQGroup(currentZone.id) : false

  // Cleanup audio refs on unmount
  useEffect(() => {
    return () => {
      audioRefsRef.current.forEach((audio) => {
        audio.pause()
        audio.src = ''
      })
      audioRefsRef.current.clear()
    }
  }, [])

  const handleAudioPlay = (songId: string, audioUrl: string) => {
    // Stop any currently playing audio
    audioRefsRef.current.forEach((audio, id) => {
      if (id !== songId) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    if (playingAudioId === songId) {
      // Pause if already playing
      const audio = audioRefsRef.current.get(songId)
      if (audio) {
        audio.pause()
        setPlayingAudioId(null)
      }
    } else {
      // Play new audio
      let audio = audioRefsRef.current.get(songId)
      if (!audio) {
        audio = new Audio(audioUrl)
        audioRefsRef.current.set(songId, audio)
        audio.addEventListener('ended', () => setPlayingAudioId(null))
      }
      audio.play()
      setPlayingAudioId(songId)
    }
  }

  // Helper function to get user's display name
  const getUserName = () => {
    if (!profile) return ''
    const parts = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean)
    return parts.join(' ') || user?.email || 'Admin'
  }

  useEffect(() => {
    if (currentZone?.id) {
      loadSongs()
    }
  }, [filter, currentZone?.id])

  // Set up real-time listener for submitted songs
  useEffect(() => {
    if (!currentZone?.id) return
    
    const submissionsRef = collection(db, 'submitted_songs')
    const q = isHQ 
      ? query(submissionsRef, orderBy('createdAt', 'desc'))
      : query(submissionsRef, where('zoneId', '==', currentZone.id), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Only refresh if there are actual changes (not just metadata)
      if (!snapshot.metadata.hasPendingWrites && snapshot.docChanges().length > 0) {
        loadSongs()
      }
    }, (error) => {
      console.log('[SubmittedSongs] Real-time listener error:', error)
    })
    
    return () => unsubscribe()
  }, [currentZone?.id, isHQ])

  const loadSongs = async () => {
    setLoading(true)
    try {
      // HQ is one unified entity - HQ manager sees ALL HQ submissions from ALL HQ zones
      // Regular zones see only their specific zone submissions
      // isHQ means current zone is an HQ zone - treat all HQ zones as one
      const zoneId = currentZone?.id
      
      console.log('📖 Loading submitted songs:', { 
        zoneId, 
        isHQ, 
        isSuperAdmin,
        currentZone: currentZone?.name,
        note: isHQ ? 'HQ Manager - seeing all HQ submissions' : 'Regular zone - seeing only this zone'
      })
      
      let data: SongSubmission[]
      if (filter === 'pending') {
        data = await getPendingSongs(zoneId, isHQ)
      } else {
        data = await getAllSubmittedSongs(zoneId, isHQ)
      }
      
      // Filter by status if needed
      if (filter === 'approved' || filter === 'rejected') {
        data = data.filter(song => song.status === filter)
      }
      
      setSongs(data)
    } catch (error) {
      console.error('Error loading songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (song: SongSubmission) => {
    if (!user || !song.id) return
    
    if (!confirm(`Approve "${song.title}" by ${song.writer}?`)) return
    
    setProcessing(song.id)
    try {
      const result = await approveSong(
        song.id,
        user.uid,
        getUserName()
      )
      
      if (result.success) {
        alert('✅ Song approved and added to main collection!')
        loadSongs()
      } else {
        alert(`❌ Failed to approve song: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error approving song')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (song: SongSubmission) => {
    if (!user || !song.id) return
    
    if (!rejectNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    
    setProcessing(song.id)
    try {
      const result = await rejectSong(
        song.id,
        user.uid,
        getUserName(),
        rejectNotes
      )
      
      if (result.success) {
        alert('✅ Song rejected')
        setShowRejectModal(false)
        setRejectNotes('')
        setSelectedSong(null)
        loadSongs()
      } else {
        alert(`❌ Failed to reject song: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error rejecting song')
    } finally {
      setProcessing(null)
    }
  }

  const handleReply = async (song: SongSubmission) => {
    if (!user || !song.id) return
    if (!replyMessage.trim()) {
      alert('Please enter a reply message')
      return
    }
    setProcessing(song.id)
    try {
      const result = await replyToSubmission(song.id, getUserName(), replyMessage)
      if (result.success) {
        setShowReplyModal(false)
        setReplyMessage('')
        setSelectedSong(null)
        loadSongs()
      } else {
        alert(`❌ Failed to send reply: ${result.error}`)
      }
    } catch (e) {
      alert('❌ Error sending reply')
    } finally {
      setProcessing(null)
    }
  }

  const filteredSongs = songs.filter(song => {
    if (filter === 'all') return true
    return song.status === filter
  })

  const pendingCount = songs.filter(s => s.status === 'pending').length

  const handleDeleteAsAdmin = async (song: SongSubmission) => {
    if (!song.id) return
    if (!confirm(`Delete the submission "${song.title}"? This cannot be undone.`)) return
    
    setDeletingId(song.id)
    try {
      const result = await deleteSubmissionAsAdmin(song.id)
      if (result.success) {
        alert('✅ Submission deleted')
        loadSongs()
      } else {
        alert(`❌ Failed to delete submission: ${result.error}`)
      }
    } catch (e) {
      alert('❌ Error deleting submission')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={`${embedded ? 'h-full' : 'min-h-screen'} bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!embedded && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
                <div className={`w-12 h-12 ${theme.primary} rounded-lg flex items-center justify-center`}>
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Submitted Songs</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Review and manage song submissions
                </p>
              </div>
            </div>
            <button
              onClick={loadSongs}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        )}
        
        {embedded && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${theme.primary} rounded-lg flex items-center justify-center`}>
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Submitted Songs</h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  Review and manage song submissions
                </p>
              </div>
            </div>
            <button
              onClick={loadSongs}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                filter === 'all' 
                  ? `${theme.primary} text-white` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({songs.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium ${
                filter === 'pending' 
                  ? `${theme.primary} text-white` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">Pend.</span>
              {pendingCount > 0 && ` (${pendingCount})`}
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                filter === 'approved' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">Approved</span>
              <span className="sm:hidden">Appr.</span>
              ({songs.filter(s => s.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                filter === 'rejected' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">Rejected</span>
              <span className="sm:hidden">Rej.</span>
              ({songs.filter(s => s.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Songs List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <RefreshCw className={`w-8 h-8 ${theme.text} animate-spin mx-auto mb-4`} />
            <p className="text-gray-600">Loading submitted songs...</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No songs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{song.title}</h3>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${
                          song.status === 'pending'
                            ? `${theme.primaryLight} ${theme.text}`
                            : song.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {song.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Writer:</span>
                        <span className="truncate">{song.writer || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Category:</span>
                        <span className="truncate">{song.category || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Submitted:</span>
                        <span className="truncate">{new Date(song.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">By:</span>
                        <span className="truncate">{song.submittedBy.userName}</span>
                      </div>
                      {/* Show zone info for HQ/super admin */}
                      {(isHQ || isSuperAdmin) && song.zoneName && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Zone:</span>
                          <span className="truncate px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{song.zoneName}</span>
                        </div>
                      )}
                    </div>

                    {/* Audio Player */}
                    {song.audioUrl && (
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Audio:</p>
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                          <button
                            onClick={() => handleAudioPlay(song.id || '', song.audioUrl!)}
                            className="flex items-center gap-3 w-full text-left active:scale-[0.98] transition-transform touch-manipulation"
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                              playingAudioId === song.id 
                                ? 'bg-purple-600' 
                                : 'bg-white border-2 border-purple-200'
                            }`}>
                              {playingAudioId === song.id ? (
                                <Pause className="w-6 h-6 text-white" />
                              ) : (
                                <Play className="w-6 h-6 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {playingAudioId === song.id ? 'Playing...' : 'Play Audio'}
                              </p>
                              <p className="text-xs text-gray-600 truncate">Tap to {playingAudioId === song.id ? 'pause' : 'play'}</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Preview */}
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Preview:</p>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 max-h-24 sm:max-h-32 overflow-y-auto">
                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-3 sm:line-clamp-4 whitespace-pre-wrap">
                          {song.lyrics.substring(0, 200)}...
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {song.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setSelectedSong(song)}
                            className={`px-3 sm:px-4 py-2 ${theme.primaryLight} ${theme.text} rounded-lg ${theme.bgHover} transition-colors flex items-center gap-2 text-xs sm:text-sm`}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </button>
                          <button
                            onClick={() => handleApprove(song)}
                            disabled={processing === song.id}
                            className="px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSong(song)
                              setShowRejectModal(true)
                            }}
                            disabled={processing === song.id}
                            className="px-3 sm:px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                          <button
                            onClick={() => { setSelectedSong(song); setShowReplyModal(true); }}
                            disabled={processing === song.id}
                            className={`px-3 sm:px-4 py-2 ${theme.primaryLight} ${theme.text} rounded-lg ${theme.bgHover} transition-colors disabled:opacity-50 flex items-center gap-2 text-xs sm:text-sm`}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Reply</span>
                          </button>
                        </>
                      )}
                      {song.status !== 'pending' && (
                        <button
                          onClick={() => setSelectedSong(song)}
                          className={`px-3 sm:px-4 py-2 ${theme.primaryLight} ${theme.text} rounded-lg ${theme.bgHover} transition-colors flex items-center gap-2 text-xs sm:text-sm`}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      )}
                      {/* Admin delete action */}
                      {song.id && (
                        <button
                          onClick={() => handleDeleteAsAdmin(song)}
                          disabled={deletingId === song.id}
                          className="px-3 sm:px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
                        >
                          {deletingId === song.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Delete</span>
                          <span className="sm:hidden">Del</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Details Modal */}
        {selectedSong && !showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSong.title}</h2>
                <button
                  onClick={() => setSelectedSong(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Song Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Writer</label>
                    <p className="text-gray-900">{selectedSong.writer || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Category</label>
                    <p className="text-gray-900">{selectedSong.category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Key</label>
                    <p className="text-gray-900">{selectedSong.key || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Tempo</label>
                    <p className="text-gray-900">{selectedSong.tempo || 'N/A'}</p>
                  </div>
                </div>

                {/* Team Members */}
                {(selectedSong.leadSinger || selectedSong.conductor || selectedSong.leadKeyboardist) && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Team Members</label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedSong.leadSinger && <p><span className="font-medium">Lead Singer:</span> {selectedSong.leadSinger}</p>}
                      {selectedSong.conductor && <p><span className="font-medium">Conductor:</span> {selectedSong.conductor}</p>}
                      {selectedSong.leadKeyboardist && <p><span className="font-medium">Keyboardist:</span> {selectedSong.leadKeyboardist}</p>}
                      {selectedSong.leadGuitarist && <p><span className="font-medium">Guitarist:</span> {selectedSong.leadGuitarist}</p>}
                      {selectedSong.drummer && <p><span className="font-medium">Drummer:</span> {selectedSong.drummer}</p>}
                    </div>
                  </div>
                )}

                {/* Lyrics */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Lyrics</label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {selectedSong.lyrics}
                    </pre>
                  </div>
                </div>

                {/* Solfas */}
                {selectedSong.solfas && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Solfas</label>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {selectedSong.solfas}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Audio Player */}
                {selectedSong.audioUrl && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Audio</label>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                      <audio
                        controls
                        src={selectedSong.audioUrl}
                        className="w-full"
                        onPlay={() => setPlayingAudioId(selectedSong.id || null)}
                        onPause={() => setPlayingAudioId(null)}
                        onEnded={() => setPlayingAudioId(null)}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedSong.notes && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Additional Notes</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSong.notes}</p>
                    </div>
                  </div>
                )}

                {/* Submission Info */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Submitted by:</span> {selectedSong.submittedBy.userName} ({selectedSong.submittedBy.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {new Date(selectedSong.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                {selectedSong.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedSong(null)
                        handleApprove(selectedSong)
                      }}
                      disabled={processing === selectedSong.id}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Song
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing === selectedSong.id}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Song
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedSong && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Reject Song</h2>
                <p className="text-sm text-gray-600 mt-1">Provide a reason for rejection</p>
              </div>
              <div className="p-6">
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y"
                  required
                />
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectNotes('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedSong)}
                  disabled={!rejectNotes.trim() || processing === selectedSong.id}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedSong && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Reply to {selectedSong.title}</h2>
                <p className="text-sm text-gray-600 mt-1">This message will be sent to the submitter</p>
              </div>
              <div className="p-6">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Enter your reply..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                  required
                />
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false)
                    setReplyMessage('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReply(selectedSong)}
                  disabled={!replyMessage.trim() || processing === selectedSong.id}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

