'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, Eye, Music, Calendar, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { SimplifiedAnalyticsService } from '@/lib/simplified-analytics-service';
import { SongMinistryService } from '@/lib/song-ministry-service';

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

export default function SimplifiedAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AnalyticsRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);
  const [newMinistry, setNewMinistry] = useState({
    songId: '',
    songTitle: '',
    programType: 'rehearsal' as 'rehearsal' | 'service' | 'meeting' | 'other',
    programDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [allSongs, setAllSongs] = useState<{ id: string; title: string; artist: string }[]>([]);
  const [songsLoading, setSongsLoading] = useState(true);

  const handleAddMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the selected song to get its title
    const selectedSong = allSongs.find(song => song.id === newMinistry.songId);
    const songTitle = selectedSong ? selectedSong.title : newMinistry.songTitle;
    
    const result = await SongMinistryService.logSongMinistry(
      newMinistry.songId,
      songTitle,
      newMinistry.programType,
      newMinistry.programDate,
      undefined,
      newMinistry.notes
    );
    
    if (result.success) {
      setNewMinistry({
        songId: '',
        songTitle: '',
        programType: 'rehearsal',
        programDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadAnalytics(); // Reload data after adding
      alert('Song ministry recorded successfully!');
    } else {
      alert(`Error: ${result.error}`);
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

  const selectedRecord = records.find(r => r.year === selectedYear && r.month === selectedMonth) || {
    id: '',
    year: selectedYear,
    month: selectedMonth,
    totalSignups: 0,
    totalLogins: 0,
    totalFeatureEngagements: 0,
    totalSongMinistries: 0,
    uniqueUsers: 0,
    pageViews: {},
    countries: {},
    cities: {},
    browsers: {},
    featureEngagements: {},
    songMinistries: {}
  };

  const topCountries = Object.entries(selectedRecord.countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country: country.replace(/_/g, ' '), count }));

  const topCities = Object.entries(selectedRecord.cities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city: city.replace(/_/g, ' '), count }));

  const topBrowsers = Object.entries(selectedRecord.browsers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([browser, count]) => ({ browser: browser.replace(/_/g, ' '), count }));

  const topFeatures = Object.entries(selectedRecord.featureEngagements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([feature, count]) => ({ feature: feature.replace(/_/g, ' '), count }));

  const topSongs = Object.entries(selectedRecord.songMinistries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([songId, count]) => ({ songId: songId.replace(/_/g, ' '), count }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Simplified Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Core metrics and song ministry tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Add New Ministry Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Log New Song Ministry</h3>
        <form onSubmit={handleAddMinistry} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Song</label>
            {songsLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-gray-500">Loading songs...</span>
              </div>
            ) : (
              <select
                value={newMinistry.songId}
                onChange={(e) => {
                  const selectedSong = allSongs.find(song => song.id === e.target.value);
                  setNewMinistry({
                    ...newMinistry,
                    songId: e.target.value,
                    songTitle: selectedSong ? selectedSong.title : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select a song...</option>
                {allSongs.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.title} - {song.artist}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
            <select
              value={newMinistry.programType}
              onChange={(e) => setNewMinistry({...newMinistry, programType: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="rehearsal">Rehearsal</option>
              <option value="service">Service</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={newMinistry.programDate}
              onChange={(e) => setNewMinistry({...newMinistry, programDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={newMinistry.notes}
              onChange={(e) => setNewMinistry({...newMinistry, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Additional notes about the ministry"
            />
          </div>
          
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full md:w-auto flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Music className="w-4 h-4" />
              Record Ministry
            </button>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-semibold">This Month</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {selectedRecord.totalSignups.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Signups</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-semibold">This Month</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {selectedRecord.totalLogins.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Logins</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-semibold">This Month</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {selectedRecord.totalFeatureEngagements.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Feature Engagements</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs text-yellow-600 font-semibold">This Month</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {selectedRecord.totalSongMinistries.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Song Ministries</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {topCountries.length > 0 ? (
              topCountries.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.country}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No data</p>
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Cities</h3>
          <div className="space-y-3">
            {topCities.length > 0 ? (
              topCities.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.city}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No data</p>
            )}
          </div>
        </div>
      </div>

      {/* More Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Browsers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Browsers</h3>
          <div className="space-y-3">
            {topBrowsers.length > 0 ? (
              topBrowsers.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.browser}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No data</p>
            )}
          </div>
        </div>

        {/* Top Features */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Features</h3>
          <div className="space-y-3">
            {topFeatures.length > 0 ? (
              topFeatures.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.feature}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Song Ministries */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Ministered Songs</h3>
        <div className="space-y-3">
          {topSongs.length > 0 ? (
            topSongs.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.songId}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count} times</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No song ministry data</p>
          )}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Month</th>
                <th className="text-right py-2 px-4 text-sm font-semibold text-gray-600">Signups</th>
                <th className="text-right py-2 px-4 text-sm font-semibold text-gray-600">Logins</th>
                <th className="text-right py-2 px-4 text-sm font-semibold text-gray-600">Features</th>
                <th className="text-right py-2 px-4 text-sm font-semibold text-gray-600">Songs</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => {
                  const monthName = new Date(record.year, record.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-4 text-sm text-gray-900">{monthName}</td>
                      <td className="text-right py-2 px-4 text-sm text-gray-900">{record.totalSignups}</td>
                      <td className="text-right py-2 px-4 text-sm text-gray-900">{record.totalLogins}</td>
                      <td className="text-right py-2 px-4 text-sm text-gray-900">{record.totalFeatureEngagements}</td>
                      <td className="text-right py-2 px-4 text-sm text-gray-900">{record.totalSongMinistries}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}