'use client'

import React, { useState } from 'react'
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { WhatsAppMigration } from '@/utils/whatsapp-migration'

export function QuickMigrationButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const runMigration = async () => {
    setStatus('running')
    setMessage('Starting WhatsApp migration...')
    
    try {
      await WhatsAppMigration.runFullMigration()
      setStatus('success')
      setMessage('Migration completed! Your chat system is now WhatsApp-ready! 🎉')
    } catch (error) {
      setStatus('error')
      setMessage(`Migration failed: ${error}`)
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  const getButtonColor = () => {
    switch (status) {
      case 'running':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'success':
        return 'bg-green-500 hover:bg-green-600'
      case 'error':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-emerald-500 hover:bg-emerald-600'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 max-w-sm">
        <div className="flex items-center space-x-2 mb-2">
          {getIcon()}
          <span className="font-semibold text-sm">WhatsApp Migration</span>
        </div>
        
        {message && (
          <p className="text-xs text-gray-600 mb-3">{message}</p>
        )}
        
        <button
          onClick={runMigration}
          disabled={status === 'running'}
          className={`w-full py-2 px-4 text-white text-sm rounded-lg transition-colors ${getButtonColor()} disabled:opacity-50`}
        >
          {status === 'running' ? 'Migrating...' : 
           status === 'success' ? 'Migration Complete!' :
           status === 'error' ? 'Retry Migration' :
           'Start Migration'}
        </button>
        
        {status !== 'idle' && (
          <button
            onClick={() => {
              setStatus('idle')
              setMessage('')
            }}
            className="w-full mt-2 py-1 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}