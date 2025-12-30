'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock, MessageSquare, ChevronDown, ChevronUp, Trash2, Music, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { submitSong, getAllSubmittedSongs, deleteUserSubmission, SongSubmission } from '@/lib/song-submission-service'
import { useZone } from '@/hooks/useZone'
import { getZoneTheme } from '@/utils/zone-theme'
import { uploadAudio } from '@/lib/cloudinary-setup'
import { isHQGroup } from '@/config/zones'

interface SongSubmissionForm {
  title: string
  writer: string
  leadSinger: string
  lyrics: string
  key: string
  notes: string
  audioFile: File | null
  audioUrl: string | null
}

export default function SubmitSongPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { currentZone } = useZone()
  
  // Get zone color and theme for theming
  const zoneColor = currentZone?.themeColor || '#9333EA'
  const zoneTheme = getZoneTheme(zoneColor)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [mySubmissions, setMySubmissions] = useState<SongSubmission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [activeTab, setActiveTab] = useState<'submit' | 'submitted'>('submit')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  
  // Generate focus ring color based on zone color
  const getFocusClasses = () => {
    return `${zoneTheme.focusRing} ${zoneTheme.focusBorder}`
  }
  
  const getUserName = () => {
    if (!profile) return ''
    const parts = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean)
    return parts.join(' ') || user?.email || ''
  }

  const [formData, setFormData] = useState<SongSubmissionForm>({
    title: '',
    writer: getUserName(),
    leadSinger: '',
    lyrics: '',
    key: '',
    notes: '',
    audioFile: null,
    audioUrl: null
  })
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [audioUploadProgress, setAudioUploadProgress] = useState(0)

  useEffect(() => {
    const userName = getUserName()
    if (userName && !formData.writer) {
      setFormData(prev => ({ ...prev, writer: userName }))
    }
  }, [profile, user])

  // Load user's submissions
  useEffect(() => {
    if (user && currentZone?.id) {
      loadMySubmissions()
    }
  }, [user?.uid, user?.email, currentZone?.id])

  const loadMySubmissions = async () => {
    if (!user || !currentZone?.id) {
      console.log('[SubmitSong] Cannot load - missing user or zone');
      setMySubmissions([]);
      return;
    }
    
    setLoadingSubmissions(true)
    try {
      // Check if current zone is HQ
      const isCurrentZoneHQ = isHQGroup(currentZone.id)
      
      console.log('[SubmitSong] Loading submissions:', {
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        isHQ: isCurrentZoneHQ,
        userEmail: user.email,
        userId: user.uid
      });
      
      // Fetch submissions: HQ zones see all HQ submissions, regular zones see only their zone
      const allSubmissions = await getAllSubmittedSongs(currentZone.id, isCurrentZoneHQ)
      
      console.log('[SubmitSong] Fetched', allSubmissions.length, 'total submissions');
      
      const emailLower = (user.email || '').toLowerCase()

      // Filter by this user
      // For HQ: user can see their submissions from any HQ zone
      // For regular: user can only see their submissions from their zone
      const my = allSubmissions.filter((submission) => {
        const submittedEmail = (submission.submittedBy?.email || '').toLowerCase()
        const submittedUserId = submission.submittedBy?.userId
        const submissionZoneId = submission.zoneId

        // Match by email if available, otherwise fall back to userId
        const isMySubmission = (emailLower && submittedEmail === emailLower) || 
                               (submittedUserId && submittedUserId === user.uid)
        
        if (!isMySubmission) {
          return false;
        }
        
        // If not HQ, also check zone match (regular zones only see their own zone)
        if (!isCurrentZoneHQ && submissionZoneId !== currentZone.id) {
          console.log('[SubmitSong] Rejecting - zone mismatch:', submissionZoneId, '!=', currentZone.id);
          return false;
        }
        
        return true;
      })

      console.log('[SubmitSong] Found', my.length, 'submissions for user');
      setMySubmissions(my)
    } catch (error) {
      console.error('[SubmitSong] Error loading submissions:', error)
      setMySubmissions([])
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!user?.uid) return
    if (!confirm('Are you sure you want to delete this submission?')) return
    
    setDeletingId(submissionId)
    try {
      const result = await deleteUserSubmission(submissionId, user.uid)
      if (result.success) {
        loadMySubmissions()
      } else {
        alert(result.error || 'Failed to delete submission')
      }
    } catch (error) {
      alert('Error deleting submission')
    } finally {
      setDeletingId(null)
    }
  }

  const handleInputChange = (field: keyof SongSubmissionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Audio file must be less than 50MB')
      return
    }

    setFormData(prev => ({ ...prev, audioFile: file, audioUrl: null }))
    setUploadingAudio(true)
    setAudioUploadProgress(0)

    try {
      // Upload to Cloudinary
      const audioUrl = await uploadAudio(file)
      if (audioUrl) {
        setFormData(prev => ({ ...prev, audioUrl, audioFile: null }))
        setSubmitStatus('idle')
      } else {
        alert('Failed to upload audio. Please try again.')
        setFormData(prev => ({ ...prev, audioFile: null }))
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      alert('Failed to upload audio. Please try again.')
      setFormData(prev => ({ ...prev, audioFile: null }))
    } finally {
      setUploadingAudio(false)
      setAudioUploadProgress(0)
    }
  }

  const handleRemoveAudio = () => {
    setFormData(prev => ({ ...prev, audioFile: null, audioUrl: null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use cached profile if user is still loading
    const currentUser = user || (profile?.id ? { uid: profile.id } : null)
    if (!currentUser) {
      alert('Please log in to submit a song')
      return
    }

    if (!formData.title.trim() || !formData.lyrics.trim()) {
      alert('Please fill in at least the song title and lyrics')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // CRITICAL: Include zone ID for proper filtering
      if (!currentZone?.id) {
        alert('Please select a zone before submitting')
        setIsSubmitting(false)
        return
      }
      
      // Use cached profile if user is still loading
      const userId = user?.uid || profile?.id
      const userEmail = user?.email || profile?.email || ''
      
      if (!userId) {
        alert('Please log in to submit a song')
        setIsSubmitting(false)
        return
      }
      
      const result = await submitSong({
        title: formData.title.trim(),
        lyrics: formData.lyrics.trim(),
        writer: formData.writer.trim() || getUserName() || 'Unknown',
        category: 'Other',
        key: formData.key.trim() || '',
        tempo: '',
        leadSinger: formData.leadSinger.trim() || '',
        conductor: '',
        leadKeyboardist: '',
        leadGuitarist: '',
        drummer: '',
        solfas: '',
        notes: formData.notes.trim() || '',
        audioUrl: formData.audioUrl || '',
        // CRITICAL: Zone tracking
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        submittedBy: {
          userId: userId,
          userName: getUserName() || userEmail || 'Unknown',
          email: userEmail,
          submittedAt: new Date().toISOString()
        }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit song')
      }

      setSubmitStatus('success')
      
      // Reload submissions to show the new one and switch to Submitted tab
      await loadMySubmissions()
      setActiveTab('submitted')
      
      setTimeout(() => {
        setFormData({
          title: '',
          writer: getUserName(),
          leadSinger: '',
          lyrics: '',
          key: '',
          notes: '',
          audioFile: null,
          audioUrl: null
        })
        setSubmitStatus('idle')
      }, 3000)

    } catch (error) {
      console.error('Error submitting song:', error)
      setSubmitStatus('error')
      alert('Failed to submit song. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Only show loading if auth is loading AND no cached profile
  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If we have cached profile, show content even if user is still loading
  if (!user && !profile) return null

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-white/95 backdrop-blur-xl shadow-sm p-4 justify-between border-b border-gray-100">
            <button
              onClick={() => router.back()}
          className="flex size-11 shrink-0 items-center justify-center text-gray-700 active:bg-gray-100 rounded-full transition-colors touch-manipulation"
            >
          <ArrowLeft className="w-6 h-6" />
            </button>
        <h1 className="text-gray-900 text-xl font-bold leading-tight tracking-tight flex-1 text-center">
          Submit Song
        </h1>
        <div className="w-11"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32 scroll-smooth">
        {/* Banner for upcoming feature */}
        {showOverlay && (
        <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 text-xl mb-2">Feature in Development</h3>
                <p className="text-blue-800 mb-4">We're working on an enhanced experience for song submissions.</p>
                <p className="text-blue-700">Stay tuned for exciting new features coming soon!</p>
              </div>
              <button 
                onClick={() => router.back()}
                className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        )}
        {/* Tabs */}
        <div className="px-4 pt-5 pb-3">
          <div className="inline-flex items-center rounded-2xl bg-gray-100 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 touch-manipulation ${
                activeTab === 'submit'
                  ? 'bg-white text-gray-900 shadow-md scale-105'
                  : 'text-gray-600 active:bg-gray-200'
              }`}
            >
              Submit Song
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('submitted')
                loadMySubmissions()
              }}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 touch-manipulation ${
                activeTab === 'submitted'
                  ? 'bg-white text-gray-900 shadow-md scale-105'
                  : 'text-gray-600 active:bg-gray-200'
              }`}
            >
              Submitted Songs
            </button>
          </div>
        </div>

        <section className="flex flex-col gap-5 px-4 pb-6">
          {/* Status Messages */}
        {submitStatus === 'success' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 flex items-start gap-4 shadow-lg animate-in slide-in-from-top-2">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            <div className="flex-1">
              <p className="font-bold text-green-900 text-base mb-1">Song submitted successfully!</p>
              <p className="text-sm text-green-700 leading-relaxed">Your song is now under review by the admin.</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-lg animate-in slide-in-from-top-2">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-900 text-base mb-1">Submission failed</p>
                <p className="text-sm text-red-700 leading-relaxed">Please check your connection and try again.</p>
              </div>
          </div>
        )}

          {/* Submitted Songs Tab Content */}
          {activeTab === 'submitted' && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${zoneColor}15` }}
                >
                    <Clock className="w-6 h-6" style={{ color: zoneColor }} />
                  </div>
                  <div className="text-left flex-1">
                  <p className="font-bold text-gray-900 text-base">Submitted Songs</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {loadingSubmissions
                      ? 'Loading your submissions...'
                      : mySubmissions.length === 0
                      ? 'You have not submitted any songs yet.'
                      : `${mySubmissions.length} song${mySubmissions.length !== 1 ? 's' : ''} submitted`}
                  </p>
                </div>
              </div>
              
              {mySubmissions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
                  {mySubmissions.map((submission) => (
                    <div key={submission.id} className="p-5 active:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="font-bold text-gray-900 text-base flex-1">{submission.title}</h4>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          submission.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Submitted {new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      
                      {/* Show admin reply if exists */}
                      {submission.replyMessage && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                            <span className="text-xs font-bold text-purple-800">Admin Reply</span>
                          </div>
                          <p className="text-sm text-purple-900 leading-relaxed">{submission.replyMessage}</p>
                        </div>
                      )}
                      
                      {/* Show rejection reason if rejected */}
                      {submission.status === 'rejected' && submission.reviewNotes && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-xs font-bold text-red-800">Rejection Reason</span>
                          </div>
                          <p className="text-sm text-red-900 leading-relaxed">{submission.reviewNotes}</p>
                        </div>
                      )}
                      
                      {/* Show approval message */}
                      {submission.status === 'approved' && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">
                              Your song has been approved and added to the collection!
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Delete button - only for pending submissions */}
                      {submission.status === 'pending' && submission.id && (
                        <button
                          onClick={() => handleDeleteSubmission(submission.id!)}
                          disabled={deletingId === submission.id}
                          className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 active:bg-red-50 rounded-xl transition-colors disabled:opacity-50 touch-manipulation border border-red-200"
                        >
                          {deletingId === submission.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Submission</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Song Tab Content */}
          {activeTab === 'submit' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Song Title */}
            <div className="flex flex-col gap-2.5">
              <label className="text-gray-900 text-sm font-semibold leading-tight">
                Song Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter the title of the song"
                className={`w-full rounded-2xl text-gray-900 focus:outline-none focus:ring-4 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white h-14 placeholder:text-gray-400 px-5 text-base font-normal leading-normal shadow-sm transition-all duration-200 ${getFocusClasses()} touch-manipulation`}
                required
              />
            </div>

            {/* Writer */}
            <div className="flex flex-col gap-2.5">
              <label className="text-gray-900 text-sm font-semibold leading-tight">Writer/Composer</label>
              <input
                type="text"
                value={formData.writer}
                onChange={(e) => handleInputChange('writer', e.target.value)}
                placeholder="Enter writer's name"
                className={`w-full rounded-2xl text-gray-900 focus:outline-none focus:ring-4 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white h-14 placeholder:text-gray-400 px-5 text-base font-normal leading-normal shadow-sm transition-all duration-200 ${getFocusClasses()} touch-manipulation`}
              />
            </div>

            {/* Lead Singer */}
            <div className="flex flex-col gap-2.5">
              <label className="text-gray-900 text-sm font-semibold leading-tight">Lead Singer</label>
              <input
                type="text"
                value={formData.leadSinger}
                onChange={(e) => handleInputChange('leadSinger', e.target.value)}
                placeholder="Enter lead singer's name"
                className={`w-full rounded-2xl text-gray-900 focus:outline-none focus:ring-4 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white h-14 placeholder:text-gray-400 px-5 text-base font-normal leading-normal shadow-sm transition-all duration-200 ${getFocusClasses()} touch-manipulation`}
              />
            </div>

            {/* Lyrics */}
            <div className="flex flex-col gap-2.5">
              <label className="text-gray-900 text-sm font-semibold leading-tight">
                Lyrics <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.lyrics}
                onChange={(e) => handleInputChange('lyrics', e.target.value)}
                placeholder="Enter the song lyrics..."
                rows={8}
                className={`w-full rounded-2xl text-gray-900 focus:outline-none focus:ring-4 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white min-h-[180px] placeholder:text-gray-400 p-5 text-base font-normal leading-relaxed shadow-sm transition-all duration-200 resize-y ${getFocusClasses()} touch-manipulation`}
                required
              />
            </div>

            {/* Key */}
            <div className="flex flex-col gap-2.5">
              <label className="text-gray-900 text-sm font-semibold leading-tight">Key</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => handleInputChange('key', e.target.value)}
                placeholder="e.g., C Major, D Minor"
                className={`w-full rounded-2xl text-gray-900 focus:outline-none focus:ring-4 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white h-14 placeholder:text-gray-400 px-5 text-base font-normal leading-normal shadow-sm transition-all duration-200 ${getFocusClasses()} touch-manipulation`}
              />
            </div>

            {/* Audio Upload */}
            <div className="flex flex-col gap-2.5">
              <label className="text-gray-900 text-sm font-semibold leading-tight">Audio File (Optional)</label>
              
              {!formData.audioUrl && !formData.audioFile && (
                <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${zoneTheme.border} bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 shadow-sm touch-manipulation`}>
                  <div className="flex flex-col items-center justify-center pt-6 pb-6 px-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${zoneColor}15` }}>
                      <Music className="w-7 h-7" style={{ color: zoneColor }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1 text-center">
                      <span style={{ color: zoneColor }}>Tap to upload</span> audio file
                    </p>
                    <p className="text-xs text-gray-500 text-center">MP3, WAV, M4A • Max 50MB</p>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                    disabled={uploadingAudio}
                  />
                </label>
              )}

              {uploadingAudio && (
                <div className="flex flex-col items-center justify-center w-full h-36 border-2 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-sm">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mb-3" style={{ borderTopColor: zoneColor }} />
                  <p className="text-sm font-medium text-gray-700 mb-1">Uploading audio...</p>
                  {audioUploadProgress > 0 && (
                    <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${audioUploadProgress}%`,
                          backgroundColor: zoneColor 
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {formData.audioUrl && (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-900 mb-0.5">Audio uploaded successfully</p>
                    <p className="text-xs text-green-700 truncate">Ready to submit</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAudio}
                    className="flex-shrink-0 p-2.5 active:bg-green-100 rounded-xl transition-colors touch-manipulation"
                  >
                    <X className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              )}

              {formData.audioFile && !formData.audioUrl && !uploadingAudio && (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-yellow-900 truncate mb-0.5">{formData.audioFile.name}</p>
                    <p className="text-xs text-yellow-700">Ready to upload</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAudio}
                    className="flex-shrink-0 p-2.5 active:bg-yellow-100 rounded-xl transition-colors touch-manipulation"
                  >
                    <X className="w-5 h-5 text-yellow-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="flex flex-col gap-2.5">
              <label className="text-gray-900 text-sm font-semibold leading-tight">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any other details or instructions..."
                rows={5}
                className={`w-full rounded-2xl text-gray-900 focus:outline-none focus:ring-4 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white min-h-[120px] placeholder:text-gray-400 p-5 text-base font-normal leading-relaxed shadow-sm transition-all duration-200 resize-y ${getFocusClasses()} touch-manipulation`}
              />
            </div>
          </form>
          )}
        </section>
      </main>

      {/* Fixed Footer with Submit Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button
              type="submit"
          onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim() || !formData.lyrics.trim()}
          className="flex w-full items-center justify-center rounded-2xl h-14 px-6 text-base font-bold text-white shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 touch-manipulation"
          style={{
            backgroundColor: zoneColor,
            boxShadow: `0 8px 24px ${zoneColor}40`,
          }}
            >
              {isSubmitting ? (
                <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
              <Upload className="w-5 h-5 mr-2.5" />
              <span>Submit Song</span>
                </>
              )}
            </button>
      </footer>
    </div>
  )
}
