"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Calendar, 
  Music, 
  Users, 
  Bell, 
  Menu, 
  X,
  ChevronRight,
  Home,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubGroup } from '@/hooks/useSubGroup';

// Sub-group admin sections
import SubGroupDashboard from '@/components/subgroup-admin/SubGroupDashboard';
import SubGroupRehearsals from '@/components/subgroup-admin/SubGroupRehearsals';
import SubGroupSongs from '@/components/subgroup-admin/SubGroupSongs';
import SubGroupMembers from '@/components/subgroup-admin/SubGroupMembers';
import SubGroupNotifications from '@/components/subgroup-admin/SubGroupNotifications';

export default function SubGroupAdminPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { isSubGroupCoordinator, coordinatedSubGroups, isLoading } = useSubGroup();
  
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSubGroup, setSelectedSubGroup] = useState<string | null>(null);

  // Set default sub-group when loaded
  useEffect(() => {
    if (coordinatedSubGroups.length > 0 && !selectedSubGroup) {
      setSelectedSubGroup(coordinatedSubGroups[0].id);
    }
  }, [coordinatedSubGroups, selectedSubGroup]);

  // Redirect if not a sub-group coordinator
  useEffect(() => {
    if (!isLoading && !isSubGroupCoordinator) {
      router.push('/home');
    }
  }, [isLoading, isSubGroupCoordinator, router]);

  // Don't render until we know if user is authorized
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isSubGroupCoordinator) {
    return null;
  }

  const currentSubGroup = coordinatedSubGroups.find(sg => sg.id === selectedSubGroup);

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', active: activeSection === 'Dashboard' },
    { icon: Calendar, label: 'Rehearsals', active: activeSection === 'Rehearsals' },
    { icon: Music, label: 'Songs', active: activeSection === 'Songs' },
    { icon: Users, label: 'Members', active: activeSection === 'Members' },
    { icon: Bell, label: 'Notifications', active: activeSection === 'Notifications' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-sm font-bold text-slate-900">Sub-Group Admin</h1>
                <p className="text-xs text-slate-500 truncate max-w-[140px]">
                  {currentSubGroup?.name || 'Select Group'}
                </p>
              </div>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Sub-Group Selector (if multiple) */}
        {coordinatedSubGroups.length > 1 && (
          <div className="p-4 border-b border-slate-200">
            <label className="block text-xs font-medium text-slate-500 mb-2">
              Select Sub-Group
            </label>
            <select
              value={selectedSubGroup || ''}
              onChange={(e) => setSelectedSubGroup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {coordinatedSubGroups.map(sg => (
                <option key={sg.id} value={sg.id}>{sg.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    setActiveSection(item.label);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${item.active
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.active && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => router.push('/home')}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm">Back to Home</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">{activeSection}</h1>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'Dashboard' && currentSubGroup && (
            <SubGroupDashboard subGroup={currentSubGroup} />
          )}
          {activeSection === 'Rehearsals' && currentSubGroup && (
            <SubGroupRehearsals subGroupId={currentSubGroup.id} zoneId={currentSubGroup.zoneId} />
          )}
          {activeSection === 'Songs' && currentSubGroup && (
            <SubGroupSongs subGroupId={currentSubGroup.id} zoneId={currentSubGroup.zoneId} />
          )}
          {activeSection === 'Members' && currentSubGroup && (
            <SubGroupMembers subGroupId={currentSubGroup.id} zoneId={currentSubGroup.zoneId} />
          )}
          {activeSection === 'Notifications' && currentSubGroup && (
            <SubGroupNotifications subGroupId={currentSubGroup.id} />
          )}
        </div>
      </main>
    </div>
  );
}
