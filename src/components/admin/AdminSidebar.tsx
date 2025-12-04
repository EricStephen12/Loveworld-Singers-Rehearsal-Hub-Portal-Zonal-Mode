"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Tag,
  Users,
  Music,
  ChevronRight,
  Bell,
  BarChart3,
  FolderOpen,
  Upload,
  Menu,
  X,
  Library,
  UsersRound,
  Home
} from "lucide-react";
import { useAdminTheme } from './AdminThemeProvider';
import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';

interface AdminSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  isHQAdmin?: boolean;
  pendingSubGroupCount?: number;
}

export default function AdminSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeSection,
  setActiveSection,
  isHQAdmin = false,
  pendingSubGroupCount = 0
}: AdminSidebarProps) {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const { currentZone } = useZone();
  
  // Check if current zone is HQ
  const isHQ = currentZone ? isHQGroup(currentZone.id) : false;
  
  // Check if user is Zone Coordinator (not HQ)
  const isZoneCoordinator = currentZone && !isHQ && !isHQAdmin;
  
  const allSidebarItems = [
    { icon: Home, label: 'Dashboard', active: activeSection === 'Dashboard' },
    { icon: BarChart3, label: 'Analytics', active: activeSection === 'Analytics', hqOnly: true }, // NEW: Analytics for HQ Admin
    { icon: FileText, label: 'Pages', active: activeSection === 'Pages' },
    { icon: Tag, label: 'Categories', active: activeSection === 'Categories' },
    { icon: FolderOpen, label: 'Page Categories', active: activeSection === 'Page Categories' },
    { icon: Upload, label: 'Submitted Songs', active: activeSection === 'Submitted Songs' },
    { icon: Users, label: 'Members', active: activeSection === 'Members' },
    { icon: Music, label: 'Media', active: activeSection === 'Media' },
    { icon: Upload, label: 'Media Upload', active: activeSection === 'Media Upload', hqOnly: true },
    { icon: Library, label: 'Master Library', active: activeSection === 'Master Library' }, // NEW: For both HQ and Zones
    { icon: UsersRound, label: 'Sub-Groups', active: activeSection === 'Sub-Groups', zoneOnly: true, badge: pendingSubGroupCount }, // NEW: For Zone Coordinators
    { icon: Bell, label: 'Notifications', active: activeSection === 'Notifications' },
  ];
  
  // Filter sidebar items based on role
  const sidebarItems = allSidebarItems.filter(item => {
    // HQ-only items
    if (item.hqOnly && !isHQAdmin) return false;
    // Zone-only items (Sub-Groups management)
    if (item.zoneOnly && !isZoneCoordinator) return false;
    return true;
  });

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/home')}
              className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
            >
              <img 
                src="/logo.png" 
                alt="Loveworld Singers" 
                className="w-10 h-10 object-contain"
              />
              <div className={`${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
                <p className="text-sm text-slate-500">Loveworld Singers</p>
              </div>
            </button>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item: any, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    // Set active section based on label
                    setActiveSection(item.label);
                    
                    // Auto-close sidebar on mobile after clicking
                    setSidebarCollapsed(true);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${item.active
                      ? `${theme.bg} ${theme.text} border ${theme.border} shadow-sm`
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                    ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`font-medium ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    {item.label}
                  </span>
                  {/* Badge for pending items */}
                  {item.badge && item.badge > 0 && !sidebarCollapsed && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.active && !item.badge && (
                    <div className={`w-2 h-2 ${theme.primary.replace('bg-', 'bg-').replace('-600', '-500')} rounded-full ml-auto ${sidebarCollapsed ? 'lg:hidden' : ''}`} />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className={`text-center ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            <p className={`text-xs text-slate-500 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              Admin Dashboard v2.0
            </p>
            <p className={`text-xs text-slate-400 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              © 2024 Loveworld Singers
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </>
  );
}
