'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Activity, Eye, Music, Calendar, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Filter, MapPin, Globe } from 'lucide-react';
import { SimplifiedAnalyticsService } from '@/lib/simplified-analytics-service';
import { SongMinistryService } from '@/lib/song-ministry-service';
import CustomLoader from '@/components/CustomLoader';

interface AnalyticsRecord {
  id: string;
  year: number;
  month: number;
  totalSignups: number;
  totalLogins: number;
  totalFeatureEngagements: number;
  totalSongMinistries: number;
  uniqueUsers: number;
  pageViews: { [page: string]: number };
  countries: { [country: string]: number };
  cities: { [city: string]: number };
  browsers: { [browser: string]: number };
  featureEngagements: { [feature: string]: number };
  songMinistries: { [songId: string]: number };
}

interface ToastNotification {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SimplifiedAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AnalyticsRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [newMinistry, setNewMinistry] = useState({
    songId: '',
    songTitle: '',
    programType: 'rehearsal' as 'rehearsal' | 'service' | 'meeting' | 'other',
    programDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [allSongs, setAllSongs] = useState<{ id: string; title: string; artist: string }[]>([]);
  const [songsLoading, setSongsLoading] = useState(true);

  // Generate year options (last 3 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear];
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleAddMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSong = allSongs.find(song => song.id === newMinistry.songId);
    const songTitle = selectedSong ? selectedSong.title : newMinistry.songTitle;

    const result = await SongMinistryService.logSongMinistry(
      newMinistry.songId, songTitle, newMinistry.programType,
      newMinistry.programDate, undefined, newMinistry.notes
    );

    if (result.success) {
      setNewMinistry({ songId: '', songTitle: '', programType: 'rehearsal', programDate: new Date().toISOString().split('T')[0], notes: '' });
      loadAnalytics();
      showToast('success', 'Song ministry recorded!');
    } else {
      showToast('error', `Error: ${result.error}`);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadAllSongs();
  }, []);

  const loadAllSongs = async () => {
    setSongsLoading(true);
    try {
      const songs = await SongMinistryService.getAllSongs();
      setAllSongs(songs);
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setSongsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await SimplifiedAnalyticsService.getAllMonthlySummaries();
      setRecords(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    }
  };

  const selectedRecord = records.find(r => r.year === selectedYear && r.month === selectedMonth) || {
    id: '', year: selectedYear, month: selectedMonth,
    totalSignups: 0, totalLogins: 0, totalFeatureEngagements: 0, totalSongMinistries: 0, uniqueUsers: 0,
    pageViews: {}, countries: {}, cities: {}, browsers: {}, featureEngagements: {}, songMinistries: {}
  };

  // Calculate totals for all time
  const allTimeTotals = useMemo(() => {
    return records.reduce((acc, r) => ({
      signups: acc.signups + r.totalSignups,
      logins: acc.logins + r.totalLogins,
      features: acc.features + r.totalFeatureEngagements,
      ministries: acc.ministries + r.totalSongMinistries
    }), { signups: 0, logins: 0, features: 0, ministries: 0 });
  }, [records]);

  const topFeatures = Object.entries(selectedRecord.featureEngagements)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([feature, count]) => ({ feature: feature.replace(/_/g, ' '), count }));

  const topSongs = Object.entries(selectedRecord.songMinistries)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([songId, count]) => ({ songId: songId.replace(/_/g, ' '), count }));

  const topCountries = Object.entries(selectedRecord.countries || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([country, count]) => ({ country: country.replace(/_/g, ' '), count }));

  const topCities = Object.entries(selectedRecord.cities || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([city, count]) => ({ city: city.replace(/_/g, ' '), count }));

