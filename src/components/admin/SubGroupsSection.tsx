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
  AlertCircle
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
  approved_pending_payment: {
    label: 'Awaiting Payment',
    color: 'bg-blue-100 text-blue-700',
    icon: <CreditCard className="w-3.5 h-3.5" />
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
    pendingCount,
    isLoading,
    approveSubGroup,
    rejectSubGroup,
    refresh
  } = useZoneSubGroups();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubGroupStatus | 'all'>('all');
  const [selectedSubGroup, setSelectedSubGroup] = useState<SubGroup | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter sub-groups
  const filteredSubGroups = subGroups.filter(sg => {
    const matchesSearch =
      sg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sg.coordinatorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (subGroup: SubGroup) => {
    setProcessing(true);
    const result = await approveSubGroup(subGroup.id);
    setProcessing(false);

    if (result.success) {
      // Get real user info
      const userName = localStorage.getItem('userName') ||
        localStorage.getItem('userEmail') ||
        'Admin';

      // Global toast event with activity logging data
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: `"${subGroup.name}" has been approved`,
          type: 'success',
          userName: userName,
          action: 'updated',
          section: 'subgroups',
          itemName: subGroup.name
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: result.error || 'Failed to approve',
          type: 'error'
        }
      }));
    }
  };

  const handleReject = async () => {
    if (!selectedSubGroup || !rejectReason.trim()) return;

    setProcessing(true);
    const result = await rejectSubGroup(selectedSubGroup.id, rejectReason);
    setProcessing(false);

    if (result.success) {
      // Get real user info
      const userName = localStorage.getItem('userName') ||
        localStorage.getItem('userEmail') ||
        'Admin';

      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: `"${selectedSubGroup.name}" has been rejected`,
          type: 'success',
          userName: userName,
          action: 'updated',
          section: 'subgroups',
          itemName: selectedSubGroup.name
        }
      }));
      setShowRejectModal(false);
      setSelectedSubGroup(null);
      setRejectReason('');
    } else {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: result.error || 'Failed to reject',
          type: 'error'
        }
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <CustomLoader message="Loading sub-groups..." />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersRound className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Sub-Groups</h1>
                <p className="text-slate-500 text-sm">
                  Manage sub-group requests and active groups
                </p>
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{pendingCount} pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats - Horizontal Scroll on Mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 mb-6 scrollbar-hide">
          <StatCard
            label="Total"
            value={subGroups.length}
            icon={<UsersRound className="w-5 h-5 text-purple-600" />}
            bgColor="bg-purple-100"
          />
          <StatCard
            label="Active"
            value={subGroups.filter(sg => sg.status === 'active').length}
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            bgColor="bg-green-100"
          />
          <StatCard
            label="Pending"
            value={subGroups.filter(sg => sg.status === 'pending').length}
            icon={<Clock className="w-5 h-5 text-yellow-600" />}
            bgColor="bg-yellow-100"
          />
          <StatCard
            label="Awaiting"
            value={subGroups.filter(sg => sg.status === 'approved_pending_payment').length}
            icon={<CreditCard className="w-5 h-5 text-blue-600" />}
            bgColor="bg-blue-100"
          />
        </div>

        {/* Filters - Instagram Style */}
        <div className="space-y-3 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or coordinator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Status Filter Pills - Horizontal Scroll on Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide">
            {[
              { value: 'all', label: 'All', count: subGroups.length },
              { value: 'pending', label: 'Pending', count: subGroups.filter(sg => sg.status === 'pending').length },
              { value: 'approved_pending_payment', label: 'Awaiting Pay', count: subGroups.filter(sg => sg.status === 'approved_pending_payment').length },
              { value: 'active', label: 'Active', count: subGroups.filter(sg => sg.status === 'active').length },
              { value: 'rejected', label: 'Rejected', count: subGroups.filter(sg => sg.status === 'rejected').length },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value as SubGroupStatus | 'all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${statusFilter === filter.value
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className={`ml-1.5 ${statusFilter === filter.value ? 'text-purple-200' : 'text-slate-400'}`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Groups List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredSubGroups.length === 0 ? (
            <div className="p-8 text-center">
              <UsersRound className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'No sub-groups match your filters'
                  : 'No sub-group requests yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSubGroups.map((subGroup) => (
                <SubGroupRow
                  key={subGroup.id}
                  subGroup={subGroup}
                  onApprove={() => handleApprove(subGroup)}
                  onReject={() => {
                    setSelectedSubGroup(subGroup);
                    setShowRejectModal(true);
                  }}
                  onView={() => setSelectedSubGroup(subGroup)}
                  processing={processing}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedSubGroup && (
        <RejectModal
          subGroup={selectedSubGroup}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          onConfirm={handleReject}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedSubGroup(null);
            setRejectReason('');
          }}
          processing={processing}
        />
      )}
    </div>
  );
}


// Stat Card Component - Instagram Style
function StatCard({
  label,
  value,
  icon,
  bgColor
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="flex-shrink-0 w-[140px] lg:w-auto bg-white rounded-2xl lg:rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 lg:p-2 ${bgColor} rounded-xl lg:rounded-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs lg:text-sm text-slate-500 whitespace-nowrap">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Sub-Group Row Component - Instagram Style
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
    <div className="bg-white hover:bg-slate-50 transition-colors">
      {/* Main Row - Tappable */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-slate-100 lg:active:bg-slate-50"
        onClick={onView}
      >
        {/* Icon with gradient */}
        <div className={`w-12 h-12 lg:w-10 lg:h-10 rounded-xl lg:rounded-lg flex-shrink-0 flex items-center justify-center ${subGroup.status === 'active'
            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
            : subGroup.status === 'pending'
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : subGroup.status === 'approved_pending_payment'
                ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                : 'bg-gradient-to-br from-slate-400 to-slate-500'
          }`}>
          <span className="text-white">{typeIcon}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[15px] text-slate-900 truncate">{subGroup.name}</h3>
            {subGroup.status === 'active' && (
              <span className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px]">✓</span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 truncate">{typeLabel} • {subGroup.coordinatorName || 'Unknown'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <span className="text-[10px] text-slate-400">
              ~{subGroup.estimatedMembers} members
            </span>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          {subGroup.status === 'pending' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(); }}
                disabled={processing}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(); }}
                disabled={processing}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Action Bar - Only for pending */}
      {subGroup.status === 'pending' && (
        <div className="lg:hidden flex items-center justify-end gap-2 px-4 py-2 bg-slate-50/50 border-t border-slate-100">
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            disabled={processing}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            disabled={processing}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-xl hover:bg-red-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
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
