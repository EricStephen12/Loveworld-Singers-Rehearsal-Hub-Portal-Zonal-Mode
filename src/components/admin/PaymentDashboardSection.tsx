"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Search, RefreshCw, Plus, Ban, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CustomLoader from '@/components/CustomLoader';

interface PaymentRecord {
    id: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'refunded' | 'pending';
    subscriptionType: 'individual' | 'zone';
    subscriptionPeriod: {
        start: string;
        end: string;
    };
    metadata?: {
        zoneId?: string;
        zoneName?: string;
        memberCount?: number;
    };
    createdAt: string;
    processedAt?: string;
}

interface Subscription {
    payment: PaymentRecord;
    subscription: any;
}

export default function PaymentDashboardSection() {
    const { user, profile } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Action modals
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [extensionMonths, setExtensionMonths] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);

    // Load subscriptions
    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/subscriptions', {
                headers: {
                    'x-user-email': profile?.email || ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data.subscriptions || []);
            }
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile?.email) {
            loadSubscriptions();
        }
    }, [profile?.email]);

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch =
            sub.payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.payment.metadata?.zoneName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || sub.payment.status === statusFilter;
        const matchesType = typeFilter === 'all' || sub.payment.subscriptionType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    // Calculate stats
    const stats = {
        totalRevenue: subscriptions.reduce((sum, sub) =>
            sub.payment.status === 'success' ? sum + sub.payment.amount : sum, 0
        ) / 100,
        activeSubscriptions: subscriptions.filter(sub =>
            sub.subscription?.status === 'active'
        ).length,
        totalUsers: new Set(subscriptions.map(sub => sub.payment.userId)).size,
        thisMonth: subscriptions.filter(sub => {
            const date = new Date(sub.payment.createdAt);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length
    };

    // Action handlers
    const handleRevoke = async () => {
        if (!selectedSubscription) return;

        setActionLoading(true);
        try {
            const response = await fetch('/api/admin/subscriptions/revoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': profile?.email || ''
                },
                body: JSON.stringify({
                    userId: selectedSubscription.payment.subscriptionType === 'zone'
                        ? selectedSubscription.payment.metadata?.zoneId
                        : selectedSubscription.payment.userId,
                    subscriptionType: selectedSubscription.payment.subscriptionType,
                    reason: actionReason,
                    adminId: user?.uid
                })
            });

            if (response.ok) {
                alert('Subscription revoked successfully');
                setShowRevokeModal(false);
                setActionReason('');
                loadSubscriptions();
            } else {
                alert('Failed to revoke subscription');
            }
        } catch (error) {
            console.error('Error revoking subscription:', error);
            alert('Error revoking subscription');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExtend = async () => {
        if (!selectedSubscription) return;

        setActionLoading(true);
        try {
            const response = await fetch('/api/admin/subscriptions/extend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': profile?.email || ''
                },
                body: JSON.stringify({
                    userId: selectedSubscription.payment.subscriptionType === 'zone'
                        ? selectedSubscription.payment.metadata?.zoneId
                        : selectedSubscription.payment.userId,
                    subscriptionType: selectedSubscription.payment.subscriptionType,
                    months: extensionMonths,
                    reason: actionReason,
                    adminId: user?.uid
                })
            });

            if (response.ok) {
                alert(`Subscription extended by ${extensionMonths} month(s)`);
                setShowExtendModal(false);
                setActionReason('');
                setExtensionMonths(1);
                loadSubscriptions();
            } else {
                alert('Failed to extend subscription');
            }
        } catch (error) {
            console.error('Error extending subscription:', error);
            alert('Error extending subscription');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefund = async () => {
        if (!selectedSubscription) return;

        setActionLoading(true);
        try {
            const response = await fetch('/api/admin/subscriptions/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': profile?.email || ''
                },
                body: JSON.stringify({
                    paymentId: selectedSubscription.payment.id,
                    userId: selectedSubscription.payment.subscriptionType === 'zone'
                        ? selectedSubscription.payment.metadata?.zoneId
                        : selectedSubscription.payment.userId,
                    subscriptionType: selectedSubscription.payment.subscriptionType,
                    reason: actionReason,
                    adminId: user?.uid
                })
            });

            if (response.ok) {
                alert('Refund processed successfully');
                setShowRefundModal(false);
                setActionReason('');
                loadSubscriptions();
            } else {
                alert('Failed to process refund');
            }
        } catch (error) {
            console.error('Error processing refund:', error);
            alert('Error processing refund');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            success: 'bg-green-100 text-green-700',
            active: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            failed: 'bg-red-100 text-red-700',
            cancelled: 'bg-gray-100 text-gray-700',
            refunded: 'bg-orange-100 text-orange-700'
        };

        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status as keyof typeof styles] || styles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <CustomLoader message="Loading payment dashboard..." />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-gradient-to-br lg:from-slate-50 lg:via-white lg:to-purple-50">
            <div className="max-w-7xl mx-auto">
                {/* Desktop Header */}
                <div className="hidden lg:block p-6 mb-2">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage all subscriptions and payments</p>
                        </div>
                        <button
                            onClick={loadSubscriptions}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 pt-2 pb-3 lg:px-6 lg:pt-0">
                    {/* Stats Cards */}
                    <div className="flex lg:grid lg:grid-cols-4 gap-3 lg:gap-6 mb-6 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible scrollbar-hide">
                        <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-green-500 lg:border-t-0 lg:border-r-0 lg:border-b-0">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Revenue</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalRevenue} E</p>
                        </div>

                        <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-blue-500 lg:border-t-0 lg:border-r-0 lg:border-b-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-gray-600 text-xs md:text-sm mb-1">Active Subscriptions</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                        </div>

                        <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-purple-500 lg:border-t-0 lg:border-r-0 lg:border-b-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-gray-600 text-xs md:text-sm mb-1">Total Users</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>

                        <div className="flex-shrink-0 w-[160px] lg:w-auto bg-white rounded-2xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-l-4 lg:border-l-orange-500 lg:border-t-0 lg:border-r-0 lg:border-b-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-gray-600 text-xs md:text-sm mb-1">This Month</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl lg:rounded-xl shadow-sm lg:shadow-lg p-4 lg:p-6 border border-gray-100 lg:border-0 mb-4 lg:mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or zone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">All Statuses</option>
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="individual">Individual</option>
                                <option value="zone">Zone</option>
                            </select>
                        </div>
                    </div>

                    {/* Subscriptions Table */}
                    <div className="bg-white rounded-2xl lg:rounded-xl shadow-sm lg:shadow-lg border border-gray-100 lg:border-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expires</th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSubscriptions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No subscriptions found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubscriptions.map((sub) => (
                                            <tr key={sub.payment.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{sub.payment.userName || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">{sub.payment.userEmail}</p>
                                                        {sub.payment.metadata?.zoneName && (
                                                            <p className="text-xs text-purple-600 mt-1">{sub.payment.metadata.zoneName}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className="capitalize text-sm text-gray-700">{sub.payment.subscriptionType}</span>
                                                    {sub.payment.metadata?.memberCount && (
                                                        <p className="text-xs text-gray-500">{sub.payment.metadata.memberCount} members</p>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {sub.payment.amount / 100} E
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    {getStatusBadge(sub.subscription?.status || sub.payment.status)}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                                                    {sub.payment.subscriptionPeriod?.end ? formatDate(sub.payment.subscriptionPeriod.end) : 'N/A'}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSubscription(sub);
                                                                setShowExtendModal(true);
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Extend subscription"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSubscription(sub);
                                                                setShowRevokeModal(true);
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Revoke subscription"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSubscription(sub);
                                                                setShowRefundModal(true);
                                                            }}
                                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Process refund"
                                                        >
                                                            <DollarSign className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals - Match app styling */}
            {showRevokeModal && selectedSubscription && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Revoke Subscription</h3>
                            <button onClick={() => setShowRevokeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to revoke the subscription for <strong>{selectedSubscription.payment.userName}</strong>?
                        </p>
                        <textarea
                            placeholder="Reason for revoking (optional)"
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRevokeModal(false);
                                    setActionReason('');
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRevoke}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Revoking...' : 'Revoke'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showExtendModal && selectedSubscription && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Extend Subscription</h3>
                            <button onClick={() => setShowExtendModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Extend subscription for <strong>{selectedSubscription.payment.userName}</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Extension Period (months)</label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={extensionMonths}
                                onChange={(e) => setExtensionMonths(parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <textarea
                            placeholder="Reason for extension (optional)"
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowExtendModal(false);
                                    setActionReason('');
                                    setExtensionMonths(1);
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExtend}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Extending...' : 'Extend'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRefundModal && selectedSubscription && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Process Refund</h3>
                            <button onClick={() => setShowRefundModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Process refund for <strong>{selectedSubscription.payment.userName}</strong>
                            <br />
                            <span className="text-yellow-600 font-semibold">Amount: {selectedSubscription.payment.amount / 100} ESPEES</span>
                        </p>
                        <textarea
                            placeholder="Reason for refund (required)"
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRefundModal(false);
                                    setActionReason('');
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRefund}
                                className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                                disabled={actionLoading || !actionReason.trim()}
                            >
                                {actionLoading ? 'Processing...' : 'Process Refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
