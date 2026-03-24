import { useState, useEffect } from 'react'
import { useZone } from '@/hooks/useZone'
import { AttendanceService, AttendanceRecord } from '@/lib/attendance-service'
import { Calendar, Search, CheckCircle, Clock, XCircle, FileSpreadsheet, Download, RefreshCw } from 'lucide-react'
import CustomLoader from '@/components/CustomLoader'
import { isHQGroup } from '@/config/zones'

export default function AttendanceSection() {
  const { currentZone } = useZone()
  const [attendanceRecords, setAttendanceRecords] = useState<(AttendanceRecord & { user_name: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA')) // YYYY-MM-DD

  const isHQ = isHQGroup(currentZone?.id)

  // Calculate summary stats
  const presentCount = attendanceRecords.filter(r => r.check_in_time && !r.check_out_time).length
  const clockedOutCount = attendanceRecords.filter(r => r.check_out_time).length
  const totalCount = attendanceRecords.length

  useEffect(() => {
    loadAttendance()
  }, [currentZone, selectedDate])

  const loadAttendance = async () => {
    if (!currentZone) return

    setLoading(true)
    try {
      const records = await AttendanceService.getZoneAttendance(currentZone.id, isHQ, 200)
      
      // Filter by selected date in frontend
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
    <div className="flex-1 overflow-y-auto bg-gray-50 lg:bg-white p-4 lg:p-6 lg:pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Attendance Tracker
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${isHQ ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                {isHQ ? 'HQ Access' : 'Zone Access'}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isHQ 
                ? 'Global view of all member clock-ins across all zones' 
                : `Tracking clock-ins for your zone members`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white shadow-sm"
            />
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 w-fit"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Scans</p>
              <p className="text-xl lg:text-3xl font-black text-gray-900">{totalCount}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Clocked In</p>
              <p className="text-xl lg:text-3xl font-black text-green-700">{presentCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Clocked Out</p>
              <p className="text-xl lg:text-3xl font-black text-orange-700">{clockedOutCount}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-[15] lg:relative lg:top-auto">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by member name or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
             <button
              onClick={() => {
                setSelectedDate(new Date().toLocaleDateString('en-CA'))
                loadAttendance()
              }}
              className="px-4 py-1.5 rounded-full text-xs lg:text-sm font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Today
            </button>
          </div>
        </div>

        {/* Table/List View - Scrollable (Only on Desktop) */}
        <div className="bg-white border text-left border-gray-100 rounded-xl shadow-lg lg:max-h-[70vh] flex flex-col overflow-hidden lg:overflow-hidden overflow-x-auto">
          <div className="overflow-x-auto lg:overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
            {filteredRecords.length > 0 ? (
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Member</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Event</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Clock In</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Clock Out</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {record.user_name || 'Unknown Member'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">ID: {record.user_id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase tracking-wide">
                          {record.event_name || 'Rehearsal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-gray-900 font-bold tabular-nums">
                            {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.check_out_time ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-gray-900 font-bold tabular-nums">
                              {new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 italic text-sm">Waiting...</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium tabular-nums">
                        {record.check_in_time ? new Date(record.check_in_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : (record.date_string || '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium font-bold">No check-in records found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? 'Try clearing your search filters' : 'Scan a QR code to record attendance'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
