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
  Shield,
  ChevronRight
} from 'lucide-react';
import { useAdminTheme } from './admin/AdminThemeProvider';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { HQMembersService } from '@/lib/hq-members-service';
import { ZoneInvitationService } from '@/lib/zone-invitation-service';
import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';

// In-memory cache for members data
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes
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
  email: string;
  phone?: string;
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
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('current'); // 'current', 'all', or specific zone ID
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [allZones, setAllZones] = useState<any[]>([]);
  const [displayLimit, setDisplayLimit] = useState(50); // Show 50 initially

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
      console.log('⏳ Waiting for zone to load...');
      return;
    }

    // Check cache first (unless force refresh)
    const cacheKey = getCacheKey(currentZone.id, filterZone);
    if (!forceRefresh) {
      const cached = membersCache.get(cacheKey);
      if (isCacheValid(cached)) {
        console.log(`📦 [Members] Using cached data for ${currentZone.name} (${cached!.data.length} members)`);
        setMembers(cached!.data);
        return;
      }
    }

    setLoading(true);
    try {
      console.log('🔄 Loading members for zone:', currentZone.id, currentZone.name, 'Filter:', filterZone);
      
      let zoneMemberships: any[] = [];
      
      // Check if HQ group or regular zone
      if (isHQGroup(currentZone.id)) {
        if (filterZone === 'all') {
          // Load ALL zone members from all zones
          console.log('🌍 Loading ALL zone members from zone_members collection');
          const allZoneMembers = await FirebaseDatabaseService.getCollection('zone_members');
          zoneMemberships = allZoneMembers.map((member: any) => ({
            ...member,
            zoneId: member.zoneId,
            zoneName: allZones.find(z => z.id === member.zoneId)?.name || member.zoneId
          }));
        } else if (filterZone === 'current') {
          // Load only HQ members
          console.log('🏢 Loading HQ members from hq_members collection');
          zoneMemberships = await HQMembersService.getHQGroupMembers(currentZone.id);
        } else {
          // Load specific zone members
          console.log('📍 Loading specific zone members:', filterZone);
          zoneMemberships = await ZoneInvitationService.getZoneMembers(filterZone);
          zoneMemberships = zoneMemberships.map((member: any) => ({
            ...member,
            zoneId: filterZone,
            zoneName: allZones.find(z => z.id === filterZone)?.name || filterZone
          }));
        }
      } else {
        console.log('📍 Loading zone members from zone_members collection');
        zoneMemberships = await ZoneInvitationService.getZoneMembers(currentZone.id);
      }
      
      console.log(`📊 Found ${zoneMemberships.length} memberships`);
      
      // OPTIMIZED: Batch fetch profiles instead of one-by-one (reduces N+1 reads)
      // First, get unique user IDs
      const userIds = [...new Set(zoneMemberships.map((m: any) => m.userId))].filter(Boolean);
      
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
      
      // Map memberships to member data using cached profiles
      const membersData = zoneMemberships.map((membership: any) => {
        const profile = profilesMap.get(membership.userId) as any;
        
        return {
          id: membership.userId,
          first_name: profile?.first_name || membership.userName?.split(' ')[0] || '',
          last_name: profile?.last_name || membership.userName?.split(' ').slice(1).join(' ') || '',
          email: profile?.email || membership.userEmail || '',
          phone: profile?.phone || '',
          designation: profile?.designation || '',
          administration: profile?.administration || '',
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
      
      console.log(`✅ Loaded ${membersData.length} members for ${currentZone.name} (batch optimized, cached)`);
    } catch (error) {
      console.error('❌ Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load members when zone or filter changes
  useEffect(() => {
    if (currentZone) {
      loadMembers();
      setDisplayLimit(50); // Reset display limit when filters change
    }
  }, [currentZone, filterZone]);

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.administration?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && member.is_active) ||
      (filterStatus === 'inactive' && !member.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(members.map(m => m.role).filter(Boolean)));

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
      // Note: Deleting auth users requires special permissions
      // For now, we'll just mark as inactive
      
      alert(`Successfully deleted ${member.first_name} ${member.last_name}`);
      
      // Invalidate cache and reload
      if (currentZone) {
        const cacheKey = getCacheKey(currentZone.id, filterZone);
        membersCache.delete(cacheKey);
      }
      loadMembers(true); // Force reload the list
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member. Please try again.');
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
          className={`p-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors disabled:opacity-50`}
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
            className="p-2.5 bg-white/20 text-white rounded-xl transition-colors active:scale-95"
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

      {/* Search and Filters - Instagram Style */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 lg:border-gray-200">
        {/* Search Bar with integrated filters on desktop */}
        <div className="p-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50 lg:bg-white"
              />
            </div>
            
            {/* Desktop Filters - Inline with search */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Zone Filter - Only for HQ Admins */}
              {currentZone && isHQGroup(currentZone.id) && (
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50 font-medium"
                >
                  <option value="current">🏢 HQ Only</option>
                  <option value="all">🌍 All Zones</option>
                  <optgroup label="Specific Zones">
                    {allZones.filter(z => !isHQGroup(z.id) && z.id !== 'zone-boss').map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>
                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
                  </option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Mobile Filter Pills - Horizontal scroll */}
        <div className="lg:hidden pb-3 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {/* Zone Filter - Only for HQ Admins */}
            {currentZone && isHQGroup(currentZone.id) && (
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="flex-shrink-0 px-3 py-2 text-xs font-semibold border-2 border-purple-200 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50 text-purple-700 appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%239333ea%22%20d%3D%22M6%208L2%204h8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]"
              >
                <option value="current">🏢 HQ</option>
                <option value="all">🌍 All</option>
                {allZones.filter(z => !isHQGroup(z.id) && z.id !== 'zone-boss').map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name.length > 15 ? zone.name.substring(0, 15) + '...' : zone.name}
                  </option>
                ))}
              </select>
            )}
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex-shrink-0 px-3 py-2 text-xs font-semibold border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-700 appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L2%204h8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-shrink-0 px-3 py-2 text-xs font-semibold border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-700 appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L2%204h8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]"
            >
              <option value="all">All Status</option>
              <option value="active">✓ Active</option>
              <option value="inactive">○ Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members List - Scrollable */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {loading ? (
          <>
          {/* Mobile Skeleton - Instagram Style */}
          <div className="lg:hidden bg-white divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-14 h-14 bg-slate-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
          
          {/* Desktop Skeleton */}
          <div className="hidden lg:block overflow-auto h-full">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : filteredMembers.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No members found</h3>
              <p className="text-sm text-slate-500">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.is_active 
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

      {/* Member Detail Modal - Redesigned */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 relative">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                {selectedMember.profile_image_url ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
                    src={selectedMember.profile_image_url}
                    alt={`${selectedMember.first_name} ${selectedMember.last_name}`}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {selectedMember.first_name.charAt(0)}{selectedMember.last_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-white mb-1">
                    {selectedMember.first_name} {selectedMember.last_name}
                  </h4>
                  <p className="text-white/90 text-sm mb-2">{selectedMember.email}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedMember.is_active 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {selectedMember.is_active ? '✓ Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Contact Information Card */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                  <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contact Information
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                      <p className="text-sm text-slate-900 font-medium">{selectedMember.email}</p>
                    </div>
                    {selectedMember.phone && (
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                        <p className="text-sm text-slate-900 font-medium">{selectedMember.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role & Designation Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h5 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role & Designation
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Designation</label>
                      <p className="text-sm text-slate-900 font-medium">{selectedMember.designation || 'Member'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                      <p className="text-sm text-slate-900 font-medium capitalize">{selectedMember.role || 'member'}</p>
                    </div>
                    {selectedMember.administration && (
                      <div className="bg-white rounded-lg p-3 sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Administration</label>
                        <p className="text-sm text-slate-900 font-medium">{selectedMember.administration}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h5 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </h5>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-slate-900 font-medium">{formatDate(selectedMember.created_at)}</p>
                  </div>
                </div>

                {/* Groups */}
                {selectedMember.groups && selectedMember.groups.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <h5 className="text-sm font-semibold text-amber-700 mb-3">Groups</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.groups.map((group, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-200 text-amber-700"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-between gap-3 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => {
                  handleDeleteMember(selectedMember);
                  setSelectedMember(null);
                }}
                className="px-4 py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Member
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button className={`px-4 py-2.5 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors font-medium shadow-sm`}>
                  Edit Member
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
