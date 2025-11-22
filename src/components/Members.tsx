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
  X
} from 'lucide-react';
import { FirebaseDatabaseService } from '@/lib/firebase-database';

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
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Load members from Firebase
  const loadMembers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading members from Firebase...');
      
      // Get all profiles from Firebase
      const profiles = await FirebaseDatabaseService.getCollection('profiles');
      
      if (profiles) {
        // Transform profiles to members format
        const membersData = profiles.map((profile: any) => ({
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          designation: profile.designation || '',
          administration: profile.administration || '',
          profile_image_url: profile.profile_image_url || '',
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
          is_active: profile.is_active !== false,
          groups: profile.groups || [],
          role: profile.role || 'member'
        }));
        
        setMembers(membersData);
        console.log(`✅ Loaded ${membersData.length} members`);
      }
    } catch (error) {
      console.error('❌ Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load members on component mount
  useEffect(() => {
    loadMembers();
  }, []);

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
    <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Members Management</h2>
          <p className="text-slate-600 mt-1">
            Manage all LoveWorld Singers members
            {members.length > 0 && (
              <span className="ml-2 text-purple-600 font-medium">
                ({members.length} members)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadMembers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportMembers}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search members by name, email, designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading members...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No members found</p>
            <p className="text-sm text-gray-400">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No members have been added yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
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
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
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
                        <div className="text-xs text-purple-600 font-medium">
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
                          className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
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
        )}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Member Details</h3>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Profile Info */}
                <div className="flex items-center gap-4">
                  {selectedMember.profile_image_url ? (
                    <img
                      className="h-20 w-20 rounded-full object-cover"
                      src={selectedMember.profile_image_url}
                      alt={`${selectedMember.first_name} ${selectedMember.last_name}`}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-xl">
                        {selectedMember.first_name.charAt(0)}{selectedMember.last_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedMember.first_name} {selectedMember.last_name}
                    </h4>
                    <p className="text-gray-600">{selectedMember.email}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      selectedMember.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedMember.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedMember.email}</p>
                  </div>
                  {selectedMember.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900">{selectedMember.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <p className="text-sm text-gray-900">{selectedMember.designation || 'Member'}</p>
                  </div>
                  {selectedMember.administration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Administration</label>
                      <p className="text-sm text-gray-900">{selectedMember.administration}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-sm text-gray-900">{selectedMember.role || 'member'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedMember.created_at)}</p>
                  </div>
                </div>

                {/* Groups */}
                {selectedMember.groups && selectedMember.groups.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Groups</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.groups.map((group, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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
