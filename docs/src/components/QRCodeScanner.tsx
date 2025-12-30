'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react'
import { AttendanceService } from '@/lib/attendance-service'

interface QRCodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function QRCodeScanner({ isOpen, onClose, onSuccess, onError }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
        startQRDetection()
      }
    } catch (error) {
      console.error('Camera access error:', error)
      onError('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const detectQR = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Simple QR detection (in production, use a proper QR library)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const qrCode = detectQRCodePattern(imageData)
        
        if (qrCode && qrCode !== scanResult) {
          setScanResult(qrCode)
          handleQRCodeDetected(qrCode)
        }
      }

      if (isScanning) {
        requestAnimationFrame(detectQR)
      }
    }

    detectQR()
  }

  // Simplified QR code detection (in production, use a proper library)
  const detectQRCodePattern = (imageData: ImageData): string | null => {
    // This is a placeholder - in production you'd use a proper QR detection library
    // For now, we'll simulate detection with a manual input
    return null
  }

  const handleQRCodeDetected = async (qrCode: string) => {
    setIsProcessing(true)
    stopCamera()

    try {
      // Get current user ID (you'll need to implement this)
      const userId = 'current-user-id' // Replace with actual user ID
      
      const result = await AttendanceService.checkIn(userId, qrCode)
      
      if (result.success) {
        onSuccess(result.message)
      } else {
        onError(result.message)
      }
    } catch (error) {
      onError('Failed to process QR code')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualInput = () => {
    const qrCode = prompt('Enter QR code manually:')
    if (qrCode) {
      handleQRCodeDetected(qrCode)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner */}
        <div className="p-4">
          {isScanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-100 rounded-lg object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg bg-transparent">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Manual Input Button */}
          <button
            onClick={handleManualInput}
            className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Enter QR Code Manually
          </button>

          {/* Processing State */}
          {isProcessing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-700">Processing QR code...</span>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-sm text-gray-600">
            <p>• Point your camera at the QR code</p>
            <p>• Make sure the code is clearly visible</p>
            <p>• Or use the manual input option</p>
          </div>
        </div>
      </div>
    </div>
  )
}
