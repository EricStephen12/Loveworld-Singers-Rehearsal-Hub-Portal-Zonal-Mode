"use client";

import React, { useState } from 'react';
import {
  UsersRound,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Building2,
  GraduationCap,
  Users,
  Sparkles,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Check,
  X,
  AlertCircle,
  Copy,
  Calendar,
  Mail,
  User as UserIcon,
  Info
} from 'lucide-react';
import { useZoneSubGroups } from '@/hooks/useSubGroup';
import { SubGroup, SubGroupType, SubGroupStatus } from '@/lib/subgroup-service';
import CustomLoader from '@/components/CustomLoader';

const TYPE_ICONS: Record<SubGroupType, React.ReactNode> = {
  church: <Building2 className="w-4 h-4" />,
  campus: <GraduationCap className="w-4 h-4" />,
  cell: <Users className="w-4 h-4" />,
  youth: <Sparkles className="w-4 h-4" />,
  other: <UsersRound className="w-4 h-4" />
};

const TYPE_LABELS: Record<SubGroupType, string> = {
  church: 'Church Choir',
  campus: 'Campus Fellowship',
  cell: 'Cell Group',
  youth: 'Youth Choir',
  other: 'Other'
};

const STATUS_CONFIG: Record<SubGroupStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending Approval',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-3.5 h-3.5" />
  }
};

