"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Tag,
  Users,
  Music,
  ChevronRight,
  Bell,
  BarChart3,
  MessageCircle,
  FolderOpen,
  Upload,
  X,
  Library,
  UsersRound,
  Home,
  ChevronLeft,
  Calendar,
  Activity,
  DollarSign,
} from "lucide-react";
import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';

interface AdminSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  isHQAdmin?: boolean;
  isRestrictedAdmin?: boolean;
  pendingSubGroupCount?: number;
}

const AdminSidebar = React.memo(({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeSection,
  setActiveSection,
  isHQAdmin = false,
  isRestrictedAdmin = false,
  pendingSubGroupCount = 0
}: AdminSidebarProps) => {
  const router = useRouter();
  const { currentZone } = useZone();

  const isHQ = currentZone ? isHQGroup(currentZone.id) : false;

  const isZoneCoordinator = currentZone && !isHQ && !isHQAdmin;

  // Group sidebar items by category
  const mainItems = [
    { icon: Home, label: 'Dashboard', active: activeSection === 'Dashboard' },
    { icon: MessageCircle, label: 'Support Chat', active: activeSection === 'Support Chat', hqOnly: true, restrictedAdminHidden: true },
    { icon: BarChart3, label: 'Analytics', active: activeSection === 'Analytics', hqZoneOnly: true },
  ];

  const contentItems = [
    { icon: FileText, label: 'Pages', active: activeSection === 'Pages' },
    { icon: Tag, label: 'Categories', active: activeSection === 'Categories' },
    { icon: FolderOpen, label: 'Page Categories', active: activeSection === 'Page Categories' },
    { icon: Upload, label: 'Submitted Songs', active: activeSection === 'Submitted Songs' },
    { icon: Library, label: 'Master Library', active: activeSection === 'Master Library', hqZoneOnly: true },
  ];

  const managementItems = [
    { icon: Users, label: 'Members', active: activeSection === 'Members' },
    { icon: UsersRound, label: 'Sub-Groups', active: activeSection === 'Sub-Groups', zoneOnly: true, badge: pendingSubGroupCount },
    { icon: Music, label: 'Media', active: activeSection === 'Media' },
    { icon: Upload, label: 'Video Manager', active: activeSection === 'Video Manager', hqZoneOnly: true },
    { icon: Calendar, label: 'Calendar', active: activeSection === 'Calendar', hqZoneOnly: true },
    { icon: Bell, label: 'Notifications', active: activeSection === 'Notifications' },
    { icon: DollarSign, label: 'Payments', active: activeSection === 'Payments', hqOnly: true },
    { icon: Activity, label: 'Activity Logs', active: activeSection === 'Activity Logs', hqZoneOnly: true },
  ];

  // Filter items based on role
  const filterItems = (items: any[]) => items.filter(item => {
    // If restricted, only show Pages
    if (isRestrictedAdmin) {
      return item.label === 'Pages' || !item.restrictedAdminHidden;
    }

    if (item.hqOnly && !isHQAdmin) return false;
    if (item.hqZoneOnly && !isHQ) return false; // Hide for non-HQ zones
    if (item.zoneOnly && !isZoneCoordinator) return false;
    return true;
  });

  const filteredMainItems = filterItems(mainItems);
  const filteredContentItems = filterItems(contentItems);
  const filteredManagementItems = filterItems(managementItems);

  const renderNavItem = (item: any, index: number) => {
    const Icon = item.icon;
    return (
      <button
        key={index}
        onClick={() => {
          setActiveSection(item.label);
          // On mobile, close sidebar after selection
          if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
          }
        }}
        className={`
          relative w-full flex items-center gap-3 px-4 py-3 lg:px-3 lg:py-2.5 rounded-xl lg:rounded-lg transition-all duration-200 active:scale-[0.98]
          ${item.active
            ? 'bg-purple-600 text-white lg:bg-gradient-to-r lg:from-purple-600 lg:to-purple-500 lg:text-white lg:shadow-md lg:shadow-purple-200'
            : 'text-slate-600 hover:bg-slate-100 lg:hover:bg-slate-50 active:bg-slate-100'
          }
          ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
        `}
        title={sidebarCollapsed ? item.label : undefined}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${item.active ? 'text-white' : ''}`} />
        <span className={`font-medium text-sm ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
          {item.label}
        </span>
        {item.badge && item.badge > 0 && !sidebarCollapsed && (
          <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
            {item.badge}
          </span>
        )}
        {item.badge && item.badge > 0 && sidebarCollapsed && (
          <span className="hidden lg:flex absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold bg-yellow-400 text-yellow-900 rounded-full items-center justify-center">
            {item.badge}
          </span>
        )}
        {item.active && !item.badge && !sidebarCollapsed && (
          <ChevronRight className={`w-4 h-4 ml-auto ${item.active ? 'text-white/70' : 'text-slate-400'}`} />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[65]"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 right-0 lg:left-0 lg:right-auto z-[70] lg:z-auto
        w-[85%] max-w-[320px] bg-white border-l lg:border-l-0 lg:border-r border-slate-200
        transform transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'translate-x-full lg:translate-x-0 lg:w-[72px]' : 'translate-x-0 lg:w-64'}
        flex flex-col safe-area-bottom
      `}>
        {/* Header */}
        <div className={`p-4 border-b border-slate-100 ${sidebarCollapsed ? 'lg:px-3' : 'lg:p-5'}`}>
          <div className="flex items-center justify-between">
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="lg:hidden p-2 -ml-1 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>

            {/* Logo & Title */}
            <Link
              href="/home"
              className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className={`${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <h1 className="text-base font-bold text-slate-900">Admin Panel</h1>
                <p className="text-xs text-slate-500 truncate max-w-[140px]">{currentZone?.name || 'Loveworld Singers'}</p>
              </div>
            </Link>

            <div className="w-10 lg:hidden" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-3 overflow-y-auto">
          {/* Main Section */}
          <div className="space-y-1 mb-4">
            {!sidebarCollapsed && (
              <p className="hidden lg:block px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Overview
              </p>
            )}
            {filteredMainItems.map(renderNavItem)}
          </div>

          {/* Content Section */}
          <div className="space-y-1 mb-4">
            {!sidebarCollapsed && (
              <p className="hidden lg:block px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Content
              </p>
            )}
            {sidebarCollapsed && <div className="hidden lg:block h-px bg-slate-200 my-3" />}
            {filteredContentItems.map(renderNavItem)}
          </div>

          {/* Management Section */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="hidden lg:block px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Management
              </p>
            )}
            {sidebarCollapsed && <div className="hidden lg:block h-px bg-slate-200 my-3" />}
            {filteredManagementItems.map(renderNavItem)}
          </div>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-slate-100 ${sidebarCollapsed ? 'lg:p-2' : ''}`}>
          {/* Mobile: Back to Home */}
          <Link
            href="/home"
            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-200 active:scale-[0.98] transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Desktop: Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden lg:flex w-full items-center gap-2 px-3 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </div>
    </>
  );
});

export default AdminSidebar;
