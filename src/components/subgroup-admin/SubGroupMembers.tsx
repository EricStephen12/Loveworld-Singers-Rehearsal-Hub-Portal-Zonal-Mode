"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
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
    if (!confirm('Remove from group?')) return;
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
    <div className="flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-8 mb-10">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Members</h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-black text-xs uppercase tracking-widest"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-10">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-purple-600 transition-all"
        />
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 p-20 text-center">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No members found</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="py-4 px-8 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                        <span className="text-slate-400 font-black text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm tracking-tight">{member.name}</h3>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex flex-col gap-1">
                      {member.email && (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Mail className="w-3 h-3 opacity-30" />
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Phone className="w-3 h-3 opacity-30" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[130] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Members</h2>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Zone Selection</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-600 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-3 bg-white">
              {zoneMembers.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 text-slate-100 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No members found</p>
                </div>
              ) : (
                zoneMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => toggleAddSelection(member.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedForAdd.includes(member.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-slate-100 hover:border-purple-200 bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedForAdd.includes(member.id)
                          ? 'border-purple-600 bg-purple-600 shadow-md shadow-purple-600/20'
                          : 'border-slate-200'
                        }`}>
                        {selectedForAdd.includes(member.id) && (
                          <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                        )}
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                        <span className="text-slate-400 font-black text-xs uppercase">
                          {(member.first_name || member.name || 'U').charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm truncate">
                          {member.first_name ? `${member.first_name} ${member.last_name || ''}` : member.name || 'Unknown'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {selectedForAdd.length} Selected
              </span>
              <button
                onClick={handleAddMembers}
                disabled={selectedForAdd.length === 0 || adding}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20"
              >
                {adding ? 'Processing...' : 'Add Members'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
