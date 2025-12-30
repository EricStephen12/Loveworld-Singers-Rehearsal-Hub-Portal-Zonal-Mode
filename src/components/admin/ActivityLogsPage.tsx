"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';
import { Search, Filter, Download, Users, Clock, Music, Edit, Trash2, Plus, Upload } from 'lucide-react';
import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';
import { format } from 'date-fns';

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

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const { currentZone } = useZone();
  const isHQ = currentZone ? isHQGroup(currentZone.id) : false;

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'activity_logs'),
        orderBy('timestamp', 'desc'),
        limit(500)
      );

      // If not HQ, only load current zone's logs
      if (!isHQ && currentZone) {
        q = query(
          collection(db, 'activity_logs'),
          where('zoneId', '==', currentZone.id),
          orderBy('timestamp', 'desc'),
          limit(500)
        );
      }

      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as ActivityLog;
      });

      setLogs(logsData);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.itemName && log.itemName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesSection = !sectionFilter || log.section === sectionFilter;
    
    return matchesSearch && matchesAction && matchesSection;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'updated': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'created': return <Plus className="w-4 h-4 text-green-600" />;
      case 'deleted': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'uploaded': return <Upload className="w-4 h-4 text-purple-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
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
        log.timestamp.toLocaleString(),
        log.zoneName,
        log.userName,
        log.message,
        log.type,
        log.action,
        log.section,
        log.itemName || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Activity Logs</h1>
              <p className="text-gray-600 mt-1">
                {isHQ ? 'View all activity across all zones' : 'View activity for your zone'}
              </p>
            </div>
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Logs</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

      {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search songs, users, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>
            
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Sections</option>
              <option value="songs">Songs</option>
              <option value="pages">Pages</option>
              <option value="categories">Categories</option>
              <option value="subgroups">Subgroups</option>
              <option value="master_library">Master Library</option>
              <option value="media">Media</option>
            </select>
          </div>
        </div>

      {/* Logs Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 lg:p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No activity logs found</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="max-h-96 lg:max-h-[500px] overflow-y-auto">
              {/* Desktop Table */}
              <table className="hidden lg:table w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Zone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Section</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-purple-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.zoneName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.userName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.section || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.itemName || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-purple-50/50 transition-colors duration-150">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">User:</span>
                        <span className="ml-1 text-gray-700">{log.userName || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Zone:</span>
                        <span className="ml-1 text-gray-700">{log.zoneName || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Section:</span>
                        <span className="ml-1 text-gray-700">{log.section || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Details:</span>
                        <span className="ml-1 text-gray-700">{log.itemName || '-'}</span>
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