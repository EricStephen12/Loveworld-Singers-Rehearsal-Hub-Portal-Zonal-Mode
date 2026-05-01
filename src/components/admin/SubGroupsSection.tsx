"use client";

import React, { useState } from 'react';
import {
  UsersRound,
  Search,
  Clock,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useZoneSubGroups } from '@/hooks/useSubGroup';
import { SubGroup } from '@/lib/subgroup-service';
import CustomLoader from '@/components/CustomLoader';
import { Toast } from '@/components/Toast';

// Sub-components
import { StatCard } from './subgroups/StatCard';
import { SubGroupRow } from './subgroups/SubGroupRow';
import { RejectModal } from './subgroups/RejectModal';
import { SubGroupDetailModal } from './subgroups/SubGroupDetailModal';

interface SubGroupsSectionProps {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

export default function SubGroupsSection({ addToast }: SubGroupsSectionProps) {
  const { 
    subGroups, 
    activeSubGroups, 
    pendingCount, 
    isLoading, 
    approveSubGroup, 
    rejectSubGroup,
    refresh
  } = useZoneSubGroups();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'all'>('pending');
  const [selectedSubGroup, setSelectedSubGroup] = useState<SubGroup | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Statistics
  const stats = [
    { label: 'Total Groups', value: subGroups.length, icon: <UsersRound className="w-4 h-4" />, color: 'purple' as const },
    { label: 'Pending Requests', value: pendingCount, icon: <Clock className="w-4 h-4" />, color: 'orange' as const, pulse: pendingCount > 0 },
    { label: 'Active Groups', value: activeSubGroups.length, icon: <CheckCircle className="w-4 h-4" />, color: 'green' as const },
  ];

  // Filtered groups
  const filteredGroups = subGroups.filter(sg => {
    const matchesSearch = sg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (sg.coordinatorName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'pending') return matchesSearch && sg.status === 'pending';
    if (activeTab === 'active') return matchesSearch && sg.status === 'active';
    return matchesSearch;
  });

  const handleApprove = async (id: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await approveSubGroup(id);
      if (result.success) {
        addToast({ message: 'Sub-group approved successfully!', type: 'success' });
      } else {
        addToast({ message: `Error: ${result.error}`, type: 'error' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (subGroup: SubGroup) => {
    setSelectedSubGroup(subGroup);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedSubGroup || !rejectReason.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await rejectSubGroup(selectedSubGroup.id, rejectReason);
      if (result.success) {
        addToast({ message: 'Sub-group request rejected.', type: 'info' });
        setIsRejectModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedSubGroup(null);
      } else {
        addToast({ message: `Error: ${result.error}`, type: 'error' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const openDetailModal = (subGroup: SubGroup) => {
    setSelectedSubGroup(subGroup);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <CustomLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-hide">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 pt-5 lg:pt-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sub-Groups</h1>
              <p className="text-sm text-gray-400 mt-1">Manage church subgroup requests in your zone</p>
            </div>
            <button
              onClick={refresh}
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-colors active:scale-95 flex-shrink-0"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Stats — horizontal scroll like dashboard */}
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            {(['pending', 'active', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all capitalize flex items-center gap-1.5 ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="w-4 h-4 bg-yellow-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {filteredGroups.length === 0 ? (
            <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                <UsersRound className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 font-outfit uppercase tracking-tight">No groups found</h3>
              <p className="text-slate-500 text-[15px] max-w-xs mx-auto leading-relaxed">
                {searchQuery ? 'Try adjusting your search criteria' : `No ${activeTab === 'all' ? '' : activeTab} subgroup requests were found in the system.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredGroups.map((sg) => (
                <SubGroupRow
                  key={sg.id}
                  subGroup={sg}
                  onApprove={() => handleApprove(sg.id)}
                  onReject={() => openRejectModal(sg)}
                  onView={() => openDetailModal(sg)}
                  processing={isProcessing}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && selectedSubGroup && (
        <RejectModal
          subGroup={selectedSubGroup}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          onConfirm={handleReject}
          onClose={() => setIsRejectModalOpen(false)}
          processing={isProcessing}
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedSubGroup && (
        <SubGroupDetailModal
          subGroup={selectedSubGroup}
          onApprove={() => handleApprove(selectedSubGroup.id)}
          onReject={() => openRejectModal(selectedSubGroup)}
          onClose={() => {
            setIsDetailModalOpen(false);
            if (!isRejectModalOpen) setSelectedSubGroup(null);
          }}
          processing={isProcessing}
        />
      )}
    </div>
  );
}
