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
  X,
  ChevronRight,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  Shield,
  Zap,
  Filter,
  ArrowDownWideNarrow,
  Check,
  RefreshCw,
  Download,
  Building2,
  MapPin,
  MoreVertical,
  Plus,
  Star,
  Tag,
  Edit2
} from 'lucide-react';
import { useAdminTheme } from './admin/AdminThemeProvider';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { HQMembersService } from '@/lib/hq-members-service';
import { ZoneInvitationService } from '@/lib/zone-invitation-service';
import { useZone } from '@/hooks/useZone';
import { useAuthContext } from '@/contexts/AuthContext';
import { isHQAdminEmail } from '@/config/roles';
import { isHQGroup } from '@/config/zones';
import CustomLoader from './CustomLoader';
import { authedFetch } from '@/lib/authed-fetch'

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
  id: string; // This is the User ID
  membershipId?: string; // This is the Document ID in zone_members or hq_members
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
  can_access_pre_rehearsal?: boolean;
  has_hq_access?: boolean;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Member>>({});

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

  // Zone loading
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

  // Data loading
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
            membershipId: member.id, // Capture unique doc ID
            zoneId: member.groupId || member.zoneId,
            zoneName: allZones.find(z => z.id === (member.groupId || member.zoneId))?.name || member.groupId || 'HQ'
          }));

          // Load all zone members
          const allZoneMembers = await FirebaseDatabaseService.getCollection('zone_members');
          const zoneMembersList = allZoneMembers.map((member: any) => ({
            ...member,
            membershipId: member.id, // Capture unique doc ID
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
            membershipId: member.id, // Capture unique doc ID
            zoneId: filterZone,
            zoneName: allZones.find(z => z.id === filterZone)?.name || filterZone
          }));
        } else {
          // Load specific zone members
          zoneMemberships = await ZoneInvitationService.getZoneMembers(filterZone);
          zoneMemberships = zoneMemberships.map((member: any) => ({
            ...member,
            membershipId: member.id, // Capture unique doc ID
            zoneId: filterZone,
            zoneName: allZones.find(z => z.id === filterZone)?.name || filterZone
          }));
        }
      } else {
        zoneMemberships = await ZoneInvitationService.getZoneMembers(currentZone.id);
        // Ensure membershipId is captured for standard zones too
        zoneMemberships = zoneMemberships.map((member: any) => ({
          ...member,
          membershipId: member.id
        }));
      }


      // Batch retrieval
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
          membershipId: membership.membershipId || membership.id, // Store key for deletion
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
          zoneName: membership.zoneName,
          can_access_pre_rehearsal: !!profile?.can_access_pre_rehearsal
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
 console.error(' Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lifecycle
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

  // Search filter
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.administration?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Statistics
  const memberStats = {
    total: members.length,
    active: members.filter(m => m.is_active).length,
    coordinators: members.filter(m => m.role === 'coordinator').length,
    today: members.filter(m => {
      const today = new Date();
      const joinDate = new Date(m.created_at);
      return today.toDateString() === joinDate.toDateString();
    }).length
  };

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

  // Delete handler
  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}? This will PERMANENTLY remove their account, profile, and all association with this platform. This action cannot be undone.`)) {
      return;
    }

    const { user: currentAdmin } = await import('@/lib/firebase-setup').then(m => ({ user: m.auth.currentUser }));

    try {
      setLoading(true);

      // 1. Call our custom API to delete from Auth and Profile
      // This is more robust than just deleting the document
      const response = await authedFetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.id,
          adminId: currentAdmin?.uid || 'unknown'
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user account');
      }

      // Membership cleanup
      if (member.zoneId) {
        await ZoneInvitationService.removeUserFromZone(member.id, member.zoneId);
      }

      showToast(` ${member.first_name} ${member.last_name} deleted successfully`, 'success');

      // Invalidate cache and reload
      if (currentZone) {
        const cacheKey = getCacheKey(currentZone.id, filterZone);
        membersCache.delete(cacheKey);
      }
      loadMembers(true); // Force reload the list
    } catch (error: any) {
 console.error('Error deleting member:', error);
      showToast(` ${error.message || 'Failed to delete member'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update handler
  const handleSaveMember = async () => {
    if (!selectedMember || !editForm) return;

    try {
      setLoading(true);

      // Clean up undefined values
      const updates = Object.fromEntries(
        Object.entries(editForm).filter(([_, v]) => v !== undefined)
      );

      // Update profile in Firestore
      await FirebaseDatabaseService.updateUserProfile(selectedMember.id, updates);

      // Update local state
      const updatedMember = { ...selectedMember, ...updates };
      setSelectedMember(updatedMember);
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? updatedMember : m));

      // Update cache
      if (currentZone) {
        const cacheKey = getCacheKey(currentZone.id, filterZone);
        const cached = membersCache.get(cacheKey);
        if (cached) {
          const updatedData = cached.data.map(m => m.id === selectedMember.id ? updatedMember : m);
          membersCache.set(cacheKey, { ...cached, data: updatedData });
        }
      }

      setIsEditing(false);
      showToast(' Member profile updated successfully', 'success');
    } catch (error: any) {
 console.error('Error updating member:', error);
      showToast(` Failed to update member: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEditing = (member: Member) => {
    setEditForm({
      first_name: member.first_name,
      last_name: member.last_name,
      middle_name: member.middle_name,
      phone: member.phone,
      gender: member.gender,
      birthday: member.birthday,
      region: member.region,
      church: member.church,
      designation: member.designation,
      administration: member.administration,
    });
    setIsEditing(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-full bg-white lg:bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 lg:px-8 py-5 lg:py-8 flex-shrink-0">
        <div className="flex items-start justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Members</h1>
            <p className="text-sm text-slate-400 mt-1">Manage personnel and oversight for your {currentZone?.name || 'Zone'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMembers(true)}
              disabled={loading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all active:scale-95 border border-slate-100 shadow-sm"
              title="Refresh List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportMembers}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          <StatCard
            label="Total Members"
            value={memberStats.total}
            icon={<Users className="w-4 h-4" />}
            color="purple"
          />
          <StatCard
            label="Active Now"
            value={memberStats.active}
            icon={<Zap className="w-4 h-4" />}
            color="green"
            pulse
          />
          <StatCard
            label="Coordinators"
            value={memberStats.coordinators}
            icon={<ShieldCheck className="w-4 h-4" />}
            color="blue"
          />
          <StatCard
            label="Joined Today"
            value={memberStats.today}
            icon={<TrendingUp className="w-4 h-4" />}
            color="orange"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100 px-4 lg:px-8 py-4 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
            />
          </div>

          {/* Type Filters (Zone selection for HQ) */}
          {currentZone && isHQGroup(currentZone.id) && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterZone('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  filterZone === 'all'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                }`}
              >
                All Zones
              </button>
              {allZones.filter(z => z.id !== 'zone-boss').map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setFilterZone(zone.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                    filterZone === zone.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                      : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {zone.name.replace('Loveworld Singers ', '').replace('LWS ', '')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 bg-slate-50/50">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-[1px]">
            <CustomLoader message="Loading members..." />
          </div>
        )}
        {filteredMembers.length === 0 ? (
          <div className="flex items-center justify-center p-12 lg:p-20">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/5 transition-transform hover:scale-110">
                <Users className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Members Found</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                {searchTerm
                  ? 'Adjust your search parameters'
                  : 'Start building your zone community'}
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-24">
            {/* Desktop View */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role & Designation</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredMembers.slice(0, displayLimit).map((member) => (
                    <tr 
                      key={member.id} 
                      className="group hover:bg-slate-50 transition-all cursor-pointer"
                      onClick={() => setSelectedMember(member)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap border-l-4 border-transparent group-hover:border-purple-500 transition-all">
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0 h-10 w-10">
                            {member.profile_image_url ? (
                              <img
                                className="h-10 w-10 rounded-xl object-cover shadow-sm ring-2 ring-white"
                                src={member.profile_image_url}
                                alt={member.first_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-100 shadow-sm">
                                <span className="text-slate-500 font-bold text-xs">
                                  {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                </span>
                              </div>
                            )}
                            {member.is_active && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                              ID: {member.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-600 space-y-0.5">
                          <div className="flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-pointer">
                            <Mail className="w-3.5 h-3.5 text-slate-300" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-pointer">
                              <Phone className="w-3.5 h-3.5 text-slate-300" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{member.designation || 'Member'}</span>
                          <span className="text-[11px] font-medium text-slate-400">{member.administration || 'No Admin Unit'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          member.is_active 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {member.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-purple-600 rounded-xl transition-all active:scale-95"
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all active:scale-95"
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

            {/* Mobile View */}
            <div className="lg:hidden">
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
                            <span className="text-white text-[8px]"></span>
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
                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-full text-slate-300">
                      <ChevronRight className="w-5 h-5 transition-transform group-active:translate-x-1" />
                    </div>
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
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedMember && (
        <MemberProfileModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)}
          setMembers={setMembers}
          setSelectedMember={setSelectedMember}
          showToast={showToast}
        />
      )}
      {/* Old modal code removed */}
    </div>
  );
}

// Stats Card Component
function StatCard({
  label,
  value,
  icon,
  color,
  pulse
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'blue' | 'orange';
  pulse?: boolean;
}) {
  const colors = {
    purple: 'border-purple-500 bg-purple-50/50 text-purple-600',
    green: 'border-emerald-500 bg-emerald-50/50 text-emerald-600',
    blue: 'border-blue-500 bg-blue-50/50 text-blue-600',
    orange: 'border-orange-500 bg-orange-50/50 text-orange-600'
  };

  const iconColors = {
    purple: 'bg-purple-500 text-white shadow-purple-200',
    green: 'bg-emerald-500 text-white shadow-emerald-200',
    blue: 'bg-blue-500 text-white shadow-blue-200',
    orange: 'bg-orange-500 text-white shadow-orange-200'
  };

  return (
    <div className={`flex-shrink-0 w-[160px] lg:w-auto lg:flex-1 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md border-l-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${iconColors[color]}`}>
          {icon}
        </div>
        {pulse && (
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

// Profile Modal Component
function MemberProfileModal({
  member,
  onClose,
  setMembers,
  setSelectedMember,
  showToast
}: {
  member: Member;
  onClose: () => void;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setSelectedMember: React.Dispatch<React.SetStateAction<Member | null>>;
  showToast: (message: string, type: 'success' | 'error') => void;
}) {
  const { user: currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'settings'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Member>>({ ...member });

  useEffect(() => {
    setEditForm({ ...member });
  }, [member]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await FirebaseDatabaseService.updateDocument('profiles', member.id, editForm);
      const updatedMember = { ...member, ...editForm };
      
      setMembers(prev => prev.map(m => m.id === member.id ? updatedMember : m));
      setSelectedMember(updatedMember);
      setIsEditing(false);
      showToast(' Member profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating member:', error);
      showToast(' Failed to update member profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(' Are you sure you want to delete this member? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await FirebaseDatabaseService.deleteDocument('profiles', member.id);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      onClose();
      showToast(' Member deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting member:', error);
      showToast(' Failed to delete member', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out slide-in-from-right">
          {/* Header */}
          <div className="relative p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">Member Profile</h2>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Overview */}
          <div className="p-8 pb-4 text-center border-b border-slate-50">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 overflow-hidden">
                {member.profile_image_url ? (
                  <img src={member.profile_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  `${member.first_name?.[0].toUpperCase()}${member.last_name?.[0].toUpperCase()}`
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-1">
              {member.first_name} {member.last_name}
            </h3>
            <p className="text-slate-500 font-medium text-sm mb-4">{member.email}</p>
            
            <div className="flex items-center justify-center gap-2">
              <StatusBadge label={member.zoneName || 'Zonal Member'} color="indigo" icon={<Shield className="w-3 h-3" />} />
              {member.designation && (
                <StatusBadge label={member.designation} color="emerald" icon={<Star className="w-3 h-3" />} />
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-2 gap-1 bg-slate-50/50 border-b border-slate-100">
            {[
              { id: 'info', label: 'Details', icon: <Building2 className="w-4 h-4" /> },
              { id: 'activity', label: 'Activity', icon: <Calendar className="w-4 h-4" /> },
              { id: 'settings', label: 'Access', icon: <Shield className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {activeTab === 'info' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <EditableField 
                      label="First Name" 
                      value={editForm.first_name || ''} 
                      isEditing={isEditing} 
                      onChange={val => setEditForm(p => ({ ...p, first_name: val }))} 
                    />
                    <EditableField 
                      label="Last Name" 
                      value={editForm.last_name || ''} 
                      isEditing={isEditing} 
                      onChange={val => setEditForm(p => ({ ...p, last_name: val }))} 
                    />
                    <InfoField label="Primary Email" value={member.email} icon={<Mail className="w-4 h-4" />} />
                    <EditableField 
                      label="Phone Number" 
                      value={editForm.phone || ''} 
                      isEditing={isEditing} 
                      onChange={val => setEditForm(p => ({ ...p, phone: val }))} 
                      icon={<Phone className="w-4 h-4" />}
                    />
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Church Details</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <EditableField 
                      label="Zone" 
                      value={editForm.zoneName || ''} 
                      isEditing={isEditing} 
                      onChange={val => setEditForm(p => ({ ...p, zoneName: val }))} 
                      icon={<MapPin className="w-4 h-4" />}
                    />
                    <EditableField 
                      label="Church" 
                      value={editForm.church || ''} 
                      isEditing={isEditing} 
                      onChange={val => setEditForm(p => ({ ...p, church: val }))} 
                      icon={<Building2 className="w-4 h-4" />}
                    />
                    <EditableField 
                      label="Designation" 
                      value={editForm.designation || ''} 
                      isEditing={isEditing} 
                      onChange={val => setEditForm(p => ({ ...p, designation: val }))} 
                      icon={<Tag className="w-4 h-4" />}
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center h-full text-center p-12">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                  <Calendar className="w-8 h-8" />
                </div>
                <h5 className="text-slate-900 font-bold mb-1 font-outfit">No Recent Activity</h5>
                <p className="text-slate-500 text-sm">Attendance and contribution logs will appear here soon.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">System Access</h4>
                  <div className="p-5 rounded-3xl border border-slate-100 bg-slate-50/30 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Pre-Rehearsal Access</p>
                        <p className="text-xs text-slate-500">Allow member to view practice materials early</p>
                      </div>
                      <button
                        onClick={async () => {
                          const newState = !member.can_access_pre_rehearsal;
                          try {
                            await FirebaseDatabaseService.updateDocument('profiles', member.id, {
                              can_access_pre_rehearsal: newState
                            });
                            const updated = { ...member, can_access_pre_rehearsal: newState };
                            setMembers(prev => prev.map(m => m.id === member.id ? updated : m));
                            setSelectedMember(updated);
                            showToast(` Access ${newState ? 'granted' : 'revoked'} successfully`, 'success');
                          } catch (exp) {
                            showToast(' Failed to change access', 'error');
                          }
                        }}
                        className={`w-11 h-6 rounded-full transition-all relative ${member.can_access_pre_rehearsal ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${member.can_access_pre_rehearsal ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Restricted HQ Access Switch */}
                    {isHQAdminEmail(currentUser?.email) && (
                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Global HQ Access</p>
                          <p className="text-xs text-slate-500">Grant full access to HQ programs & Master Library</p>
                        </div>
                        <button
                          onClick={async () => {
                            const newState = !member.has_hq_access;
                            try {
                              await FirebaseDatabaseService.updateDocument('profiles', member.id, {
                                has_hq_access: newState
                              });
                              const updated = { ...member, has_hq_access: newState };
                              setMembers(prev => prev.map(m => m.id === member.id ? updated : m));
                              setSelectedMember(updated);
                              showToast(` HQ Access ${newState ? 'granted' : 'revoked'} successfully`, 'success');
                            } catch (exp) {
                              showToast(' Failed to change HQ access', 'error');
                            }
                          }}
                          className={`w-11 h-6 rounded-full transition-all relative ${member.has_hq_access ? 'bg-purple-600' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${member.has_hq_access ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Account Status</p>
                          <p className="text-xs text-slate-500">Enable or disable this member's entire account</p>
                        </div>
                        <StatusBadge label="Active" color="emerald" />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Helper Components
function InfoField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-slate-50 bg-slate-50/30 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-slate-900 font-bold">{value || '---'}</p>
      </div>
    </div>
  );
}

function EditableField({ 
  label, 
  value, 
  isEditing, 
  onChange, 
  icon 
}: { 
  label: string; 
  value: string; 
  isEditing: boolean; 
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${isEditing ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-50 bg-slate-50/30'}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`w-10 h-10 rounded-xl bg-white border flex items-center justify-center shadow-sm ${isEditing ? 'border-indigo-100 text-indigo-400' : 'border-slate-100 text-slate-400'}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className={`text-[10px] font-black uppercase tracking-widest ${isEditing ? 'text-indigo-400' : 'text-slate-400'}`}>{label}</p>
          {isEditing ? (
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-slate-900 font-bold focus:ring-0 text-base"
              autoFocus
            />
          ) : (
            <p className="text-slate-900 font-bold">{value || '---'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, color, icon }: { label: string; color: 'indigo' | 'emerald' | 'rose' | 'amber'; icon?: React.ReactNode }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 border shadow-sm ${colors[color]}`}>
      {icon}
      {label}
    </span>
  );
}
