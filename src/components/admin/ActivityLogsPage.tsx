"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';
import { Search, Download, Clock, Edit, Trash2, Plus, Upload, RefreshCw, ChevronLeft, ChevronRight, Filter, Calendar } from 'lucide-react';
import { useZone } from '@/hooks/useZone';
import { isHQGroup, HQ_GROUP_IDS, BOSS_ZONE_ID } from '@/config/zones';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import CustomLoader from '@/components/CustomLoader';

interface ActivityLog {
  id: string;
  zoneId: string;
  zoneName: string;
  userName: string;
  message: string;
  type: string;
  action: string;
  section: string;
  itemName?: string;
  timestamp: any;
  createdAt: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { currentZone, isLoading: zoneLoading } = useZone();
  const isHQ = currentZone ? isHQGroup(currentZone.id) : false;

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear];
  }, []);

  useEffect(() => {
    if (!zoneLoading && currentZone?.id) {
      loadActivityLogs();
    }
  }, [currentZone?.id, zoneLoading]);

  const loadActivityLogs = async () => {
    if (!currentZone?.id) return;
    try {
      setLoading(true);
      const hqZoneIds = [...HQ_GROUP_IDS, BOSS_ZONE_ID];

      let q;
      if (isHQ) {
        q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(500));
      } else {
        q = query(collection(db, 'activity_logs'), where('zoneId', '==', currentZone.id), orderBy('timestamp', 'desc'), limit(500));
      }

      const querySnapshot = await getDocs(q);
      let logsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, timestamp: data.timestamp?.toDate() || new Date() } as ActivityLog;
      });

      if (isHQ) {
        logsData = logsData.filter(log => hqZoneIds.includes(log.zoneId));
      }
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(prev => prev - 1); }
      else { setSelectedMonth(prev => prev - 1); }
    } else {
      if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(prev => prev + 1); }
      else { setSelectedMonth(prev => prev + 1); }
    }
  };

  const filteredLogs = useMemo(() => {
    const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth));

    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const inDateRange = isWithinInterval(logDate, { start: monthStart, end: monthEnd });
      const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.itemName && log.itemName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesAction = !actionFilter || log.action === actionFilter;
      const matchesSection = !sectionFilter || log.section === sectionFilter;
      return inDateRange && matchesSearch && matchesAction && matchesSection;
    });
  }, [logs, selectedMonth, selectedYear, searchTerm, actionFilter, sectionFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'updated': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'created': return <Plus className="w-4 h-4 text-green-600" />;
      case 'deleted': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'uploaded': return <Upload className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'updated': return 'text-blue-600 bg-blue-50';
      case 'created': return 'text-green-600 bg-green-50';
      case 'deleted': return 'text-red-600 bg-red-50';
      case 'uploaded': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Zone', 'User', 'Message', 'Type', 'Action', 'Section', 'Item'],
      ...filteredLogs.map(log => [
        log.timestamp.toLocaleString(), log.zoneName, log.userName, log.message,
        log.type, log.action, log.section, log.itemName || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${MONTHS[selectedMonth]}-${selectedYear}.csv`;
    a.click();
  };

  if (loading || zoneLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-purple-100 shadow-sm">
        <CustomLoader message="Loading activity logs..." />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Activity Logs</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 truncate">
                {isHQ ? 'All HQ activity' : currentZone?.name || 'Your zone'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={loadActivityLogs} className="w-9 h-9 sm:w-auto sm:px-4 sm:py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2" title="Refresh">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button onClick={exportLogs} className="h-9 px-3 sm:px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 shadow-lg text-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Date:</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-white">
                {MONTHS.map((month, idx) => <option key={idx} value={idx}>{month}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-white">
                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => { setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Today
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-3 sm:p-4 mb-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm" />
          </div>
          <div className="flex gap-2">
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm bg-white">
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>
            <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm bg-white">
              <option value="">All Sections</option>
              <option value="songs">Songs</option>
              <option value="pages">Pages</option>
              <option value="categories">Categories</option>
              <option value="subgroups">Subgroups</option>
              <option value="master_library">Master Library</option>
              <option value="media">Media</option>
            </select>
          </div>
          {(actionFilter || sectionFilter || searchTerm) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Showing {filteredLogs.length} logs</span>
              <button onClick={() => { setSearchTerm(''); setActionFilter(''); setSectionFilter(''); }}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium ml-auto">Clear filters</button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">{MONTHS[selectedMonth]} {selectedYear}</p>
              <p className="text-2xl font-bold">{filteredLogs.length} Activities</p>
            </div>
            <div className="text-right text-sm opacity-80">
              <p>{filteredLogs.filter(l => l.action === 'created').length} Created</p>
              <p>{filteredLogs.filter(l => l.action === 'updated').length} Updated</p>
              <p>{filteredLogs.filter(l => l.action === 'deleted').length} Deleted</p>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-700 font-medium">No activity logs for {MONTHS[selectedMonth]} {selectedYear}</p>
              <p className="text-gray-500 text-sm mt-1">Try selecting a different month or adjusting filters</p>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '300px' }}>
              {/* Desktop Table */}
              <table className="hidden lg:table w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Section</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{format(new Date(log.timestamp), 'MMM d, h:mm a')}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.userName || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{log.message}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action?.toUpperCase() || '?'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.section || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-purple-50/50 active:bg-purple-100/50">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{log.message}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${getActionColor(log.action)}`}>
                            {log.action?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="font-medium text-gray-700">{log.userName || 'Unknown'}</span>
                          <span>•</span>
                          <span>{format(new Date(log.timestamp), 'MMM d, h:mm a')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {log.section && <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700">{log.section}</span>}
                          {log.itemName && <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 max-w-[150px] truncate">{log.itemName}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
