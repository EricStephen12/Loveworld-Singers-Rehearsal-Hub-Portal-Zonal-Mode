'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Music, CheckCircle, XCircle, Clock, Eye, MessageSquare,
  User, Calendar, ArrowLeft, RefreshCw, FileText, Play, Pause, Trash2,
  ChevronLeft, ChevronRight, MoreVertical, Edit, Search
} from 'lucide-react'
import {
  getAllSubmittedSongs,
  getPendingSongs,
  approveSong,
  rejectSong,
  replyToSubmission,
  deleteSubmissionAsAdmin,
  markSubmissionAsSeen,
  SongSubmission
} from '@/lib/song-submission-service'
import { useAuth } from '@/hooks/useAuth'
import { useAdminTheme } from '@/components/admin/AdminThemeProvider'
import { useZone } from '@/hooks/useZone'
import { isHQGroup } from '@/config/zones'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'
import CustomLoader from '@/components/CustomLoader'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSong, setSelectedSong] = useState<SongSubmission | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null)
  const audioRefsRef = React.useRef<Map<string, HTMLAudioElement>>(new Map())

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Toast and confirmation modal state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    type: 'approve' | 'delete';
    song: SongSubmission | null;
    title: string;
    message: string;
  } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

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

    // Simplify query to avoid composite index requirements
    // loadSongs() handles sorting and filtering client-side for 100% reliability
    const q = isHQ
      ? query(submissionsRef)
      : query(submissionsRef, where('zoneId', '==', currentZone.id))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Refresh data on changes
      if (!snapshot.metadata.hasPendingWrites) {
        loadSongs()
      }
    }, (error) => {
      console.error('[SubmittedSongs] Real-time listener error:', error)
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

      setSongs(data.sort((a, b) => {
        // Sort by update/reply activity first
        const aTime = (a as any).lastActionAt || (a as any).updatedAt || a.createdAt
        const bTime = (b as any).lastActionAt || (b as any).updatedAt || b.createdAt
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      }))
    } catch (error) {
      console.error('Error loading songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (song: SongSubmission) => {
    if (!user || !song.id) return

    setProcessing(song.id)
    try {
      const result = await approveSong(
        song.id,
        user.uid,
        getUserName()
      )

      if (result.success) {
        showToast('success', 'Song approved and added to main collection!')
        setConfirmModal(null)
        loadSongs()
      } else {
        showToast('error', `Failed to approve song: ${result.error}`)
      }
    } catch (error) {
      showToast('error', 'Error approving song')
    } finally {
      setProcessing(null)
    }
  }

  const openApproveConfirm = (song: SongSubmission) => {
    setConfirmModal({
      type: 'approve',
      song,
      title: 'Approve Song',
      message: `Approve "${song.title}" by ${song.writer}?`
    })
  }

  const handleReject = async (song: SongSubmission) => {
    if (!user || !song.id) return

    if (!rejectNotes.trim()) {
      showToast('error', 'Please provide a reason for rejection')
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
        showToast('success', 'Song rejected')
        setShowRejectModal(false)
        setRejectNotes('')
        setSelectedSong(null)
        loadSongs()
      } else {
        showToast('error', `Failed to reject song: ${result.error}`)
      }
    } catch (error) {
      showToast('error', 'Error rejecting song')
    } finally {
      setProcessing(null)
    }
  }

  const handleReply = async (song: SongSubmission) => {
    if (!user || !song.id) return
    if (!replyMessage.trim()) {
      showToast('error', 'Please enter a reply message')
      return
    }
    setProcessing(song.id)
    try {
      const result = await replyToSubmission(song.id, getUserName(), replyMessage)
      if (result.success) {
        showToast('success', 'Reply sent successfully')
        setShowReplyModal(false)
        setReplyMessage('')
        setSelectedSong(null)
        loadSongs()
      } else {
        showToast('error', `Failed to send reply: ${result.error}`)
      }
    } catch (e) {
      showToast('error', 'Error sending reply')
    } finally {
      setProcessing(null)
    }
  }

  const filteredSongs = songs.filter(song => {
    // 1. Status Filter
    if (filter !== 'all' && song.status !== filter) return false

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        song.title?.toLowerCase().includes(query) ||
        song.writer?.toLowerCase().includes(query) ||
        song.submittedBy.userName?.toLowerCase().includes(query) ||
        song.category?.toLowerCase().includes(query)
      )
    }

    return true
  })

  const pendingCount = songs.filter(s => s.status === 'pending').length

  // Paginated Songs
  const paginatedSongs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSongs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSongs, currentPage])

  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage)

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  const handleDeleteAsAdmin = async (song: SongSubmission) => {
    if (!song.id) return

    setDeletingId(song.id)
    try {
      const result = await deleteSubmissionAsAdmin(song.id)
      if (result.success) {
        showToast('success', 'Submission deleted')
        setConfirmModal(null)
        loadSongs()
      } else {
        showToast('error', `Failed to delete submission: ${result.error}`)
      }
    } catch (e) {
      showToast('error', 'Error deleting submission')
    } finally {
      setDeletingId(null)
    }
  }

  const openDeleteConfirm = (song: SongSubmission) => {
    setConfirmModal({
      type: 'delete',
      song,
      title: 'Delete Submission',
      message: `Delete the submission "${song.title}"? This cannot be undone.`
    })
  }

  return (
    <div className={`${embedded ? 'h-full' : 'min-h-screen'} bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.song && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmModal.type === 'approve' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {confirmModal.type === 'approve' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Trash2 className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{confirmModal.title}</h3>
                <p className="text-sm text-gray-500">This action requires confirmation</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'approve') {
                    handleApprove(confirmModal.song!)
                  } else {
                    handleDeleteAsAdmin(confirmModal.song!)
                  }
                }}
                disabled={processing === confirmModal.song.id || deletingId === confirmModal.song.id}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${confirmModal.type === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {confirmModal.type === 'approve' ? 'Approve' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!embedded && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/admin')}
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

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${filter === 'all'
                ? `${theme.primary} text-white`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({songs.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium ${filter === 'pending'
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
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${filter === 'approved'
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
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${filter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <span className="hidden sm:inline">Rejected</span>
              <span className="sm:hidden">Rej.</span>
              ({songs.filter(s => s.status === 'rejected').length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search songs, writers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
            />
          </div>
        </div>

        {/* Songs List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <CustomLoader message="Loading submitted songs..." />
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No songs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {paginatedSongs.map((song) => (
              <div
                key={song.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate" title={song.title}>{song.title}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] items-center font-bold tracking-wide uppercase ${song.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : song.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}
                          >
                            {song.status}
                          </span>
                          {/* Updated badge */}
                          {(song as any).isUpdated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 animate-pulse">
                              UPDATED
                            </span>
                          )}
                          {/* New Reply badge */}
                          {(song as any).hasNewUserReply && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
                              NEW REPLY
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{song.submittedBy.userName}</span>
                        <span className="text-gray-300">•</span>
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="truncate">{new Date(song.createdAt).toLocaleDateString()}</span>
                        {(isHQ || isSuperAdmin) && song.zoneName && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium truncate max-w-[100px]">{song.zoneName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveActionMenuId(activeActionMenuId === song.id ? null : (song.id || null))
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeActionMenuId === song.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveActionMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => {
                                setSelectedSong(song)
                                setActiveActionMenuId(null)
                                if (song.id && ((song as any).isUpdated || (song as any).hasNewUserReply)) {
                                  markSubmissionAsSeen(song.id).then(() => {
                                    setSongs(prev => prev.map(s =>
                                      s.id === song.id ? { ...s, isUpdated: false, hasNewUserReply: false } as SongSubmission : s
                                    ))
                                  })
                                }
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                              View Details
                            </button>

                            {song.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    openApproveConfirm(song)
                                    setActiveActionMenuId(null)
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedSong(song)
                                    setShowRejectModal(true)
                                    setActiveActionMenuId(null)
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  Reject
                                </button>
                              </>
                            )}


                            {/* Allow reply for any status */}
                            <button
                              onClick={() => {
                                setSelectedSong(song)
                                setShowReplyModal(true)
                                setActiveActionMenuId(null)
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              Message / Reply
                            </button>

                            {song.id && (
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <button
                                  onClick={() => {
                                    openDeleteConfirm(song)
                                    setActiveActionMenuId(null)
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Song Details Grid */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-4 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Writer</p>
                      <p className="text-gray-900 font-medium truncate">{song.writer || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Category</p>
                      <p className="text-gray-900 font-medium truncate">{song.category || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Tempo</p>
                      <p className="text-gray-900 font-medium truncate">{song.tempo || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Key</p>
                      <p className="text-gray-900 font-medium truncate">{song.key || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Quick Preview & Audio */}
                  <div className="flex items-center gap-2">
                    {song.audioUrl ? (
                      <button
                        onClick={() => handleAudioPlay(song.id || '', song.audioUrl!)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors border ${playingAudioId === song.id
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-200 hover:text-purple-600'
                          }`}
                      >
                        {playingAudioId === song.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {playingAudioId === song.id ? 'Playing' : 'Play Audio'}
                      </button>
                    ) : (
                      <div className="flex-1 py-2 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                        No audio
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedSong(song)
                        if (song.id && ((song as any).isUpdated || (song as any).hasNewUserReply)) {
                          markSubmissionAsSeen(song.id)
                        }
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Numbered Pagination Controls - Moved outside modal */}
        {!loading && filteredSongs.length > 0 && totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 pt-8 pb-12">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={currentPage === 1}
                className="p-3 rounded-xl border border-gray-200 bg-white disabled:opacity-50 text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i)
                    }
                  }

                  if (pageNum > totalPages) return null

                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                        ? `${theme.primary} text-white shadow-lg scale-110 z-10`
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl border border-gray-200 bg-white disabled:opacity-50 text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-medium text-gray-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              Page <span className={theme.text}>{currentPage}</span> of {totalPages}
              <span className="mx-2 text-gray-300">|</span>
              Total: <span className="text-gray-900">{filteredSongs.length} submissions</span>
            </p>
          </div>
        )}

        {/* View Details Modal */}
        {selectedSong && !showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
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

                {/* Conversation Thread - Chat-like display */}
                {((selectedSong as any).conversation?.length > 0 || selectedSong.replyMessage || (selectedSong as any).userReply) && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Conversation</label>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {/* Show conversation array if exists */}
                      {(selectedSong as any).conversation?.length > 0 ? (
                        (selectedSong as any).conversation.map((msg: any) => (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-lg border ${msg.sender === 'admin'
                              ? 'bg-purple-50 border-purple-200 mr-8'
                              : 'bg-blue-50 border-blue-200 ml-8'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.sender === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                                  }`}>
                                  {msg.sender === 'admin' ? (
                                    <MessageSquare className="w-3 h-3 text-white" />
                                  ) : (
                                    <User className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className={`text-xs font-semibold ${msg.sender === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
                                  {msg.sender === 'admin' ? `Admin (${msg.senderName})` : selectedSong.submittedBy.userName}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {new Date(msg.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-sm whitespace-pre-wrap ${msg.sender === 'admin' ? 'text-purple-900' : 'text-blue-900'}`}>
                              {msg.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        /* Fallback to legacy fields */
                        <>
                          {selectedSong.replyMessage && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mr-8">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                  <MessageSquare className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-purple-700">Admin Reply</span>
                              </div>
                              <p className="text-sm text-purple-900 whitespace-pre-wrap">{selectedSong.replyMessage}</p>
                            </div>
                          )}
                          {(selectedSong as any).userReply && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 ml-8">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-blue-700">User Reply ({selectedSong.submittedBy.userName})</span>
                              </div>
                              <p className="text-sm text-blue-900 whitespace-pre-wrap">{(selectedSong as any).userReply}</p>
                            </div>
                          )}
                        </>
                      )}
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


              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 sticky bottom-0 z-10">
                <button
                  onClick={() => {
                    // Keep modal open, show reply modal on top
                    setShowReplyModal(true)
                  }}
                  className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
                >
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  Reply / Message
                </button>

                {/* Show actions if pending */}
                {selectedSong.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedSong(null)
                        openApproveConfirm(selectedSong)
                      }}
                      disabled={processing === selectedSong.id}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing === selectedSong.id}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedSong && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Reply to {selectedSong.title}</h2>
                <p className="text-sm text-gray-600 mt-1">This message will be sent to the submitter</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Show previous admin reply if exists */}
                {selectedSong.replyMessage && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-700 mb-1">Your previous reply:</p>
                    <p className="text-sm text-purple-900 whitespace-pre-wrap">{selectedSong.replyMessage}</p>
                  </div>
                )}

                {/* Show user's reply if exists */}
                {(selectedSong as any).userReply && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-1">User replied:</p>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{(selectedSong as any).userReply}</p>
                  </div>
                )}

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
    </div >
  )
}

