'use client'

import React, { useState, useEffect } from 'react'
import { 
  Download, Upload, Database, FileText, Calendar, 
  Shield, AlertTriangle, CheckCircle, RefreshCw,
  Cloud, HardDrive, Smartphone, Monitor
} from 'lucide-react'
import { BackupService } from '@/lib/backup-service'

export default function BackupManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [backupStats, setBackupStats] = useState<any>(null)
  const [lastBackup, setLastBackup] = useState<string>('')
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)

  useEffect(() => {
    loadBackupStats()
    setLastBackup(localStorage.getItem('lastBackupDate') || 'Never')
    setAutoBackupEnabled(localStorage.getItem('autoBackupEnabled') === 'true')
  }, [])

  const loadBackupStats = async () => {
    try {
      const stats = await BackupService.getBackupStats()
      setBackupStats(stats)
    } catch (error) {
      console.error('Failed to load backup stats:', error)
    }
  }

  const handleJSONBackup = async () => {
    setIsLoading(true)
    try {
      await BackupService.downloadJSONBackup()
      const now = new Date().toISOString()
      localStorage.setItem('lastBackupDate', now)
      setLastBackup(now)
      alert('✅ JSON backup downloaded successfully!')
    } catch (error) {
      alert('❌ Failed to create JSON backup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCSVBackup = async (collection: string) => {
    setIsLoading(true)
    try {
      await BackupService.downloadCSVBackup(collection)
      alert(`✅ ${collection} CSV backup downloaded successfully!`)
    } catch (error) {
      alert(`❌ Failed to create ${collection} CSV backup`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExcelBackup = async () => {
    setIsLoading(true)
    try {
      await BackupService.exportToExcel()
    } catch (error) {
      alert('❌ Failed to create Excel backup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSheetsBackup = async () => {
    setIsLoading(true)
    try {
      await BackupService.backupToGoogleSheets()
    } catch (error) {
      alert('❌ Failed to backup to Google Sheets')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAutoBackup = () => {
    const newState = !autoBackupEnabled
    setAutoBackupEnabled(newState)
    localStorage.setItem('autoBackupEnabled', newState.toString())
    
    if (newState) {
      BackupService.setupAutoBackup()
      alert('✅ Auto-backup enabled! Backups will run every 24 hours.')
    } else {
      alert('❌ Auto-backup disabled.')
    }
  }

  const handleFileRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string
        await BackupService.restoreFromJSON(jsonData)
      } catch (error) {
        alert('❌ Failed to restore from backup file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Backup Manager</h2>
            <p className="text-sm text-gray-600">Secure your LoveWorld Singers data</p>
          </div>
        </div>
        
        <button
          onClick={loadBackupStats}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Backup Statistics */}
      {backupStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Records</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{backupStats.totalRecords}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Collections</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{backupStats.totalCollections}</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Last Backup</span>
            </div>
            <div className="text-xs font-medium text-purple-900">
              {lastBackup === 'Never' ? 'Never' : new Date(lastBackup).toLocaleDateString()}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Auto Backup</span>
            </div>
            <div className="text-sm font-bold text-orange-900">
              {autoBackupEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Export Data
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={handleJSONBackup}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-blue-900">Complete JSON Backup</div>
                <div className="text-sm text-blue-700">All data in one file</div>
              </div>
            </button>
            
            <button
              onClick={handleExcelBackup}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <Monitor className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-green-900">Excel Compatible</div>
                <div className="text-sm text-green-700">CSV files for Excel</div>
              </div>
            </button>
            
            <button
              onClick={handleGoogleSheetsBackup}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <Cloud className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-purple-900">Google Sheets</div>
                <div className="text-sm text-purple-700">Auto-sync to cloud</div>
              </div>
            </button>
          </div>
        </div>

        {/* Settings & Restore */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Settings & Restore
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-orange-900">Auto Backup</span>
                <button
                  onClick={toggleAutoBackup}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    autoBackupEnabled ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    autoBackupEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <p className="text-sm text-orange-700">
                {autoBackupEnabled ? 'Daily backups enabled' : 'Enable daily automatic backups'}
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Restore Data</span>
              </div>
              <p className="text-sm text-red-700 mb-3">
                ⚠️ Restoring will overwrite existing data. Use with caution!
              </p>
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileRestore}
                  className="hidden"
                />
                <div className="w-full p-3 bg-red-100 hover:bg-red-200 rounded-lg text-center cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 inline mr-2" />
                  <span className="text-sm font-medium text-red-800">Select Backup File</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Collection Backups */}
      {backupStats && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Collections</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(backupStats.collections).map(([collection, count]) => (
              <button
                key={collection}
                onClick={() => handleCSVBackup(collection)}
                disabled={isLoading || count === 0}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-left"
              >
                <div className="font-medium text-gray-900 capitalize text-sm">
                  {collection.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-600">{String(count)} records</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-gray-900 font-medium">Processing backup...</span>
          </div>
        </div>
      )}
    </div>
  )
}

