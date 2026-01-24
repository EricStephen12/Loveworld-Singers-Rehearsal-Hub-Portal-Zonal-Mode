'use client'

import { useState } from 'react'
import { Shield, RefreshCw } from 'lucide-react'
import { bulkRecoverProfiles, generateRecoveryReport } from '@/utils/bulk-profile-recovery'

export default function ProfileRecoveryButton() {
  const [isRecovering, setIsRecovering] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showReport, setShowReport] = useState(false)

  const handleRecovery = async () => {
    if (!confirm('This will scan and recover all incomplete user profiles. Continue?')) {
      return
    }

    setIsRecovering(true)
    setResult(null)

    try {
      const recoveryResult = await bulkRecoverProfiles()
      setResult(recoveryResult)
      setShowReport(true)
      
      alert(`Recovery complete!\n\nRecovered: ${recoveryResult.recovered}\nFailed: ${recoveryResult.failed}\nSkipped: ${recoveryResult.skipped}`)
    } catch (error: any) {
      alert(`Recovery failed: ${error.message}`)
      console.error('Recovery error:', error)
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleRecovery}
        disabled={isRecovering}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isRecovering ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Recovering Profiles...</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Recover Incomplete Profiles</span>
          </>
        )}
      </button>

      {showReport && result && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Recovery Report</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Checked:</span>
              <span className="font-medium">{result.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Recovered:</span>
              <span className="font-medium text-green-600">{result.recovered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Failed:</span>
              <span className="font-medium text-red-600">{result.failed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Skipped:</span>
              <span className="font-medium">{result.skipped}</span>
            </div>
          </div>
          
          <button
            onClick={() => {
              const report = generateRecoveryReport(result)
              alert('Full report logged to console')
            }}
            className="mt-4 text-sm text-purple-600 hover:text-purple-700"
          >
            View Full Report in Console
          </button>
        </div>
      )}
    </div>
  )
}