export default function SubGroupsSection() {
  const { 
    subGroups, 
    pendingSubGroups, 
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
        // Success notification handled by hook/service usually
      } else {
        alert(`Error: ${result.error}`);
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
        setIsRejectModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedSubGroup(null);
      } else {
        alert(`Error: ${result.error}`);
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
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 shadow-sm"
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


// Stat Card Component — matches premium dashboard style
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
    purple: 'border-purple-500 bg-purple-50/30 text-purple-600',
    green: 'border-emerald-500 bg-emerald-50/30 text-emerald-600',
    blue: 'border-blue-500 bg-blue-50/30 text-blue-600',
    orange: 'border-orange-500 bg-orange-50/30 text-orange-600'
  };

  const iconColors = {
    purple: 'bg-purple-600 text-white shadow-purple-100',
    green: 'bg-emerald-600 text-white shadow-emerald-100',
    blue: 'bg-blue-600 text-white shadow-blue-100',
    orange: 'bg-orange-600 text-white shadow-orange-100'
  };

  return (
    <div className={`flex-shrink-0 w-[160px] lg:w-auto lg:flex-1 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md border-l-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${iconColors[color]}`}>
          {icon}
        </div>
        {pulse && (
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
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

function SubGroupRow({
  subGroup,
  onApprove,
  onReject,
  onView,
  processing
}: {
  subGroup: SubGroup;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
  processing: boolean;
}) {
  const statusConfig = STATUS_CONFIG[subGroup.status];
  const typeIcon = TYPE_ICONS[subGroup.type];
  const typeLabel = TYPE_LABELS[subGroup.type];

  return (
    <div className="group bg-white hover:bg-slate-50/80 transition-all duration-300">
      {/* Main Row - Tappable */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer active:scale-[0.99] transition-transform"
        onClick={onView}
      >
        {/* Icon with gradient */}
        <div className={`w-14 h-14 lg:w-12 lg:h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${subGroup.status === 'active'
          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-100'
          : subGroup.status === 'pending'
            ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-100'
            : 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-100'
          }`}>
          <div className="text-white">
            {React.isValidElement(typeIcon) && React.cloneElement(typeIcon as React.ReactElement<any>, { className: "w-6 h-6" })}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-black text-slate-900 truncate tracking-tight text-base">{subGroup.name}</h3>
            {subGroup.status === 'active' && (
              <div className="flex-shrink-0 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm shadow-emerald-200">
                <Check className="text-white w-2.5 h-2.5 stroke-[4px]" />
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-400 truncate uppercase tracking-widest text-[10px]">
            {typeLabel} • <span className="text-slate-500 font-bold">{subGroup.coordinatorName || 'Unassigned'}</span>
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-black/5 ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-full border border-slate-100">
              <Users className="w-3 h-3" />
              {subGroup.estimatedMembers} MEMBERS
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          {subGroup.status === 'pending' && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(); }}
                disabled={processing}
                className="h-10 px-4 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-100 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                Approve
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(); }}
                disabled={processing}
                className="h-10 px-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 border border-red-100"
              >
                <X className="w-4 h-4 stroke-[3px]" />
                Reject
              </button>
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-all active:scale-90 bg-white"
            title="View details"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Action Bar - Only for pending */}
      {subGroup.status === 'pending' && (
        <div className="lg:hidden flex items-center justify-end gap-3 px-5 py-3 bg-slate-50/50 border-t border-slate-100/50">
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            disabled={processing}
            className="flex-1 h-11 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3px]" />
            Approve
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            disabled={processing}
            className="flex-1 h-11 bg-red-100 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4 stroke-[3px]" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// Reject Modal Component
function RejectModal({
  subGroup,
  reason,
  onReasonChange,
  onConfirm,
  onClose,
  processing
}: {
  subGroup: SubGroup;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  processing: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Reject Request</h2>
              <p className="text-sm text-slate-500">"{subGroup.name}"</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Reason for rejection
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Please provide a reason for rejecting this request..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-2">
            This reason will be sent to the requester.
          </p>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim() || processing}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <CustomLoader size="sm" />
                <span className="ml-2">Rejecting...</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                Reject Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-Group Detail Modal Component (Modern Slide-over)
function SubGroupDetailModal({
  subGroup,
  onApprove,
  onReject,
  onClose,
  processing
}: {
  subGroup: SubGroup;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  processing: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const statusConfig = STATUS_CONFIG[subGroup.status];
  const typeLabel = TYPE_LABELS[subGroup.type];
  const typeIcon = TYPE_ICONS[subGroup.type];

  const copyEmail = () => {
    if (!subGroup.coordinatorEmail) return;
    navigator.clipboard.writeText(subGroup.coordinatorEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Slide-over Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header/Banner Area */}
        <div className={`relative h-32 flex-shrink-0 ${
          subGroup.status === 'active' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
          subGroup.status === 'pending' ? 'bg-gradient-to-br from-orange-500 to-amber-600' :
          'bg-gradient-to-br from-slate-500 to-slate-600'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all backdrop-blur-md z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white p-1 shadow-xl">
              <div className={`w-full h-full rounded-[2.2rem] flex items-center justify-center text-white ${
                subGroup.status === 'active' ? 'bg-emerald-500' :
                subGroup.status === 'pending' ? 'bg-orange-500' : 'bg-indigo-500'
              }`}>
                {React.isValidElement(typeIcon) && React.cloneElement(typeIcon as React.ReactElement<any>, { className: "w-10 h-10" })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-14 pb-4 px-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-slate-900 truncate tracking-tight">{subGroup.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{typeLabel}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          {/* Quick Stats Grid */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/50 group hover:bg-white hover:shadow-md transition-all">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Est. Capacity</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 leading-none">{subGroup.estimatedMembers}</span>
              </div>
            </div>
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/50 group hover:bg-white hover:shadow-md transition-all">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Members</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 leading-none">{subGroup.memberIds?.length || 0}</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Purpose & Mission
            </h4>
            <div className="p-6 rounded-[2rem] bg-indigo-50/30 border border-indigo-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Sparkles className="w-16 h-16 text-indigo-600" />
              </div>
              <p className="text-slate-600 leading-relaxed text-[15px] italic whitespace-pre-wrap relative z-10">
                "{subGroup.description || 'Commitment to excellence in ministry through subgroup activities and shared rehearsal goals.'}"
              </p>
            </div>
          </section>

          {/* Coordinator Section */}
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Administrative Head
            </h4>
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100">
                  {subGroup.coordinatorName?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 tracking-tight">{subGroup.coordinatorName}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub-Group Coordinator</p>
                </div>
              </div>
              
              {subGroup.coordinatorEmail && (
                <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{subGroup.coordinatorEmail}</span>
                  </div>
                  <button
                    onClick={copyEmail}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      copied ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </section>
          
          {subGroup.status === 'rejected' && subGroup.rejectionReason && (
            <section className="animate-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100">
                <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Rejection Feedback</h4>
                <p className="text-rose-700 font-medium italic text-sm leading-relaxed">
                  "{subGroup.rejectionReason}"
                </p>
              </div>
            </section>
          )}

          <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest py-4 border-t border-slate-50">
            <Calendar className="w-3.5 h-3.5" />
            <span>Requested on {subGroup.createdAt?.toLocaleDateString?.('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) || 'Recent'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-white flex flex-col gap-3">
          {subGroup.status === 'pending' ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onApprove}
                disabled={processing}
                className="flex-1 h-14 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-[1.25rem] hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 disabled:opacity-50"
              >
                {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 stroke-[3px]" />}
                Approve Sub-Group
              </button>
              <button
                onClick={onReject}
                disabled={processing}
                className="flex-1 h-14 bg-rose-50 text-rose-600 font-black uppercase tracking-widest rounded-[1.25rem] hover:bg-rose-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full h-14 bg-slate-900 text-white font-black uppercase tracking-widest rounded-[1.25rem] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
            >
              Close Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
