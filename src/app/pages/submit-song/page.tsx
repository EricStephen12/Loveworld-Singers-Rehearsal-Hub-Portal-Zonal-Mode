'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { submitSong } from '@/lib/song-submission-service'
import { useZone } from '@/contexts/ZoneContext'

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
  
  // Get zone color for theming
  const zoneColor = currentZone?.themeColor || '#9333EA'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
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
      <header className="sticky top-0 z-10 flex items-center bg-gray-50/80 backdrop-blur-sm p-4 justify-between border-b border-gray-200">
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
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-2 focus:outline-purple-600 focus:ring-2 focus:ring-purple-600 border-2 border-gray-300 bg-white h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm"
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
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-2 focus:outline-purple-600 focus:ring-2 focus:ring-purple-600 border-2 border-gray-300 bg-white h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm"
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
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-2 focus:outline-purple-600 focus:ring-2 focus:ring-purple-600 border-2 border-gray-300 bg-white h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm"
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
                className="flex w-full min-w-0 flex-1 resize-y rounded-xl text-gray-900 focus:outline-2 focus:outline-purple-600 focus:ring-2 focus:ring-purple-600 border-2 border-gray-300 bg-white min-h-[200px] placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm"
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
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-2 focus:outline-purple-600 focus:ring-2 focus:ring-purple-600 border-2 border-gray-300 bg-white h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm"
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
                className="flex w-full min-w-0 flex-1 resize-y rounded-xl text-gray-900 focus:outline-2 focus:outline-purple-600 focus:ring-2 focus:ring-purple-600 border-2 border-gray-300 bg-white min-h-[120px] placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm"
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
