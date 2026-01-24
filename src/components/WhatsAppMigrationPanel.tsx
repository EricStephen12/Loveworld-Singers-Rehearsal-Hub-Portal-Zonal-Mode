'use client'

import React, { useState } from 'react'
import { 
  MessageCircle, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Users,
  MessageSquare,
  Settings
} from 'lucide-react'
import { WhatsAppMigration } from '@/utils/whatsapp-migration'

export function WhatsAppMigrationPanel() {
  const [migrationStatus, setMigrationStatus] = useState<{
    users: 'pending' | 'running' | 'completed' | 'error'
    chats: 'pending' | 'running' | 'completed' | 'error'
    messages: 'pending' | 'running' | 'completed' | 'error'
    full: 'pending' | 'running' | 'completed' | 'error'
  }>({
    users: 'pending',
    chats: 'pending',
    messages: 'pending',
    full: 'pending'
  })

  const [migrationLogs, setMigrationLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addLog = (message: string) => {
    setMigrationLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runUserMigration = async () => {
    setMigrationStatus(prev => ({ ...prev, users: 'running' }))
    addLog('Starting user migration...')
    
    try {
      await WhatsAppMigration.migrateUsers()
      setMigrationStatus(prev => ({ ...prev, users: 'completed' }))
      addLog('✅ User migration completed successfully!')
    } catch (error) {
      setMigrationStatus(prev => ({ ...prev, users: 'error' }))
      addLog(`❌ User migration failed: ${error}`)
    }
  }

  const runChatMigration = async () => {
    setMigrationStatus(prev => ({ ...prev, chats: 'running' }))
    addLog('Starting chat migration...')
    
    try {
      await WhatsAppMigration.migrateChats()
      setMigrationStatus(prev => ({ ...prev, chats: 'completed' }))
      addLog('✅ Chat migration completed successfully!')
    } catch (error) {
      setMigrationStatus(prev => ({ ...prev, chats: 'error' }))
      addLog(`❌ Chat migration failed: ${error}`)
    }
  }

  const runMessageMigration = async () => {
    setMigrationStatus(prev => ({ ...prev, messages: 'running' }))
    addLog('Starting message migration...')
    
    try {
      await WhatsAppMigration.migrateMessages()
      setMigrationStatus(prev => ({ ...prev, messages: 'completed' }))
      addLog('✅ Message migration completed successfully!')
    } catch (error) {
      setMigrationStatus(prev => ({ ...prev, messages: 'error' }))
      addLog(`❌ Message migration failed: ${error}`)
    }
  }

  const runFullMigration = async () => {
    if (isRunning) return
    
    setIsRunning(true)
    setMigrationStatus({
      users: 'running',
      chats: 'pending',
      messages: 'pending',
      full: 'running'
    })
    
    addLog('🚀 Starting full WhatsApp migration for LWSRH...')
    
    try {
            addLog('Step 1/3: Migrating users...')
      await WhatsAppMigration.migrateUsers()
      setMigrationStatus(prev => ({ ...prev, users: 'completed' }))
      addLog('✅ Users migrated successfully!')
      
            setMigrationStatus(prev => ({ ...prev, chats: 'running' }))
      addLog('Step 2/3: Migrating chats...')
      await WhatsAppMigration.migrateChats()
      setMigrationStatus(prev => ({ ...prev, chats: 'completed' }))
      addLog('✅ Chats migrated successfully!')
      
            setMigrationStatus(prev => ({ ...prev, messages: 'running' }))
      addLog('Step 3/3: Migrating messages...')
      await WhatsAppMigration.migrateMessages()
      setMigrationStatus(prev => ({ ...prev, messages: 'completed' }))
      addLog('✅ Messages migrated successfully!')
      
      setMigrationStatus(prev => ({ ...prev, full: 'completed' }))
      addLog('🎉 Full WhatsApp migration completed! Your LWSRH chat system is now WhatsApp-ready!')
      
    } catch (error) {
      setMigrationStatus(prev => ({ ...prev, full: 'error' }))
      addLog(`❌ Migration failed: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-500'
      case 'running': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <MessageCircle className="w-12 h-12 text-emerald-600 mr-3" />
          <Database className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          WhatsApp Migration for LWSRH
        </h1>
        <p className="text-gray-600">
          Migrate your existing chat data to WhatsApp-style architecture for better performance and features
        </p>
      </div>

      {/* Migration Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Individual Migrations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Migrations</h3>
          
          {/* Users Migration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Migrate Users</div>
                <div className="text-sm text-gray-500">Convert chat_users to whatsapp_users</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(migrationStatus.users)}
              <button
                onClick={runUserMigration}
                disabled={isRunning || migrationStatus.users === 'running'}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Migrate
              </button>
            </div>
          </div>

          {/* Chats Migration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Migrate Chats</div>
                <div className="text-sm text-gray-500">Convert chats to whatsapp_chats</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(migrationStatus.chats)}
              <button
                onClick={runChatMigration}
                disabled={isRunning || migrationStatus.chats === 'running'}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Migrate
              </button>
            </div>
          </div>

          {/* Messages Migration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium">Migrate Messages</div>
                <div className="text-sm text-gray-500">Convert messages to whatsapp_messages</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(migrationStatus.messages)}
              <button
                onClick={runMessageMigration}
                disabled={isRunning || migrationStatus.messages === 'running'}
                className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Migrate
              </button>
            </div>
          </div>
        </div>

        {/* Full Migration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Full Migration</h3>
          
          <div className="p-6 border-2 border-emerald-200 rounded-lg bg-emerald-50">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-emerald-600" />
              <div>
                <div className="font-semibold text-emerald-800">Complete Migration</div>
                <div className="text-sm text-emerald-600">
                  Migrate all data in the correct order
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className={`flex items-center space-x-2 ${getStatusColor(migrationStatus.users)}`}>
                {getStatusIcon(migrationStatus.users)}
                <span className="text-sm">Users</span>
              </div>
              <div className={`flex items-center space-x-2 ${getStatusColor(migrationStatus.chats)}`}>
                {getStatusIcon(migrationStatus.chats)}
                <span className="text-sm">Chats</span>
              </div>
              <div className={`flex items-center space-x-2 ${getStatusColor(migrationStatus.messages)}`}>
                {getStatusIcon(migrationStatus.messages)}
                <span className="text-sm">Messages</span>
              </div>
            </div>
            
            <button
              onClick={runFullMigration}
              disabled={isRunning}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
            >
              {isRunning ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Migrating...</span>
                </div>
              ) : (
                'Start Full Migration'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Migration Logs */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-semibold">Migration Logs</h4>
          <button
            onClick={() => setMigrationLogs([])}
            className="text-gray-400 hover:text-white text-xs"
          >
            Clear
          </button>
        </div>
        <div className="h-64 overflow-y-auto space-y-1">
          {migrationLogs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Start a migration to see progress...</div>
          ) : (
            migrationLogs.map((log, index) => (
              <div key={index} className="text-xs">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Migration Instructions:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Make sure your Firebase rules are updated with the new WhatsApp collections</li>
          <li>Run the full migration to convert all existing data</li>
          <li>Test the new WhatsApp-style chat interface</li>
          <li>Once verified, you can optionally clean up old collections</li>
        </ol>
      </div>
    </div>
  )
}