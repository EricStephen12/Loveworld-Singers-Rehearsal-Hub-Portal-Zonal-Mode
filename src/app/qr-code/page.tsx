'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AttendanceService } from '@/lib/attendance-service'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import jsQR from 'jsqr'

type ScanStatus = 'idle' | 'processing' | 'success' | 'failed'

export default function QRScannerPage() {
  const { user } = useAuth()
  const { isSuperAdmin, isZoneCoordinator, isLoading: zoneLoading } = useZone()
  const router = useRouter()

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastScanTimeRef = useRef<number>(0)
  const statusRef = useRef<ScanStatus>('idle') // Ref for sync in anim frame

  // Auto-start camera when authorized
  useEffect(() => {
    if (!zoneLoading) {
      if (isSuperAdmin || isZoneCoordinator) {
        startCamera()
      }
    }
    return () => stopCamera()
  }, [zoneLoading, isSuperAdmin, isZoneCoordinator])

  // Sync state to ref for the animation loop
  useEffect(() => {
    statusRef.current = scanStatus
  }, [scanStatus])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 720 } }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute("playsinline", "true")
        await videoRef.current.play()
        streamRef.current = stream
        requestAnimationFrame(detectQR)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setStatusMessage('Camera access denied.')
      setScanStatus('failed')
    }
  }

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const detectQR = useCallback(() => {
    // Only detect if camera is ready and we aren't already processing or showing a result
    if (!videoRef.current || !canvasRef.current || statusRef.current !== 'idle') {
      if (statusRef.current === 'idle') {
        animationFrameRef.current = requestAnimationFrame(detectQR)
      }
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) return

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })

      const now = Date.now()
      if (code && code.data && (now - lastScanTimeRef.current > 3000)) {
        lastScanTimeRef.current = now
        handleQRCodeDetected(code.data)
        return // Break out of anim loop while processing
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectQR)
  }, [])

  const playBeep = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      if (type === 'success') {
        oscillator.type = 'sine'
        oscillator.frequency.value = 800
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.1)
      } else {
        oscillator.type = 'sawtooth'
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3)
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.3)
      }
    } catch (e) {
      // Ignore audio errors
    }
  }

  const handleQRCodeDetected = async (qrCode: string) => {
    setScanStatus('processing')

    try {
      const adminId = user?.uid || 'anonymous-admin'
      const result = await AttendanceService.checkIn(adminId, qrCode)

      if (result.success) {
        setScanStatus('success')
        setStatusMessage(result.message) // Already contains user name
        playBeep('success')
      } else {
        setScanStatus('failed')
        setStatusMessage(result.message || 'Verification Failed')
        playBeep('error')
      }
    } catch (error) {
      setScanStatus('failed')
      setStatusMessage('Network Error or Invalid Code')
      playBeep('error')
    }

    // Reset back to idle after 2.5 seconds to scan again
    setTimeout(() => {
      setScanStatus('idle')
      setStatusMessage('')
      animationFrameRef.current = requestAnimationFrame(detectQR)
    }, 2500)
  }

  const handleBack = () => {
    stopCamera()
    router.back()
  }

  // Handle loading state
  if (zoneLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Handle unauthorized state
  if (!isSuperAdmin && !isZoneCoordinator) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-6 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 mb-8">You must be an Admin or Zone Coordinator to access the attendance scanner.</p>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-colors border border-white/10"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans z-50 overflow-hidden">
      {/* Back ButtonOverlay */}
      <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-start">
        <button
          onClick={handleBack}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-95 border border-white/10 shadow-xl"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Scanner Viewport */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${scanStatus === 'idle' ? 'opacity-100' : 'opacity-40 blur-sm'}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Framing Overlay for Idle state */}
        {scanStatus === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Simple Laser Line */}
            <div className="w-[70%] max-w-[300px] h-[2px] bg-red-500 shadow-[0_0_15px_4px_rgba(239,68,68,0.6)] animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Status Overlays */}
        {scanStatus !== 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
            {scanStatus === 'processing' && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-xl font-bold text-white tracking-wide">Scanning...</h2>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="flex flex-col items-center p-8 bg-green-500/20 backdrop-blur-lg border border-green-500/30 rounded-[3rem] shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.6)]">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                  {statusMessage}
                </h2>
              </div>
            )}

            {scanStatus === 'failed' && (
              <div className="flex flex-col items-center p-8 bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-[3rem] shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.6)]">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-wide mb-2">FAILED</h2>
                <p className="text-red-200 text-lg">{statusMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0%, 100% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(100px); opacity: 1; }
          90% { transform: translateY(-100px); opacity: 1; }
        }
      `}} />
    </div>
  )
}
