"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  UserCheck,
  UserX,
  MoreVertical,
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
import { useZone } from '@/contexts/ZoneContext';
import { isHQGroup } from '@/config/zones';

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
  const loadMembers = async () => {
    if (!currentZone) {
      console.log('⏳ Waiting for zone to load...');
      return;
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
      
      // Get profiles for each member
      const membersData = await Promise.all(
        zoneMemberships.map(async (membership: any) => {
          const profile = await FirebaseDatabaseService.getDocument('profiles', membership.userId) as any;
          
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
        })
      );
      
      setMembers(membersData);
      console.log(`✅ Loaded ${membersData.length} members for ${currentZone.name}`);
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 lg:p-6">
      {/* Header */}
      <div className="flex-shrink-0 mb-4 lg:mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 flex-1">Members</h2>
          {members.length > 0 && (
            <span className="text-sm text-slate-600">
              {members.length}
            </span>
          )}
          <button
            onClick={loadMembers}
            disabled={loading}
            className={`p-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportMembers}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 mb-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Zone Filter - Only for HQ Admins */}
          {currentZone && isHQGroup(currentZone.id) && (
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50 font-medium"
            >
              <option value="current">🏢 HQ Members Only</option>
              <option value="all">🌍 All Zone Members</option>
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
            className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <>
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
          <div className="flex items-center justify-center h-full p-12">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No members found</p>
              <p className="text-sm text-gray-400">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No members have been added yet'}
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
                {filteredMembers.map((member) => (
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
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Cards */}
          <div className="lg:hidden overflow-auto h-full p-3">
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm active:scale-98 transition-transform"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {member.profile_image_url ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                          src={member.profile_image_url}
                          alt={`${member.first_name} ${member.last_name}`}
                        />
                      ) : (
                        <div className={`h-12 w-12 rounded-full ${theme.primaryLight} flex items-center justify-center border-2 border-white shadow-sm`}>
                          <span className={`${theme.text} font-semibold text-sm`}>
                            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-900 truncate">
                          {member.first_name} {member.last_name}
                        </h3>
                        <p className="text-xs text-slate-600 truncate">{member.email}</p>
                        {member.zoneName && filterZone === 'all' && (
                          <p className="text-xs text-purple-600 font-medium mt-0.5 truncate">
                            📍 {member.zoneName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Role</span>
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        member.role === 'coordinator'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role || 'member'}
                      </span>
                    </div>
                    
                    {member.designation && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Designation</span>
                        <span className="text-slate-900 font-medium">{member.designation}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status</span>
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        member.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-slate-50 px-3 py-2 flex items-center justify-between border-t border-slate-200">
                    <span className="text-xs text-slate-500">
                      Joined {formatDate(member.created_at)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
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
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-200 flex-shrink-0">
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
      )}
    </div>
  );
}
