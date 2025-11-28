'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock, MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { submitSong, getUserSubmissions, deleteUserSubmission, SongSubmission } from '@/lib/song-submission-service'
import { useZone } from '@/hooks/useZone'
import { getZoneTheme } from '@/utils/zone-theme'

interface SongSubmissionForm {
  title: string
  writer: string
  leadSinger: string
  lyrics: string
  key: string
  notes: string
}

export default function SubmitSongPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  
  // Get zone color and theme for theming
  const zoneColor = currentZone?.themeColor || '#9333EA'
  const zoneTheme = getZoneTheme(zoneColor)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [mySubmissions, setMySubmissions] = useState<SongSubmission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [showMySubmissions, setShowMySubmissions] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
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
    notes: ''
  })

  useEffect(() => {
    const userName = getUserName()
    if (userName && !formData.writer) {
      setFormData(prev => ({ ...prev, writer: userName }))
    }
  }, [profile, user])

  // Load user's submissions
  useEffect(() => {
    if (user?.uid) {
      loadMySubmissions()
    }
  }, [user?.uid])

  const loadMySubmissions = async () => {
    if (!user?.uid) return
    setLoadingSubmissions(true)
    try {
      const submissions = await getUserSubmissions(user.uid)
      setMySubmissions(submissions)
    } catch (error) {
      console.error('Error loading submissions:', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
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
        // CRITICAL: Zone tracking
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        submittedBy: {
          userId: user.uid,
          userName: getUserName() || user.email || 'Unknown',
          email: user.email || '',
          submittedAt: new Date().toISOString()
        }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit song')
      }

      setSubmitStatus('success')
      
      // Reload submissions to show the new one
      loadMySubmissions()
      setShowMySubmissions(true)
      
      setTimeout(() => {
        setFormData({
          title: '',
          writer: getUserName(),
          leadSinger: '',
          lyrics: '',
          key: '',
          notes: ''
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

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-gray-50/80 backdrop-blur-sm p-4 justify-between border-b" style={{ borderColor: `${zoneColor}20` }}>
            <button
              onClick={() => router.back()}
          className="flex size-10 shrink-0 items-center justify-center text-gray-900"
            >
          <ArrowLeft className="w-5 h-5" />
            </button>
        <h1 className="text-gray-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Submit a Song
        </h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <section className="flex flex-col gap-6 p-4">
          {/* Status Messages */}
        {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Song submitted successfully!</p>
              <p className="text-sm text-green-700">Your song is now under review.</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="font-medium text-red-900">Failed to submit song. Please try again.</p>
          </div>
        )}

          {/* My Submissions Section */}
          {mySubmissions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowMySubmissions(!showMySubmissions)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${zoneColor}20` }}>
                    <Clock className="w-5 h-5" style={{ color: zoneColor }} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">My Submissions</p>
                    <p className="text-sm text-gray-500">{mySubmissions.length} song{mySubmissions.length !== 1 ? 's' : ''} submitted</p>
                  </div>
                </div>
                {showMySubmissions ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showMySubmissions && (
                <div className="border-t border-gray-200 divide-y divide-gray-100">
                  {mySubmissions.map((submission) => (
                    <div key={submission.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{submission.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Submitted {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                      
                      {/* Show admin reply if exists */}
                      {submission.replyMessage && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-800">Admin Reply</span>
                          </div>
                          <p className="text-sm text-purple-900">{submission.replyMessage}</p>
                        </div>
                      )}
                      
                      {/* Show rejection reason if rejected */}
                      {submission.status === 'rejected' && submission.reviewNotes && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-semibold text-red-800">Rejection Reason</span>
                          </div>
                          <p className="text-sm text-red-900">{submission.reviewNotes}</p>
                        </div>
                      )}
                      
                      {/* Show approval message */}
                      {submission.status === 'approved' && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-800">Your song has been approved and added to the collection!</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Delete button - only for pending submissions */}
                      {submission.status === 'pending' && submission.id && (
                        <button
                          onClick={() => handleDeleteSubmission(submission.id!)}
                          disabled={deletingId === submission.id}
                          className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === submission.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete Submission
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Song Title */}
            <div className="flex flex-col">
              <p className="text-gray-900 text-base font-medium leading-normal pb-2">
                Song Title <span className="text-red-500">*</span>
              </p>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter the title of the song"
                className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-2 focus:ring-2 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm ${getFocusClasses()}`}
                required
              />
            </div>

            {/* Writer */}
            <div className="flex flex-col">
              <p className="text-gray-900 text-base font-medium leading-normal pb-2">Writer/Composer</p>
              <input
                type="text"
                value={formData.writer}
                onChange={(e) => handleInputChange('writer', e.target.value)}
                placeholder="Enter writer's name"
                className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-2 focus:ring-2 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm ${getFocusClasses()}`}
              />
            </div>

            {/* Lead Singer */}
            <div className="flex flex-col">
              <p className="text-gray-900 text-base font-medium leading-normal pb-2">Lead Singer</p>
              <input
                type="text"
                value={formData.leadSinger}
                onChange={(e) => handleInputChange('leadSinger', e.target.value)}
                placeholder="Enter lead singer's name"
                className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-2 focus:ring-2 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm ${getFocusClasses()}`}
              />
            </div>

            {/* Lyrics */}
            <div className="flex flex-col">
              <p className="text-gray-900 text-base font-medium leading-normal pb-2">
                Lyrics <span className="text-red-500">*</span>
              </p>
              <textarea
                value={formData.lyrics}
                onChange={(e) => handleInputChange('lyrics', e.target.value)}
                placeholder="Enter the song lyrics..."
                rows={10}
                className={`flex w-full min-w-0 flex-1 resize-y rounded-xl text-gray-900 focus:outline-2 focus:ring-2 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white min-h-[200px] placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm ${getFocusClasses()}`}
                required
              />
            </div>

            {/* Key */}
            <div className="flex flex-col">
              <p className="text-gray-900 text-base font-medium leading-normal pb-2">Key</p>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => handleInputChange('key', e.target.value)}
                placeholder="e.g., C Major, D Minor"
                className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-2 focus:ring-2 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm ${getFocusClasses()}`}
              />
            </div>

            {/* Additional Notes */}
            <div className="flex flex-col">
              <p className="text-gray-900 text-base font-medium leading-normal pb-2">Additional Notes</p>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any other details or instructions..."
                rows={6}
                className={`flex w-full min-w-0 flex-1 resize-y rounded-xl text-gray-900 focus:outline-2 focus:ring-2 border-2 ${zoneTheme.border} focus:${zoneTheme.focusBorder.replace('focus:', '')} bg-white min-h-[120px] placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm ${getFocusClasses()}`}
              />
            </div>
          </form>
        </section>
      </main>

      {/* Fixed Footer with Submit Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
          onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim() || !formData.lyrics.trim()}
          className="flex w-full items-center justify-center rounded-2xl h-14 px-6 text-base font-bold text-white shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: zoneColor,
            boxShadow: `0 10px 25px ${zoneColor}30`,
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.filter = 'brightness(0.9)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
            >
              {isSubmitting ? (
                <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
              <Upload className="w-5 h-5 mr-2" />
              Submit
                </>
              )}
            </button>
      </footer>
    </div>
  )
}
