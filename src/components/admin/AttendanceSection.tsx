import { useState, useEffect, useMemo } from 'react'
import { useZone } from '@/hooks/useZone'
import { AttendanceService, AttendanceRecord } from '@/lib/attendance-service'
import { Calendar, Search, CheckCircle, Clock, XCircle, FileSpreadsheet, Download, RefreshCw, Users, TrendingUp, Plus, Printer, LogOut, AlertCircle, Check, AlertTriangle, UserCheck, UserX, Edit2 } from 'lucide-react'
import CustomLoader from '@/components/CustomLoader'
import { isHQGroup } from '@/config/zones'
import { BackendAPI } from '@/lib/api-client'

export default function AttendanceSection() {
  const { currentZone } = useZone()
  const [attendanceRecords, setAttendanceRecords] = useState<(AttendanceRecord & { user_name: string })[]>([])
  const [allRecords, setAllRecords] = useState<(AttendanceRecord & { user_name: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all') // 'all', 'active', 'completed'
  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'))

  // Manual Check-In Modal State
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualEvent, setManualEvent] = useState('Rehearsal')
  const [manualStatus, setManualStatus] = useState<'present' | 'absent'>('present')
  const [submittingManual, setSubmittingManual] = useState(false)
  const [manualIsCustom, setManualIsCustom] = useState(false)

  // Edit Event State
  const [showEditModal, setShowEditModal] = useState(false)
  const [bulkEditEventName, setBulkEditEventName] = useState('')
  const [submittingEdit, setSubmittingEdit] = useState(false)
  const [bulkIsCustom, setBulkIsCustom] = useState(false)

  const themeColor = currentZone?.themeColor || '#9333EA'
  const isHQ = isHQGroup(currentZone?.id)

  const recentEvents = useMemo(() => {
    const events = Array.from(new Set(allRecords.map(r => r.event_name).filter(Boolean))) as string[];
    return events.length > 0 ? events : ['Rehearsal'];
  }, [allRecords]);

  const presentCount = attendanceRecords.filter(r => r.check_in_time && !r.check_out_time).length
  const clockedOutCount = attendanceRecords.filter(r => r.check_out_time).length
  const totalCount = attendanceRecords.length
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + clockedOutCount) / totalCount) * 100) : 0

  useEffect(() => {
    loadAttendance()
  }, [currentZone, selectedDate])

  const loadAttendance = async (silent = false) => {
    if (!currentZone) return
    if (!silent && allRecords.length === 0) setLoading(true)
    try {
      const records = await AttendanceService.getZoneAttendance(currentZone.id, isHQ, 2000)
      setAllRecords(records)

      let filteredByDate = records.filter(r => {
        if (!r.date_string && r.check_in_time) {
          return new Date(r.check_in_time).toLocaleDateString('en-CA') === selectedDate
        }
        return r.date_string === selectedDate
      })

      setAttendanceRecords(filteredByDate)
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualName.trim() || !currentZone) return

    setSubmittingManual(true)
    try {
      const mockUserId = 'manual-' + Math.random().toString(36).substring(2, 10)
      const newRecord = {
        userId: mockUserId,
        user_id: mockUserId,
        userName: manualName.trim(),
        user_name: manualName.trim(),
        eventName: manualEvent.trim() || 'Rehearsal',
        event_name: manualEvent.trim() || 'Rehearsal',
        status: manualStatus,
        zoneId: currentZone.id,
        qrCode: `LW-MANUAL-${mockUserId}-${Date.now()}`,
        timestamp: new Date(),
        check_in_time: manualStatus === 'present' ? new Date().toISOString() : undefined
      }

      await BackendAPI.generic.create('attendance', newRecord)
      setShowManualModal(false)
      setManualName('')
      await loadAttendance(true)
    } catch (error) {
      console.error('Manual check-in error:', error)
      alert('Failed to record manual check-in.')
    } finally {
      setSubmittingManual(false)
    }
  }

  const handleManualClockOut = async (recordId: string) => {
    try {
      const checkoutTime = new Date().toISOString()
      await BackendAPI.generic.update('attendance', recordId, { check_out_time: checkoutTime })
      
      setAttendanceRecords(prev => 
        prev.map(r => r.id === recordId ? { ...r, check_out_time: checkoutTime } : r)
      )
    } catch (error) {
      console.error('Manual clock out error:', error)
      alert('Failed to clock out member.')
    }
  }

  const handleBulkEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkEditEventName.trim() || filteredRecords.length === 0) return

    setSubmittingEdit(true)
    try {
      const newEventName = bulkEditEventName.trim()
      
      // Update in batches of 10
      const batchSize = 10
      for (let i = 0; i < filteredRecords.length; i += batchSize) {
        const batch = filteredRecords.slice(i, i + batchSize)
        await Promise.all(batch.map(r => 
          BackendAPI.generic.update('attendance', r.id, { 
            event_name: newEventName,
            eventName: newEventName 
          })
        ))
      }
      
      setShowEditModal(false)
      setBulkEditEventName('')
      await loadAttendance(true) // Reload silently to get fresh data
      alert(`Successfully updated ${filteredRecords.length} records to "${newEventName}"!`)
    } catch (error) {
      console.error('Bulk edit error:', error)
      alert('Failed to update event names.')
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleExportCSV = () => {
    if (attendanceRecords.length === 0) return
    const headers = ['Member Name', 'Event Name', 'Date', 'Clock In', 'Clock Out', 'Status', 'Zone/HQ']
    const csvData = attendanceRecords.map(record => {
      const date = new Date(record.check_in_time || record.created_at || 0)
      const clockIn = record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'
      const clockOut = record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'
      return [
        `"${record.user_name || 'Member'}"`,
        `"${record.event_name || 'Rehearsal'}"`,
        `"${date.toLocaleDateString()}"`,
        `"${clockIn}"`,
        `"${clockOut}"`,
        `"${record.status}"`,
        `"${isHQ ? 'HQ' : 'Zone'}"`
      ].join(',')
    })
    const csvContent = [headers.join(','), ...csvData].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `attendance_${selectedDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleArchiveRecords = async () => {
    if (!currentZone || allRecords.length === 0) return;
    const confirmArchive = window.confirm("Are you sure you want to archive all visible records? This will clear the current view and start fresh. Archived records are kept in the database but won't show here.");
    if (!confirmArchive) return;
    
    setLoading(true);
    try {
      // Archive records in batches
      const batchSize = 10;
      for (let i = 0; i < allRecords.length; i += batchSize) {
        const batch = allRecords.slice(i, i + batchSize);
        await Promise.all(batch.map(r => 
          BackendAPI.generic.update('attendance', r.id, { archived: true })
        ));
      }
      
      alert("Records successfully archived!");
      await loadAttendance(true);
    } catch (error) {
      console.error("Archive error:", error);
      alert("An error occurred while archiving some records.");
      setLoading(false);
    }
  }

  // Cumulative calculations
  const cumulativeData = useMemo(() => {
    if (viewMode !== 'cumulative') return []
    const eventDates: Record<string, Set<string>> = {}
    const userEventCounts: Record<string, { user_name: string, event_name: string, count: number }> = {}

    allRecords.forEach(r => {
      // Only count present check-ins
      if (r.status === 'absent') return;
      
      const eventName = r.event_name || 'Rehearsal'
      const date = r.date_string || (r.check_in_time ? new Date(r.check_in_time).toLocaleDateString('en-CA') : 'unknown')
      
      if (!eventDates[eventName]) eventDates[eventName] = new Set()
      eventDates[eventName].add(date)

      const userKey = `${r.user_id || r.user_name}_${eventName}`
      if (!userEventCounts[userKey]) {
        userEventCounts[userKey] = { user_name: r.user_name || 'Unknown', event_name: eventName, count: 0 }
      }
      userEventCounts[userKey].count++
    })

    // Add absent counts to total possible dates logic
    allRecords.forEach(r => {
      const eventName = r.event_name || 'Rehearsal'
      const date = r.date_string || (r.check_in_time ? new Date(r.check_in_time).toLocaleDateString('en-CA') : 'unknown')
      if (!eventDates[eventName]) eventDates[eventName] = new Set()
      eventDates[eventName].add(date)
    })

    return Object.values(userEventCounts).map(u => ({
      ...u,
      totalPossible: eventDates[u.event_name].size
    })).filter(u => 
      u.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.event_name.localeCompare(b.event_name) || b.count - a.count)
  }, [viewMode, allRecords, searchTerm])

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const matchesSearch = record.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) return false

      // A record is only "live" if it has no checkout time AND the check-in occurred today
      const isLive = !record.check_out_time && record.check_in_time && 
                     (new Date(record.check_in_time).toDateString() === new Date().toDateString())

      if (filterStatus === 'active') return isLive
      if (filterStatus === 'completed') return !!record.check_out_time || (!isLive && record.check_in_time)
      return true
    })
  }, [attendanceRecords, searchTerm, filterStatus])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white min-h-[400px]">
        <CustomLoader message="Loading attendance records..." />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 pb-24 lg:pb-8 print:bg-white print:pb-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-5 lg:pt-8 print:px-0 print:pt-0">

        {/* ── View Mode Tabs ── */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto scrollbar-hide print:hidden">
          <button
            onClick={() => setViewMode('daily')}
            className={`pb-3 px-1 border-b-2 font-bold text-sm mr-8 whitespace-nowrap transition-colors ${
              viewMode === 'daily' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Daily Log
          </button>
          <button
            onClick={() => setViewMode('cumulative')}
            className={`pb-3 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${
              viewMode === 'cumulative' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Cumulative Scores
          </button>
        </div>

        {/* ── Header Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Attendance Sheet</h1>
              <span
                className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm"
                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                {isHQ ? 'HQ Global' : currentZone?.name || 'Zone'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              {viewMode === 'daily' 
                ? (isHQ ? 'Global live clock-in monitoring across all zones' : 'Live rehearsal attendance and QR scan verification')
                : 'All-time aggregated scores and program participation tracking'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {viewMode === 'daily' ? (
              <>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:outline-none bg-white shadow-sm hover:border-slate-300 transition-all"
                  style={{ ['--tw-ring-color' as any]: themeColor }}
                />
                
                <button
                  onClick={() => setShowManualModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-2xl shadow-lg transition-all active:scale-95 hover:shadow-md"
                  style={{ backgroundColor: themeColor }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Manual Check-In</span>
                </button>

                <button
                  onClick={handlePrint}
                  disabled={filteredRecords.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-2xl border border-slate-200 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  onClick={() => {
                    setBulkEditEventName(filteredRecords[0]?.event_name || 'Rehearsal')
                    setShowEditModal(true)
                  }}
                  disabled={filteredRecords.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-bold rounded-2xl border border-indigo-200 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                  title="Rename Event Title for all currently filtered records"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Rename Event</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleExportCSV}
                  disabled={attendanceRecords.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                <button
                  onClick={handleArchiveRecords}
                  disabled={allRecords.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold rounded-2xl border border-rose-200 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                  title="Archive records to start a fresh ministry year"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Archive Year</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Stats — horizontal scroll on mobile (Only in Daily View) ── */}
        {viewMode === 'daily' && (
          <div className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible mb-6 scrollbar-hide print:hidden">
            {/* Total */}
            <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-3xl p-5 border border-slate-100 border-l-[4px] border-l-slate-400 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Checked In</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalCount}</p>
            </div>

            {/* Active Now */}
            <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-3xl p-5 border border-slate-100 border-l-[4px] border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active Now</p>
              <p className="text-3xl font-black text-emerald-700 mt-1">{presentCount}</p>
            </div>

            {/* Clocked Out */}
            <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-3xl p-5 border border-slate-100 border-l-[4px] border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Clocked Out</p>
              <p className="text-3xl font-black text-blue-700 mt-1">{clockedOutCount}</p>
            </div>
          </div>
        )}

        {/* ── Search + Filters ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-6 print:hidden">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Segmented Filter Tabs (Only in Daily View) */}
            {viewMode === 'daily' ? (
              <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto w-full lg:w-auto scrollbar-hide">
                {[
                  { id: 'all', label: 'All', count: totalCount },
                  { id: 'active', label: 'Active', count: presentCount },
                  { id: 'completed', label: 'Completed', count: clockedOutCount }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      filterStatus === tab.id
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                      filterStatus === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="hidden lg:block w-auto" /> // Spacer for layout in cumulative view
            )}

            {/* Search Container */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:flex-1 lg:max-w-md ml-auto">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search member or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 bg-slate-50 hover:bg-slate-100/50 transition-all font-medium"
                />
              </div>
              {viewMode === 'daily' && (
                <button
                  onClick={() => {
                    setSelectedDate(new Date().toLocaleDateString('en-CA'))
                    loadAttendance(true)
                  }}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-colors active:scale-95 flex-shrink-0"
                  title="Refresh Live Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="sm:hidden">Refresh</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Table / Empty State ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
          {viewMode === 'cumulative' ? (
            /* Cumulative Table */
            <>
              {cumulativeData.length > 0 && (
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Showing {cumulativeData.length} Member{cumulativeData.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    All-time Program Cumulative
                  </p>
                </div>
              )}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                {cumulativeData.length > 0 ? (
                  <table className="w-full min-w-[768px] text-left">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 print:bg-white print:border-b-2 print:border-black">
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Event Name</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 print:divide-black/20">
                      {cumulativeData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm print:hidden"
                                style={{ backgroundColor: themeColor }}
                              >
                                {(item.user_name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <p className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                                {item.user_name}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/60">
                              {item.event_name}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="font-black text-lg text-slate-900">
                              {item.count} <span className="text-sm text-slate-400 font-bold">/ {item.totalPossible}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${Math.round((item.count / item.totalPossible) * 100)}%`,
                                    backgroundColor: Math.round((item.count / item.totalPossible) * 100) >= 80 ? '#10B981' : Math.round((item.count / item.totalPossible) * 100) >= 50 ? '#F59E0B' : '#EF4444'
                                  }} 
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-600">
                                {Math.round((item.count / item.totalPossible) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-inner">
                      <TrendingUp className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-lg font-black text-slate-800 tracking-tight">No cumulative records found</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Daily Log Table */
            <>
              {filteredRecords.length > 0 && (
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Showing {filteredRecords.length} Member{filteredRecords.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                {filteredRecords.length > 0 ? (
                  <table className="w-full min-w-[768px] text-left">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 print:bg-white print:border-b-2 print:border-black">
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Clock In</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Clock Out</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 print:divide-black/20">
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                          {/* Member */}
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm print:hidden"
                                style={{ backgroundColor: themeColor }}
                              >
                                {(record.user_name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                                  {record.user_name || 'Unknown Member'}
                                </p>
                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-tight mt-0.5 print:hidden">
                                  ID: {record.user_id?.substring(0, 8)}…
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* Event */}
                          <td className="px-6 py-4.5">
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200/60 print:border-none print:bg-transparent print:px-0">
                              {record.event_name || 'Rehearsal'}
                            </span>
                          </td>
                          {/* Status Badge */}
                          <td className="px-6 py-4.5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                              record.status === 'absent'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {record.status === 'absent' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              {record.status === 'absent' ? 'Absent' : 'Present'}
                            </span>
                          </td>
                          {/* Clock In */}
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse print:hidden" />
                              <span className="font-bold text-sm text-slate-800 tabular-nums">
                                {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </span>
                            </div>
                          </td>
                          {/* Clock Out */}
                          <td className="px-6 py-4.5">
                            {record.check_out_time ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 print:hidden" />
                                <span className="font-bold text-sm text-slate-800 tabular-nums">
                                  {new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ) : (record.check_in_time && new Date(record.check_in_time).toDateString() === new Date().toDateString()) ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 print:border-none print:bg-transparent print:px-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping print:hidden" />
                                Active Rehearsal
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 print:border-none print:bg-transparent print:px-0">
                                No Check-Out
                              </span>
                            )}
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4.5 text-right print:hidden">
                            {!record.check_out_time && (record.check_in_time && new Date(record.check_in_time).toDateString() === new Date().toDateString()) ? (
                              <button
                                onClick={() => handleManualClockOut(record.id)}
                                className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm"
                                title="Manually Clock Out Member"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Clock Out</span>
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 italic">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-inner">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-lg font-black text-slate-800 tracking-tight">No attendance records found</p>
                    <p className="text-sm text-slate-400 mt-1 font-medium max-w-sm mx-auto">
                      {searchTerm ? 'No members match your search criteria. Try clearing your filters.' : 'Use the QR Code scanner or Manual Check-In to start recording attendance.'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Manual Check-In Modal ── */}
      {showManualModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowManualModal(false)} />

          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Manual Check-In</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Instantly log attendance without a QR scan</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <Plus className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Member Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Event Title</label>
                {!manualIsCustom ? (
                  <select
                    value={manualEvent}
                    onChange={(e) => {
                      if (e.target.value === '___custom___') {
                        setManualIsCustom(true)
                        setManualEvent('')
                      } else {
                        setManualEvent(e.target.value)
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {recentEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    <option value="___custom___" className="text-purple-600 font-bold">+ Add New Program Title...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="Type new program name..."
                      value={manualEvent}
                      onChange={(e) => setManualEvent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!manualEvent.trim()) setManualEvent(recentEvents[0])
                        setManualIsCustom(false)
                      }}
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Arrival Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setManualStatus('present')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition-all ${
                      manualStatus === 'present'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Present (Clock In)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus('absent')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition-all ${
                      manualStatus === 'absent'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <UserX className="w-4 h-4" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="flex-1 py-4 text-white rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: themeColor }}
                >
                  {submittingManual ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Check-In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Bulk Edit Event Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />

          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Rename Event</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mb-6 font-medium">
              This will update the event title for <strong className="text-slate-900">{filteredRecords.length} visible records</strong>.
            </p>

            <form onSubmit={handleBulkEditEvent}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  New Event Title
                </label>
                {!bulkIsCustom ? (
                  <select
                    value={bulkEditEventName}
                    onChange={(e) => {
                      if (e.target.value === '___custom___') {
                        setBulkIsCustom(true)
                        setBulkEditEventName('')
                      } else {
                        setBulkEditEventName(e.target.value)
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
                    style={{ ['--tw-ring-color' as any]: themeColor }}
                  >
                    {recentEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    <option value="___custom___" className="font-bold" style={{ color: themeColor }}>+ Add New Program Title...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="Type new program name..."
                      value={bulkEditEventName}
                      onChange={(e) => setBulkEditEventName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      style={{ ['--tw-ring-color' as any]: themeColor }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!bulkEditEventName.trim()) setBulkEditEventName(recentEvents[0])
                        setBulkIsCustom(false)
                      }}
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit || !bulkEditEventName.trim()}
                  className="flex-1 py-4 text-white rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: themeColor }}
                >
                  {submittingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Records</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
