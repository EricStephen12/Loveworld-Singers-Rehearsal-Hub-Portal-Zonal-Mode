import { useState, useEffect } from 'react'
import { useZone } from '@/hooks/useZone'
import { AttendanceService, AttendanceRecord } from '@/lib/attendance-service'
import { Calendar, Search, CheckCircle, Clock, XCircle, FileSpreadsheet, Download, RefreshCw, Users, TrendingUp } from 'lucide-react'
import CustomLoader from '@/components/CustomLoader'
import { isHQGroup } from '@/config/zones'

export default function AttendanceSection() {
  const { currentZone } = useZone()
  const [attendanceRecords, setAttendanceRecords] = useState<(AttendanceRecord & { user_name: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'))

  const themeColor = currentZone?.themeColor || '#9333EA'
  const isHQ = isHQGroup(currentZone?.id)

  const presentCount = attendanceRecords.filter(r => r.check_in_time && !r.check_out_time).length
  const clockedOutCount = attendanceRecords.filter(r => r.check_out_time).length
  const totalCount = attendanceRecords.length
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + clockedOutCount) / totalCount) * 100) : 0

  useEffect(() => {
    loadAttendance()
  }, [currentZone, selectedDate])

  const loadAttendance = async () => {
    if (!currentZone) return
    setLoading(true)
    try {
      const records = await AttendanceService.getZoneAttendance(currentZone.id, isHQ, 200)
      const filteredByDate = records.filter(r => {
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

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch = record.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white min-h-[400px]">
        <CustomLoader message="Loading attendance records..." />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-5 lg:pt-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance</h1>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                {isHQ ? 'HQ' : 'Zone'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {isHQ ? 'Global clock-in records across all zones' : 'Zone member attendance records'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:outline-none bg-white shadow-sm"
              style={{ ['--tw-ring-color' as any]: themeColor }}
            />
            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: themeColor }}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* ── Stats — horizontal scroll on mobile ── */}
        <div className="flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible mb-5 scrollbar-hide">
          {/* Total */}
          <div className="flex-shrink-0 w-[150px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 border-l-[3px] border-l-gray-400 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalCount}</p>
          </div>

          {/* Clocked In */}
          <div className="flex-shrink-0 w-[150px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 border-l-[3px] border-l-green-500 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
            </div>
            <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">Clocked In</p>
            <p className="text-2xl font-bold text-green-700 mt-0.5">{presentCount}</p>
          </div>

          {/* Clocked Out */}
          <div className="flex-shrink-0 w-[150px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 border-l-[3px] border-l-orange-500 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider">Clocked Out</p>
            <p className="text-2xl font-bold text-orange-700 mt-0.5">{clockedOutCount}</p>
          </div>

          {/* Attendance Rate */}
          <div
            className="flex-shrink-0 w-[150px] lg:w-auto bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            style={{ borderLeftWidth: '3px', borderLeftColor: themeColor }}
          >
            <div className="flex items-center mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}10` }}>
                <TrendingUp className="w-4 h-4" style={{ color: themeColor }} />
              </div>
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{attendanceRate}%</p>
          </div>
        </div>

        {/* ── Search + Refresh ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-5 flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 bg-gray-50"
            />
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date().toLocaleDateString('en-CA'))
              loadAttendance()
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl border border-gray-100 transition-colors active:scale-95 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Today
          </button>
        </div>

        {/* ── Table / Empty State ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          {filteredRecords.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {filteredRecords.length} Record{filteredRecords.length !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-gray-400">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          )}

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-100">
            {filteredRecords.length > 0 ? (
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="bg-gray-50/70">
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clock In</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clock Out</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Member */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: themeColor }}
                          >
                            {(record.user_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{record.user_name || 'Unknown Member'}</p>
                            <p className="text-[10px] text-gray-400">ID: {record.user_id?.substring(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      {/* Event */}
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                          {record.event_name || 'Rehearsal'}
                        </span>
                      </td>
                      {/* Clock In */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="font-semibold text-sm text-gray-800 tabular-nums">
                            {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>
                      </td>
                      {/* Clock Out */}
                      <td className="px-5 py-3.5">
                        {record.check_out_time ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                            <span className="font-semibold text-sm text-gray-800 tabular-nums">
                              {new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
                            In progress
                          </span>
                        )}
                      </td>
                      {/* Date */}
                      <td className="px-5 py-3.5 text-sm text-gray-500 font-medium tabular-nums">
                        {record.check_in_time
                          ? new Date(record.check_in_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                          : record.date_string || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-14 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold">No attendance records</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? 'Try clearing your search' : 'Scan a QR code to start recording attendance'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
