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
  ArrowDownUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubGroup } from '@/hooks/useSubGroup';

// Sub-group admin sections
import SubGroupDashboard from '@/components/subgroup-admin/SubGroupDashboard';
import SubGroupPagesSection from '@/components/subgroup-admin/SubGroupPagesSection';
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
    { icon: BarChart3, label: 'Overview', active: activeSection === 'Overview' || activeSection === 'Dashboard' },
    { icon: Music, label: 'Songs', active: activeSection === 'Songs' || activeSection === 'Pages' },
    { icon: Users, label: 'Members', active: activeSection === 'Members' },
    { icon: Bell, label: 'Notifications', active: activeSection === 'Notifications' },
  ];

  return (
    <div className="h-[100dvh] bg-slate-50/30 flex overflow-hidden">
      {/* Sidebar - Clean Solid Mobile / Light Frosted Desktop */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-[100]
        w-80 bg-white lg:bg-white/80 lg:backdrop-blur-2xl border-r border-slate-200/50
        transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${sidebarOpen ? 'translate-x-0 shadow-[40px_0_100px_rgba(0,0,0,0.1)]' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full
      `}>
        {/* Header */}
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-4 hover:opacity-80 transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100">
                <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">Admin</h1>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Portal</p>
              </div>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sub-Group Selector */}
        {coordinatedSubGroups.length > 1 && (
          <div className="px-8 py-6 border-b border-slate-50">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Group</p>
            <div className="relative">
              <select
                value={selectedSubGroup || ''}
                onChange={(e) => setSelectedSubGroup(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:border-purple-600 transition-all cursor-pointer"
              >
                {coordinatedSubGroups.map(sg => (
                  <option key={sg.id} value={sg.id}>{sg.name}</option>
                ))}
              </select>
              <ArrowDownUp className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto space-y-8">
          <div className="space-y-2">
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
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                    ${item.active
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10'
                      : 'text-slate-400 hover:text-slate-900 border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`text-sm font-black uppercase tracking-widest`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-50">
          <button
            onClick={() => router.push('/home')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest border border-slate-100 rounded-xl"
          >
            <Home className="w-4 h-4" />
            Exit
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-50/50 relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[40]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{activeSection === 'Overview' || activeSection === 'Dashboard' ? 'Overview' : activeSection}</h1>
          </div>
        </header>

        {/* Content Area - Natural Scroll Flow */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scroll-smooth scrollbar-hide">
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col p-6 lg:p-10">
            {(activeSection === 'Overview' || activeSection === 'Dashboard') && currentSubGroup && (
              <SubGroupDashboard 
                subGroup={currentSubGroup} 
                onNavigate={(section) => {
                  if (section === 'Pages') setActiveSection('Songs');
                  else setActiveSection(section);
                }}
              />
            )}
            {(activeSection === 'Songs' || activeSection === 'Pages') && currentSubGroup && (
              <SubGroupPagesSection 
                subGroupId={currentSubGroup.id} 
                zoneId={currentSubGroup.zoneId} 
                subGroupName={currentSubGroup.name}
              />
            )}
            {activeSection === 'Members' && currentSubGroup && (
              <SubGroupMembers subGroupId={currentSubGroup.id} zoneId={currentSubGroup.zoneId} />
            )}
            {activeSection === 'Notifications' && currentSubGroup && (
              <SubGroupNotifications subGroupId={currentSubGroup.id} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
