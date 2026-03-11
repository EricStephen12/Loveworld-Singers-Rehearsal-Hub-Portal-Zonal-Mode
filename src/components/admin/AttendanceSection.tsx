'use client'

import { useState, useEffect } from 'react'
import { useZone } from '@/hooks/useZone'
import { AttendanceService, AttendanceRecord } from '@/lib/attendance-service'
import { Calendar, Search, CheckCircle, Clock, XCircle, FileSpreadsheet, Download } from 'lucide-react'
import CustomLoader from '@/components/CustomLoader'
import { isHQGroup } from '@/config/zones'

export default function AttendanceSection() {
  const { currentZone } = useZone()
  const [attendanceRecords, setAttendanceRecords] = useState<(AttendanceRecord & { user_name: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const isHQ = isHQGroup(currentZone?.id)

  useEffect(() => {
    loadAttendance()
  }, [currentZone])

  const loadAttendance = async () => {
    if (!currentZone) return

    setLoading(true)
    try {
      const records = await AttendanceService.getZoneAttendance(currentZone.id, isHQ, 200)
      setAttendanceRecords(records)
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (attendanceRecords.length === 0) return

    // Define CSV headers
    const headers = ['Member Name', 'Event Name', 'Date', 'Time', 'Status', 'Zone/HQ']
    
    // Convert data to CSV format
    const csvData = attendanceRecords.map(record => {
      const date = new Date(record.check_in_time || record.created_at || 0)
      return [
        `"${record.user_name || 'Member'}"`,
        `"${record.event_name || 'Rehearsal'}"`,
        `"${date.toLocaleDateString()}"`,
        `"${date.toLocaleTimeString()}"`,
        `"${record.status}"`,
        `"${isHQ ? 'HQ' : 'Zone'}"`
      ].join(',')
    })

    // Combine headers and data
    const csvContent = [headers.join(','), ...csvData].join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter records based on search and status
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch = record.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          record.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculate summary stats
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <CustomLoader message="Loading attendance records..." />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 lg:bg-white p-4 lg:p-6 lg:pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">
              View check-in records for {isHQ ? 'all groups (HQ)' : 'your zone members'}
            </p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors w-fit"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Scans</p>
              <p className="text-xl lg:text-3xl font-bold text-gray-900">{attendanceRecords.length}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Present On Time</p>
              <p className="text-xl lg:text-3xl font-bold text-green-700">{presentCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 font-medium">Late</p>
              <p className="text-xl lg:text-3xl font-bold text-yellow-700">{lateCount}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">Absent Request</p>
              <p className="text-xl lg:text-3xl font-bold text-red-700">{absentCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by member name or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {['all', 'present', 'late', 'absent'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === status 
                    ? 'bg-purple-100 text-purple-700 border-purple-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                } border`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table/List View */}
        <div className="bg-white border text-left border-gray-100 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                      {record.user_name || 'Unknown Member'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {record.event_name || 'Rehearsal'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">
                      {new Date(record.check_in_time || record.created_at || Date.now()).toLocaleString([], {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm truncate max-w-[200px]">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No check-in records found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || filterStatus !== 'all' ? 'Try clearing your search filters' : 'Scan a QR code to record attendance'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