  const totalCountryVisits = Object.values(selectedRecord.countries || {}).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <CustomLoader message="Loading analytics data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Track signups, logins, and feature usage</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
              {MONTHS.map((month, idx) => <option key={idx} value={idx}>{month}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
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

      {/* Stats Cards - Selected Month */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">{MONTHS[selectedMonth]} {selectedYear}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedRecord.totalSignups.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Signups</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedRecord.totalLogins.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Logins</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedRecord.totalFeatureEngagements.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Features Used</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedRecord.totalSongMinistries.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Song Ministries</p>
          </div>
        </div>
      </div>

      {/* All Time Totals */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 sm:p-6 text-white">
        <h3 className="text-sm font-medium opacity-80 mb-3">All Time Totals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl sm:text-3xl font-bold">{allTimeTotals.signups.toLocaleString()}</p>
            <p className="text-sm opacity-80">Total Signups</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold">{allTimeTotals.logins.toLocaleString()}</p>
            <p className="text-sm opacity-80">Total Logins</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold">{allTimeTotals.features.toLocaleString()}</p>
            <p className="text-sm opacity-80">Features Used</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold">{allTimeTotals.ministries.toLocaleString()}</p>
            <p className="text-sm opacity-80">Song Ministries</p>
          </div>
        </div>
      </div>

      {/* Log Song Ministry */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Log Song Ministry</h3>
        <form onSubmit={handleAddMinistry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Song</label>
            {songsLoading ? (
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-2 text-gray-400">
                <CustomLoader size="sm" />
                <span>Loading songs...</span>
              </div>
            ) : (
              <select value={newMinistry.songId} onChange={(e) => {
                const song = allSongs.find(s => s.id === e.target.value);
                setNewMinistry({ ...newMinistry, songId: e.target.value, songTitle: song?.title || '' });
              }} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" required>
                <option value="">Select song...</option>
                {allSongs.map(song => <option key={song.id} value={song.id}>{song.title} - {song.artist}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={newMinistry.programType} onChange={(e) => setNewMinistry({ ...newMinistry, programType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="rehearsal">Rehearsal</option>
              <option value="service">Service</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={newMinistry.programDate} onChange={(e) => setNewMinistry({ ...newMinistry, programDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" value={newMinistry.notes} onChange={(e) => setNewMinistry({ ...newMinistry, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Optional notes" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              <Music className="w-4 h-4" /> Record
            </button>
          </div>
        </form>
      </div>

      {/* Top Features & Songs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Features Used</h3>
          <div className="space-y-3">
            {topFeatures.length > 0 ? topFeatures.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{item.feature}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">No feature data for this month</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Ministered Songs</h3>
          <div className="space-y-3">
            {topSongs.length > 0 ? topSongs.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.songId}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count}x</span>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">No ministry data for this month</p>}
          </div>
        </div>
      </div>

      {/* Geographic Location */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Geographic Distribution</h3>
          {totalCountryVisits > 0 && (
            <span className="text-sm text-gray-500 ml-auto">{totalCountryVisits} total visits</span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Countries */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Top Countries
            </h4>
            <div className="space-y-2">
              {topCountries.length > 0 ? topCountries.map((item, idx) => {
                const percentage = totalCountryVisits > 0 ? Math.round((item.count / totalCountryVisits) * 100) : 0;
                return (
                  <div key={idx} className="relative">
                    <div className="flex items-center justify-between relative z-10 py-1.5 px-2">
                      <span className="text-sm text-gray-700 font-medium">{item.country}</span>
                      <span className="text-sm text-gray-600">{item.count} ({percentage}%)</span>
                    </div>
                    <div
                      className="absolute inset-y-0 left-0 bg-purple-100 rounded"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                );
              }) : (
                <p className="text-sm text-gray-500 text-center py-4">No location data yet. Data will appear as users log in.</p>
              )}
            </div>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Top Cities
            </h4>
            <div className="space-y-2">
              {topCities.length > 0 ? topCities.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{item.city}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">No city data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Month</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Signups</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Logins</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Features</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Ministries</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? records.map((record, idx) => {
                const monthName = `${MONTHS[record.month]} ${record.year}`;
                const isSelected = record.year === selectedYear && record.month === selectedMonth;
                return (
                  <tr key={idx} className={`border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                    onClick={() => { setSelectedMonth(record.month); setSelectedYear(record.year); }}>
                    <td className="py-2 px-3 text-gray-900">{monthName}</td>
                    <td className="text-right py-2 px-3 text-gray-900">{record.totalSignups}</td>
                    <td className="text-right py-2 px-3 text-gray-900">{record.totalLogins}</td>
                    <td className="text-right py-2 px-3 text-gray-900">{record.totalFeatureEngagements}</td>
                    <td className="text-right py-2 px-3 text-gray-900">{record.totalSongMinistries}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No analytics data yet. Data will appear as users interact with the app.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] space-y-2">
          {toasts.map(toast => (
            <div key={toast.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
