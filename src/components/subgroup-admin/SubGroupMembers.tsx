"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  UserPlus,
  RefreshCw,
  X,
  Mail,
  Phone,
  Trash2
} from 'lucide-react';
import { ZoneInvitationService } from '@/lib/zone-invitation-service';
import CustomLoader from '@/components/CustomLoader';

interface SubGroupMembersProps {
  subGroupId: string;
  zoneId: string;
}

interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  joinedAt: Date;
}

export default function SubGroupMembers({ subGroupId, zoneId }: SubGroupMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [zoneMembers, setZoneMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedForAdd, setSelectedForAdd] = useState<string[]>([]);

  useEffect(() => {
    loadMembers();
  }, [subGroupId]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const { SubGroupDatabaseService } = await import('@/lib/subgroup-database-service');
      const data = await SubGroupDatabaseService.getSubGroupMembers(subGroupId);
      setMembers(data.map(m => ({
        id: m.id,
        name: m.first_name ? `${m.first_name} ${m.last_name || ''}` : m.name || 'Unknown',
        email: m.email,
        phone: m.phone,
        joinedAt: m.createdAt || new Date()
      })));
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadZoneMembers = async () => {
    try {
      const allZoneMembers = await ZoneInvitationService.getZoneMembers(zoneId);
      // Filter out already added members
      const memberIds = members.map(m => m.id);
      setZoneMembers(allZoneMembers.filter(m => !memberIds.includes(m.id)));
    } catch (error) {
      console.error('Error loading zone members:', error);
    }
  };

  const handleOpenAdd = () => {
    loadZoneMembers();
    setShowAddModal(true);
  };

  const handleAddMembers = async () => {
    if (selectedForAdd.length === 0) return;

    setAdding(true);
    try {
      const { SubGroupDatabaseService } = await import('@/lib/subgroup-database-service');
      const result = await SubGroupDatabaseService.addMembers(subGroupId, selectedForAdd);

      if (result.success) {
        setSelectedForAdd([]);
        setShowAddModal(false);
        loadMembers();
      }
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the sub-group?')) return;

    try {
      const { SubGroupDatabaseService } = await import('@/lib/subgroup-database-service');
      const result = await SubGroupDatabaseService.removeMember(subGroupId, memberId);

      if (result.success) {
        loadMembers();
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const toggleAddSelection = (memberId: string) => {
    setSelectedForAdd(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-slate-500">Manage your sub-group members</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Members</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No members yet</p>
          <button
            onClick={handleOpenAdd}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Add members from your zone →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{member.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </span>
                        )}
                        {member.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add Members</h2>
                    <p className="text-sm text-slate-500">Select from zone members</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {zoneMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No more members available to add</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {zoneMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => toggleAddSelection(member.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedForAdd.includes(member.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedForAdd.includes(member.id)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-slate-300'
                          }`}>
                          {selectedForAdd.includes(member.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <span className="text-slate-600 font-medium text-sm">
                            {(member.first_name || member.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {member.first_name ? `${member.first_name} ${member.last_name || ''}` : member.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-slate-500 truncate">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {selectedForAdd.length} selected
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMembers}
                    disabled={selectedForAdd.length === 0 || adding}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {adding ? (
                      <>
                        <CustomLoader size="sm" />
                        <span>Adding...</span>
                      </>
                    ) : 'Add Selected'}
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
