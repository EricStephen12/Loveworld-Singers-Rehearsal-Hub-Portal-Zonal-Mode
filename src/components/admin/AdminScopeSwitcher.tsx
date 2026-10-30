'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Building2, 
  ChevronDown, 
  Check, 
  Users, 
  ShieldCheck, 
  Layers, 
  ArrowRightLeft,
  Sparkles,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { BackendAPI } from '@/lib/api-client';
import CustomLoader from '@/components/CustomLoader';

interface LinkedAccount {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  hasHqAccess?: boolean;
  avatarUrl?: string;
  phone?: string;
  zoneCode?: string;
  church?: string;
  isCurrent?: boolean;
}

interface ChurchItem {
  id: string;
  name: string;
  code?: string;
  status?: string;
  memberCount?: number;
  coordinatorName?: string;
  role?: string;
}

interface AdminScopeSwitcherProps {
  currentChurchId?: string | null;
  onSelectChurch?: (churchId: string) => void;
  compact?: boolean;
  className?: string;
}

export default function AdminScopeSwitcher({
  currentChurchId,
  onSelectChurch,
  compact = false,
  className = ''
}: AdminScopeSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, profile, switchAccount } = useAuth();
  const { currentZone, userRole } = useZone();

  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingTarget, setSwitchingTarget] = useState<string>('');

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [churches, setChurches] = useState<ChurchItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeColor = currentZone?.themeColor || '#9333ea';
  const isHQ = Boolean(profile?.has_hq_access || profile?.hasHqAccess || userRole === 'hq_admin');
  const isZoneCoordinator = userRole === 'zone_coordinator' || isHQ || profile?.role === 'zone_admin' || profile?.role === 'zone_coordinator';
  const isSubgroupAdminPath = pathname?.includes('/subgroup-admin');

  // Determine current active church
  const effectiveChurchId = currentChurchId || searchParams?.get('subGroupId') || (() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('lwsrh_current_church');
      return saved ? JSON.parse(saved)?.id : null;
    } catch {
      return null;
    }
  })();

  const activeChurch = churches.find(c => c.id === effectiveChurchId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Load linked accounts and churches when opened
  useEffect(() => {
    let isMounted = true;

    async function loadScopeData() {
      if (!isOpen && churches.length > 0 && linkedAccounts.length > 0) return;
      setLoadingData(true);

      try {
        // 1. Fetch linked accounts
        const accountsPromise = BackendAPI.auth.linkedAccounts().catch(() => null);

        // 2. Fetch churches: if zone admin, fetch zone subgroups; else fetch coordinated/mine
        const churchesPromise = isZoneCoordinator && currentZone?.id
          ? BackendAPI.subgroups.getAll({ zoneId: currentZone.id }).catch(() => null)
          : Promise.all([
              BackendAPI.subgroups.coordinated().catch(() => null),
              BackendAPI.subgroups.mine().catch(() => null)
            ]);

        const [accountsRes, churchesRes]: any = await Promise.all([accountsPromise, churchesPromise]);

        if (!isMounted) return;

        // Process linked accounts
        const rawAccounts: LinkedAccount[] = accountsRes?.data || accountsRes || [];
        if (Array.isArray(rawAccounts)) {
          setLinkedAccounts(rawAccounts);
        }

        // Process churches
        let list: ChurchItem[] = [];
        if (Array.isArray(churchesRes)) {
          // Promise.all result
          const [coord, mine] = churchesRes;
          const coordList = Array.isArray(coord?.data) ? coord.data : Array.isArray(coord) ? coord : [];
          const mineList = Array.isArray(mine?.data) ? mine.data : Array.isArray(mine) ? mine : [];
          const combinedMap = new Map<string, ChurchItem>();
          [...coordList, ...mineList].forEach((c: any) => {
            if (c?.id) {
              combinedMap.set(c.id, {
                id: c.id,
                name: c.name || 'Church Choir',
                code: c.code,
                status: c.status,
                memberCount: c.memberCount || c.estimatedMembers || 0,
                coordinatorName: c.coordinatorName,
                role: c.role || 'Church Coordinator'
              });
            }
          });
          list = Array.from(combinedMap.values());
        } else {
          // Single getAll result
          const rawList = Array.isArray(churchesRes?.data) ? churchesRes.data : Array.isArray(churchesRes) ? churchesRes : [];
          list = rawList.map((c: any) => ({
            id: c.id,
            name: c.name || 'Church Choir',
            code: c.code,
            status: c.status,
            memberCount: c.memberCount || c.estimatedMembers || 0,
            coordinatorName: c.coordinatorName,
          }));
        }

        setChurches(list);
      } catch (e) {
        console.warn('[AdminScopeSwitcher] Error loading scope data:', e);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    if (isOpen) {
      loadScopeData();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, isZoneCoordinator, currentZone?.id]);

  // Handle switching to Full Zone Admin
  const handleSwitchToZone = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lwsrh_current_church');
    }
    if (onSelectChurch) {
      onSelectChurch('');
    }
    if (isSubgroupAdminPath) {
      router.push('/admin');
    }
  };

  // Handle switching to a specific Church
  const handleSwitchToChurch = (church: ChurchItem) => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lwsrh_current_church', JSON.stringify({ id: church.id, name: church.name }));
    }
    if (onSelectChurch) {
      onSelectChurch(church.id);
    }
    if (!isSubgroupAdminPath || effectiveChurchId !== church.id) {
      router.push(`/subgroup-admin?subGroupId=${church.id}`);
    }
  };

  // Handle switching to another linked user account
  const handleSwitchAccount = async (targetAccount: LinkedAccount) => {
    if (targetAccount.isCurrent || targetAccount.id === user?.uid) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    setIsSwitching(true);
    setSwitchingTarget(`${targetAccount.firstName || ''} ${targetAccount.lastName || ''}`.trim() || targetAccount.email || 'account');

    try {
      const res = await switchAccount(targetAccount.id);
      if (res.success) {
        // If switched account is a church coordinator, direct to subgroup-admin
        const newRole = (targetAccount.role || '').toLowerCase();
        const isChurchRole = newRole.includes('church') || newRole.includes('subgroup');

        if (typeof window !== 'undefined') {
          // Clear caches so clean state is loaded
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('members') || key.includes('rehearsal') || key.includes('subgroup'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        }

        setTimeout(() => {
          if (isChurchRole) {
            window.location.href = '/subgroup-admin';
          } else {
            window.location.href = '/admin';
          }
        }, 500);
      } else {
        alert(res.error || 'Failed to switch account');
        setIsSwitching(false);
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to switch account');
      setIsSwitching(false);
    }
  };

  // Role badge helper
  const getRoleBadge = (role?: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'president') return 'The President';
    if (r === 'director') return 'The Director';
    if (r === 'oftp') return 'Office of the President';
    if (r === 'hq_admin' || r === 'super_admin' || r === 'boss') return 'HQ Admin';
    if (r === 'zone_admin' || r === 'zone_coordinator' || r === 'coordinator') return 'Zonal Admin';
    if (r === 'church_coordinator' || r === 'church_admin') return 'Church Admin';
    if (r === 'subgroup_coordinator' || r === 'subgroup_admin') return 'Group Admin';
    return 'Choir Member';
  };

  const isViewingChurch = isSubgroupAdminPath || Boolean(effectiveChurchId && activeChurch);

  return (
    <>
      {/* Switching overlay */}
      {isSwitching && (
        <div className="fixed inset-0 z-[99999] bg-white/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-3">
            <CustomLoader size="lg" />
            <p className="text-slate-800 font-bold text-sm tracking-wide animate-pulse">
              Switching to {switchingTarget}...
            </p>
          </div>
        </div>
      )}

      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all border text-left
            ${isViewingChurch 
              ? 'bg-purple-50/80 border-purple-200/80 hover:bg-purple-100/70 text-purple-900 shadow-sm' 
              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-900 shadow-sm'
            }
            ${compact ? 'text-xs' : 'text-sm'}
          `}
          style={isViewingChurch ? { borderColor: `${themeColor}40` } : {}}
        >
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ 
              backgroundColor: isViewingChurch ? themeColor : '#3b82f6',
              color: '#ffffff'
            }}
          >
            {isViewingChurch ? (
              <Building2 className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isViewingChurch ? 'Church Admin' : 'Zone Admin'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-semibold text-purple-600 truncate">
                Switch
              </span>
            </div>
            <p className="font-bold truncate text-slate-900 text-xs">
              {isViewingChurch 
                ? (activeChurch?.name || 'Selected Church') 
                : (currentZone?.name || 'Zonal Portal')
              }
            </p>
          </div>

          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-[320px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-slate-50 to-purple-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Switch Admin Scope
                </span>
              </div>
              {loadingData && (
                <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2 space-y-3 custom-scrollbar">
              {/* Section 1: Main Zone Admin */}
              <div>
                <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Zonal Authority
                </p>
                <button
                  type="button"
                  onClick={handleSwitchToZone}
                  className={`
                    w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group
                    ${!isViewingChurch 
                      ? 'bg-blue-50/80 text-blue-950 font-bold border border-blue-200/60' 
                      : 'hover:bg-slate-50 text-slate-800'
                    }
                  `}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentZone?.name || 'Zone Admin Portal'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Manage all zone singers & schedules
                    </p>
                  </div>
                  {!isViewingChurch && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 stroke-[3px]" />
                  )}
                </button>
              </div>

              {/* Section 2: Church Subgroups */}
              <div>
                <div className="flex items-center justify-between px-2.5 py-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Churches & Subgroups
                  </p>
                  <span className="text-[10px] font-bold text-purple-600">
                    {churches.length} Available
                  </span>
                </div>

                {churches.length === 0 ? (
                  <div className="p-3 text-center text-slate-400 text-xs">
                    {loadingData ? 'Loading churches...' : 'No churches found in this zone.'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {churches.map((church) => {
                      const isActive = isViewingChurch && effectiveChurchId === church.id;
                      return (
                        <button
                          key={church.id}
                          type="button"
                          onClick={() => handleSwitchToChurch(church)}
                          className={`
                            w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left
                            ${isActive 
                              ? 'bg-purple-50 text-purple-950 font-bold border border-purple-200/60' 
                              : 'hover:bg-slate-50 text-slate-800'
                            }
                          `}
                        >
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm"
                            style={{ backgroundColor: themeColor }}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {church.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {church.coordinatorName ? `Coord: ${church.coordinatorName}` : `${church.memberCount || 0} Singers`}
                            </p>
                          </div>
                          {isActive && (
                            <Check className="w-4 h-4 text-purple-600 flex-shrink-0 stroke-[3px]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 3: Linked Accounts (KingsChat multi-profiles) */}
              {linkedAccounts.length > 1 && (
                <div className="border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Switch Linked Account
                    </p>
                  </div>

                  <div className="space-y-1">
                    {linkedAccounts.map((acc) => {
                      const isCurrent = acc.isCurrent || acc.id === user?.uid;
                      const fullName = `${acc.firstName || ''} ${acc.lastName || ''}`.trim() || acc.email || 'Singer';
                      const badge = getRoleBadge(acc.role);

                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleSwitchAccount(acc)}
                          disabled={isCurrent}
                          className={`
                            w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left
                            ${isCurrent 
                              ? 'bg-amber-50/70 border border-amber-200/50 cursor-default' 
                              : 'hover:bg-slate-50 cursor-pointer active:scale-[0.98]'
                            }
                          `}
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                            {acc.firstName?.charAt(0) || acc.email?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {fullName}
                              </p>
                              <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-700 font-bold rounded-md">
                                {badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {acc.church || acc.email || acc.phone || 'HQ Member'}
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="text-[9px] font-extrabold text-amber-700 uppercase bg-amber-200/60 px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
