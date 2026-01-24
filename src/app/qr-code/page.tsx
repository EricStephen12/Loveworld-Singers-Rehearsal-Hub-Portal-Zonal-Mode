'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Camera, X, CheckCircle, AlertCircle, Scan } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ScreenHeader } from '@/components/ScreenHeader'
import { AttendanceService } from '@/lib/attendance-service'

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastScanTime, setLastScanTime] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; time: string; success: boolean }>>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Auto-start camera when page loads
    startCamera()

    return () => {
      stopCamera()
    }
  }, [])

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
      alert('Unable to access camera. Please check permissions.')
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
    const scanTime = new Date().toLocaleTimeString()

    try {
      // Get current user ID (you'll need to implement this)
      const userId = 'current-user-id' // Replace with actual user ID

      const result = await AttendanceService.checkIn(userId, qrCode)

      // Add to scan history
      setScanHistory(prev => [{
        code: qrCode,
        time: scanTime,
        success: result.success
      }, ...prev.slice(0, 9)]) // Keep last 10 scans

      setLastScanTime(scanTime)

      if (result.success) {
        alert(`✅ ${result.message}`)
      } else {
        alert(`❌ ${result.message}`)
      }
    } catch (error) {
      alert('❌ Failed to process QR code')
      setScanHistory(prev => [{
        code: qrCode,
        time: scanTime,
        success: false
      }, ...prev.slice(0, 9)])
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

  const handleBack = () => {
    stopCamera()
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScreenHeader
        title="QR Code Scanner"
        showBackButton={true}
        backPath="/home"
        onBackClick={handleBack}
      />

      <div className="p-4">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Camera Scanner</h2>
              <div className="flex items-center space-x-2">
                {isScanning && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Live</span>
                  </div>
                )}
                <button
                  onClick={isScanning ? stopCamera : startCamera}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {isScanning ? 'Stop' : 'Start'}
                </button>
              </div>
            </div>
          </div>

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
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
              className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Scan className="w-5 h-5" />
              <span>Enter QR Code Manually</span>
            </button>

            {/* Processing State */}
            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">Processing QR code...</span>
              </div>
            )}

            {/* Last Scan Result */}
            {lastScanTime && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 text-sm">Last scan: {lastScanTime}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Scans</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {scanHistory.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${scan.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 font-mono">{scan.code}</p>
                        <p className="text-xs text-gray-500">{scan.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${scan.success ? 'text-green-600' : 'text-red-600'}`}>
                        {scan.success ? 'Success' : 'Failed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">How to use:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Point your camera at the QR code</li>
            <li>• Make sure the code is clearly visible</li>
            <li>• Or use the manual input option</li>
            <li>• Check the scan history for recent results</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
