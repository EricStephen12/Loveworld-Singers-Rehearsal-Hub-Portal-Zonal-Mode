"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  X,
  ChevronRight
} from 'lucide-react';
import { useAdminTheme } from './admin/AdminThemeProvider';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { HQMembersService } from '@/lib/hq-members-service';
import { ZoneInvitationService } from '@/lib/zone-invitation-service';
import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';
import CustomLoader from './CustomLoader';

// In-memory cache for members data
const CACHE_TTL = 30 * 1000; // 30 seconds - shorter for real-time updates
interface MembersCache {
  data: Member[];
  timestamp: number;
  zoneId: string;
  filterZone: string;
}
const membersCache = new Map<string, MembersCache>();

function getCacheKey(zoneId: string, filterZone: string): string {
  return `${zoneId}_${filterZone}`;
}

function isCacheValid(cache: MembersCache | undefined): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  region?: string;
  church?: string;
  designation?: string;
  administration?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  groups?: string[];
  role?: string;
  zoneId?: string;
  zoneName?: string;
}

export default function Members() {
  const { currentZone } = useZone();
  const { theme } = useAdminTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all'); // 'all', or specific zone ID
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [allZones, setAllZones] = useState<any[]>([]);
  const [displayLimit, setDisplayLimit] = useState(50); // Show 50 initially

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg z-[100] text-sm font-medium transition-all ${type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-gray-800 text-white'
      }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Load all zones for HQ admin filter
  useEffect(() => {
    const loadZones = async () => {
      if (currentZone && isHQGroup(currentZone.id)) {
        try {
          const { ZONES } = await import('@/config/zones');
          setAllZones(ZONES);
        } catch (error) {
          console.error('Error loading zones:', error);
        }
      }
    };
    loadZones();
  }, [currentZone]);

  // Load members from correct collection based on zone type
  const loadMembers = async (forceRefresh = false) => {
    if (!currentZone) {
      return;
    }

    const cacheKey = getCacheKey(currentZone.id, filterZone);

    if (forceRefresh) {
      membersCache.delete(cacheKey);
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = membersCache.get(cacheKey);
      if (isCacheValid(cached)) {
        setMembers(cached!.data);
        return;
      }
    }

    setLoading(true);
    try {

      let zoneMemberships: any[] = [];

      if (isHQGroup(currentZone.id)) {
        if (filterZone === 'all') {
          // Load ALL members from BOTH hq_members AND zone_members collections

          // Load all HQ members
          const allHQMembers = await FirebaseDatabaseService.getCollection('hq_members');
          const hqMemberships = allHQMembers.map((member: any) => ({
            ...member,
            zoneId: member.groupId || member.zoneId,
            zoneName: allZones.find(z => z.id === (member.groupId || member.zoneId))?.name || member.groupId || 'HQ'
          }));

          // Load all zone members
          const allZoneMembers = await FirebaseDatabaseService.getCollection('zone_members');
          const zoneMembersList = allZoneMembers.map((member: any) => ({
            ...member,
            zoneId: member.zoneId,
            zoneName: allZones.find(z => z.id === member.zoneId)?.name || member.zoneId
          }));

          // Combine both lists
          zoneMemberships = [...hqMemberships, ...zoneMembersList];
        } else if (isHQGroup(filterZone)) {
          // Load specific HQ group members
          zoneMemberships = await HQMembersService.getHQGroupMembers(filterZone);
          zoneMemberships = zoneMemberships.map((member: any) => ({
            ...member,
            zoneId: filterZone,
            zoneName: allZones.find(z => z.id === filterZone)?.name || filterZone
          }));
        } else {
          // Load specific zone members
          zoneMemberships = await ZoneInvitationService.getZoneMembers(filterZone);
          zoneMemberships = zoneMemberships.map((member: any) => ({
            ...member,
            zoneId: filterZone,
            zoneName: allZones.find(z => z.id === filterZone)?.name || filterZone
          }));
        }
      } else {
        zoneMemberships = await ZoneInvitationService.getZoneMembers(currentZone.id);
      }


      // OPTIMIZED: Batch fetch profiles instead of one-by-one (reduces N+1 reads)
      // First, get unique user IDs and DEDUPLICATE members
      const seenUserIds = new Set<string>();
      const deduplicatedMemberships: any[] = [];

      zoneMemberships.forEach((m: any) => {
        if (m.userId && !seenUserIds.has(m.userId)) {
          seenUserIds.add(m.userId);
          deduplicatedMemberships.push(m);
        }
      });


      const userIds = [...seenUserIds];

      // Batch fetch profiles (max 30 at a time due to Firestore 'in' query limit)
      const profilesMap = new Map<string, any>();
      const batchSize = 30;

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batchIds = userIds.slice(i, i + batchSize);
        try {
          // Fetch profiles in batch - use documentId for ID-based queries
          const profiles = await FirebaseDatabaseService.getDocumentsByIds('profiles', batchIds);
          profiles.forEach((profile: any) => {
            if (profile?.id) profilesMap.set(profile.id, profile);
          });
        } catch (error) {
          // Fallback: fetch individually if batch fails
          console.warn('Batch fetch failed, falling back to individual fetches');
          for (const userId of batchIds) {
            try {
              const profile = await FirebaseDatabaseService.getDocument('profiles', userId);
              if (profile) profilesMap.set(userId, profile);
            } catch (e) {
              // Skip failed profiles
            }
          }
        }
      }

      // Map deduplicated memberships to member data using cached profiles
      const membersData = deduplicatedMemberships.map((membership: any) => {
        const profile = profilesMap.get(membership.userId) as any;

        // Trim names to remove extra whitespace
        const firstName = (profile?.first_name || membership.userName?.split(' ')[0] || '').trim();
        const lastName = (profile?.last_name || membership.userName?.split(' ').slice(1).join(' ') || '').trim();

        return {
          id: membership.userId,
          first_name: firstName,
          last_name: lastName,
          middle_name: (profile?.middle_name || '').trim(),
          email: profile?.email || membership.userEmail || '',
          phone: profile?.phone_number || profile?.phone || '',
          gender: profile?.gender || '',
          birthday: profile?.birthday || '',
          region: profile?.region || '',
          church: profile?.church || '',
          designation: (profile?.designation || '').trim(),
          administration: (profile?.administration || '').trim(),
          profile_image_url: profile?.profile_image_url || '',
          created_at: membership.joinedAt || profile?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || new Date().toISOString(),
          is_active: membership.status === 'active',
          groups: profile?.groups || [],
          role: membership.role || 'member',
          zoneId: membership.zoneId,
          zoneName: membership.zoneName
        };
      });

      setMembers(membersData);

      // Cache the results
      membersCache.set(cacheKey, {
        data: membersData,
        timestamp: Date.now(),
        zoneId: currentZone.id,
        filterZone
      });

    } catch (error) {
      console.error('❌ Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load members when zone or filter changes
  useEffect(() => {
    if (currentZone) {
      // For 'all' filter, wait for zones to be loaded first
      if (filterZone === 'all' && isHQGroup(currentZone.id) && allZones.length === 0) {
        return;
      }
      loadMembers();
      setDisplayLimit(50); // Reset display limit when filters change
    }
  }, [currentZone, filterZone, allZones]);

  // Filter members based on search
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.administration?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Export members data
  const exportMembers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Designation', 'Administration', 'Role', 'Status', 'Joined Date'],
      ...filteredMembers.map(member => [
        `${member.first_name} ${member.last_name}`,
        member.email,
        member.phone || '',
        member.designation || '',
        member.administration || '',
        member.role || 'member',
        member.is_active ? 'Active' : 'Inactive',
        formatDate(member.created_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete member handler
  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}? This will remove their account, profile, and zone membership.`)) {
      return;
    }

    try {
      setLoading(true);

      // 1. Remove from zone membership
      if (member.zoneId) {
        await ZoneInvitationService.removeMember(member.id, member.zoneId);
      }

      // 2. Delete profile
      await FirebaseDatabaseService.deleteDocument('profiles', member.id);

      // 3. Delete auth user (if possible - may require re-authentication)
      // For now, we'll just mark as inactive

      showToast(`✅ ${member.first_name} ${member.last_name} deleted successfully`, 'success');

      // Invalidate cache and reload
      if (currentZone) {
        const cacheKey = getCacheKey(currentZone.id, filterZone);
        membersCache.delete(cacheKey);
      }
      loadMembers(true); // Force reload the list
    } catch (error) {
      console.error('Error deleting member:', error);
      showToast('❌ Failed to delete member. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white lg:bg-gray-50">
      {/* Header - Hidden on mobile (shown in AdminMobileHeader) */}
      <div className="hidden lg:flex flex-shrink-0 p-6 bg-white border-b border-gray-200 items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-900 flex-1">Members</h2>
        {members.length > 0 && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            {filteredMembers.length} / {members.length}
          </span>
        )}
        <button
          onClick={() => loadMembers(true)}
          disabled={loading}
          className={`p-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors disabled:opacity-50 flex items-center justify-center`}
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={exportMembers}
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          title="Export CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Stats Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-xs">Total Members</p>
            <p className="text-white font-bold text-lg">{members.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadMembers(true)}
            disabled={loading}
            className="p-2.5 bg-white/20 text-white rounded-xl transition-colors active:scale-95 flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportMembers}
            className="p-2.5 bg-white/20 text-white rounded-xl transition-colors active:scale-95"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 lg:border-gray-200">
        <div className="p-4 lg:px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50 lg:bg-white"
            />
          </div>
        </div>

        {/* Zone Filter Toggle Buttons - Only for HQ Admins */}
        {currentZone && isHQGroup(currentZone.id) && (
          <div className="px-4 lg:px-6 pb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {/* All Members Button */}
              <button
                onClick={() => setFilterZone('all')}
                className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all ${filterZone === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                🌍 All Members
              </button>

              {/* HQ Group Buttons */}
              {allZones.filter(z => isHQGroup(z.id) && z.id !== 'zone-boss').map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setFilterZone(zone.id)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${filterZone === zone.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                >
                  🏢 {zone.name.replace('Loveworld Singers ', '').replace('LWS ', '')}
                </button>
              ))}

              {/* Regional Zone Buttons */}
              {allZones.filter(z => !isHQGroup(z.id) && z.id !== 'zone-boss').map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setFilterZone(zone.id)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${filterZone === zone.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {zone.name.replace('Loveworld Singers ', '')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Members List - Scrollable */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-[1px]">
            <CustomLoader message="Loading members..." />
          </div>
        )}
        {filteredMembers.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No members found</h3>
              <p className="text-sm text-slate-500">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Members will appear here once they join your zone'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-auto h-full">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.slice(0, displayLimit).map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {member.profile_image_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={member.profile_image_url}
                                alt={`${member.first_name} ${member.last_name}`}
                              />
                            ) : (
                              <div className={`h-10 w-10 rounded-full ${theme.primaryLight} flex items-center justify-center`}>
                                <span className={`${theme.text} font-medium text-sm`}>
                                  {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {member.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1 mb-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{member.designation || 'Member'}</div>
                          {member.administration && (
                            <div className="text-gray-500">{member.administration}</div>
                          )}
                          <div className={`text-xs ${theme.text} font-medium`}>
                            {member.role || 'member'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {member.is_active ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(member.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className={`${theme.text} ${theme.textHover} p-1 ${theme.bgHover} rounded`}
                            title="View Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Load More Button - Desktop (inside scrollable area) */}
              {filteredMembers.length > displayLimit && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 50)}
                    className={`w-full py-3 ${theme.text} hover:bg-purple-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2`}
                  >
                    <Users className="w-4 h-4" />
                    Load More Members ({filteredMembers.length - displayLimit} remaining)
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Cards - Instagram Style */}
            <div className="lg:hidden overflow-auto h-full">
              {/* Member count badge */}
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{Math.min(displayLimit, filteredMembers.length)}</span> of <span className="font-semibold text-slate-700">{filteredMembers.length}</span> members
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredMembers.slice(0, displayLimit).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {member.profile_image_url ? (
                        <img
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-sm"
                          src={member.profile_image_url}
                          alt={`${member.first_name} ${member.last_name}`}
                        />
                      ) : (
                        <div className={`h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-white shadow-sm`}>
                          <span className="text-white font-bold text-lg">
                            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Online indicator */}
                      {member.is_active && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[15px] text-slate-900 truncate">
                          {member.first_name} {member.last_name}
                        </h3>
                        {member.role === 'coordinator' && (
                          <span className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{member.designation || member.email}</p>
                      {member.zoneName && filterZone === 'all' && (
                        <p className="text-xs text-purple-600 font-medium truncate mt-0.5">
                          {member.zoneName}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* Load More Button - Mobile */}
              {filteredMembers.length > displayLimit && (
                <div className="p-4 border-t border-slate-100 bg-white">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 50)}
                    className={`w-full py-3 ${theme.text} bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-2`}
                  >
                    <Users className="w-4 h-4" />
                    Load More ({filteredMembers.length - displayLimit} remaining)
                  </button>
                </div>
              )}
            </div>

          </>
        )}
      </div>

      {/* Member Detail Modal - Full Profile View */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Member Profile</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Profile Section */}
              <div className="p-4 flex items-center gap-4 border-b border-gray-100">
                {selectedMember.profile_image_url ? (
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={selectedMember.profile_image_url}
                    alt={`${selectedMember.first_name} ${selectedMember.last_name}`}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xl">
                      {selectedMember.first_name.charAt(0)}{selectedMember.last_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedMember.first_name} {selectedMember.middle_name ? selectedMember.middle_name + ' ' : ''}{selectedMember.last_name}
                  </h4>
                  <p className="text-sm text-gray-500">{selectedMember.email}</p>
                  {selectedMember.zoneName && (
                    <p className="text-xs text-purple-600 font-medium mt-1">{selectedMember.zoneName}</p>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="p-4 border-b border-gray-100">
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Personal Information</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedMember.phone || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Gender</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedMember.gender || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Birthday</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedMember.birthday || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="p-4 border-b border-gray-100">
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Location</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Region</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedMember.region || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Church</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedMember.church || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Designation Information */}
              <div className="p-4">
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Designation</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Designation</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedMember.designation || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Administration</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedMember.administration || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setSelectedMember(null)}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDeleteMember(selectedMember);
                  setSelectedMember(null);
                }}
                className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
