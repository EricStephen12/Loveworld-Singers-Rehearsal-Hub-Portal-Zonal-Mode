"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  LayoutDashboard,
  Mic,
  ChevronLeft,
  ChevronDown,
  Layout
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubGroup, useZoneSubGroups } from '@/hooks/useSubGroup';
import { useZone } from '@/hooks/useZone';

// Sub-group admin sections
import SubGroupDashboard from '@/components/subgroup-admin/SubGroupDashboard';
import SubGroupPagesSection from '@/components/subgroup-admin/SubGroupPagesSection';
import SubGroupMembers from '@/components/subgroup-admin/SubGroupMembers';
import SubGroupNotifications from '@/components/subgroup-admin/SubGroupNotifications';
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider';
import AdminScopeSwitcher from '@/components/admin/AdminScopeSwitcher';

export default function SubGroupAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const { currentZone, userRole } = useZone();
  const { isSubGroupCoordinator, coordinatedSubGroups, isLoading } = useSubGroup();
  const { subGroups: zoneSubGroups, isLoading: zoneSubGroupsLoading } = useZoneSubGroups();
  
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSubGroup, setSelectedSubGroup] = useState<string | null>(null);

  const themeColor = currentZone?.themeColor || '#9333ea';

  const userRoleLower = (profile?.role || '').toLowerCase();
  const isChurchAdmin = userRoleLower === 'church_coordinator' || userRoleLower === 'church_admin' || userRoleLower === 'subgroup_coordinator' || userRoleLower === 'subgroup_admin';
  const isZoneAdmin = userRole === 'zone_coordinator' || userRole === 'hq_admin' || userRole === 'boss' || userRoleLower === 'zone_admin' || userRoleLower === 'zone_coordinator' || userRoleLower === 'coordinator' || Boolean(profile?.has_hq_access || profile?.hasHqAccess);
  const canAccess = isSubGroupCoordinator || isChurchAdmin || isZoneAdmin;

  // Combine coordinated subgroups and zone-wide subgroups (for zone admins)
  const availableSubGroups = useMemo(() => {
    const map = new Map<string, any>();
    coordinatedSubGroups.forEach(sg => map.set(sg.id, sg));
    if (isZoneAdmin) {
      zoneSubGroups.forEach(sg => map.set(sg.id, sg));
    }
    return Array.from(map.values());
  }, [coordinatedSubGroups, zoneSubGroups, isZoneAdmin]);

  // Set default sub-group when loaded, checking URL query param first
  const urlSubGroupId = searchParams?.get('subGroupId');
  useEffect(() => {
    if (urlSubGroupId && availableSubGroups.some(sg => sg.id === urlSubGroupId)) {
      setSelectedSubGroup(urlSubGroupId);
    } else if (availableSubGroups.length > 0 && (!selectedSubGroup || !availableSubGroups.some(sg => sg.id === selectedSubGroup))) {
      setSelectedSubGroup(availableSubGroups[0].id);
    }
  }, [availableSubGroups, selectedSubGroup, urlSubGroupId]);

  // Sync selected church into localStorage for API headers
  useEffect(() => {
    if (selectedSubGroup) {
      const matched = availableSubGroups.find(sg => sg.id === selectedSubGroup);
      if (matched && typeof window !== 'undefined') {
        localStorage.setItem('lwsrh_current_church', JSON.stringify({ id: matched.id, name: matched.name }));
      }
    }
  }, [selectedSubGroup, availableSubGroups]);

  // Redirect if user has no coordinator or admin privileges
  useEffect(() => {
    if (!isLoading && !zoneSubGroupsLoading && !canAccess) {
      router.push('/home');
    }
  }, [isLoading, zoneSubGroupsLoading, canAccess, router]);

  if (isLoading || (isZoneAdmin && zoneSubGroupsLoading && availableSubGroups.length === 0)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Initialising Church Portal</p>
        </div>
      </div>
    );
  }

  if (!user || !canAccess) {
    return null;
  }

  const currentSubGroup = availableSubGroups.find(sg => sg.id === selectedSubGroup) || availableSubGroups[0] || null;

  const navigation = [
    {
      label: 'Main',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', active: activeSection === 'Dashboard' },
      ]
    },
    {
      label: 'Content',
      items: [
        { icon: Music, label: 'Songs', active: activeSection === 'Songs' || activeSection === 'Pages' },
      ]
    },
    {
      label: 'Admin',
      items: [
        { icon: Users, label: 'Members', active: activeSection === 'Members' },
        { icon: Bell, label: 'Notifications', active: activeSection === 'Notifications' },
      ]
    }
  ];

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = item.active;

    return (
      <button
        key={item.label}
        onClick={() => {
          setActiveSection(item.label);
          setSidebarOpen(false);
        }}
        className={`
          w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200
          ${isActive 
            ? 'text-white shadow-md' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:scale-[0.98]'
          }
        `}
        style={isActive ? { backgroundColor: themeColor } : {}}
      >
        <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        <span className="text-sm font-bold tracking-tight">{item.label}</span>
        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto shadow-sm" />}
      </button>
    );
  };

  return (
    <AdminThemeProvider>
      <div className="h-[100dvh] bg-white lg:bg-slate-50/30 flex overflow-hidden font-sans antialiased">
        {/* Sidebar - Neater & More Professional */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-[50]
          w-[280px] bg-white border-r border-slate-200/50
          transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'}
          flex flex-col h-full
        `}>
          {/* Sidebar Header */}
          <div className="p-6 h-[80px] flex items-center">
            <div className="flex items-center gap-3.5">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 rotate-3 group-hover:rotate-0 transition-transform"
                style={{ backgroundColor: themeColor }}
              >
                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              {!sidebarCollapsed && (
                <div className="text-left">
                  <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">Personnel</h1>
                  <p className="text-[10px] text-slate-400 font-bold truncate max-w-[140px] mt-1.5 uppercase tracking-widest">Subgroup Hub</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Scope & Church Switcher */}
          {!sidebarCollapsed && (
            <div className="px-4 mb-4">
              <AdminScopeSwitcher 
                currentChurchId={selectedSubGroup}
                onSelectChurch={(id) => setSelectedSubGroup(id)}
              />
            </div>
          )}

          {/* Navigation - Apple Style */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar space-y-6">
            {navigation.map((group) => (
              <div key={group.label}>
                {!sidebarCollapsed && (
                  <div className="px-3 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{group.label}</span>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map(renderNavItem)}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-slate-100/50">
            <button
              onClick={() => router.push('/home')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-bold text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Home className="w-4.5 h-4.5" />
              {!sidebarCollapsed && <span className="tracking-tight">Exit to Portal</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Overlay - Subtle */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/10 z-[45] lg:hidden animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          {/* Header - NEATER & UNIFIED */}
          <header className="h-[70px] bg-white border-b border-slate-200/50 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-[40] flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
              
              {/* Unified Breadcrumb/Title */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
                 <span className="text-slate-400 hidden sm:inline-flex items-center">
                   Hub <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
                 </span>
                 <span className="text-slate-400 hidden md:inline-flex items-center">
                   {currentSubGroup?.name} <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
                 </span>
                 <span className="text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-none">{activeSection === 'Dashboard' ? 'Overview' : activeSection}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <AdminScopeSwitcher 
                 currentChurchId={selectedSubGroup}
                 onSelectChurch={(id) => setSelectedSubGroup(id)}
                 compact
               />
               <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[12px] font-bold text-slate-900 leading-none">{profile?.first_name} {profile?.last_name}</span>
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Lead</span>
               </div>
               <div 
                 className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-500 text-xs shadow-sm"
               >
                 {profile?.first_name?.charAt(0)}
               </div>
            </div>
          </header>

          {/* Content Body */}
          <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
            <div className="p-4 sm:p-8 lg:p-10 max-w-[1400px] mx-auto min-h-full">
              {(activeSection === 'Dashboard') && currentSubGroup && (
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
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
