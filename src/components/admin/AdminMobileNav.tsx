"use client";

import React from 'react';
import {
  Home,
  FileText,
  Users,
  Bell,
  Menu,
  Music,
  Calendar
} from "lucide-react";

interface AdminMobileNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isRestrictedAdmin?: boolean;
  onMenuOpen: () => void;
}

const AdminMobileNav = React.memo(({
  activeSection,
  setActiveSection,
  isRestrictedAdmin = false,
  onMenuOpen
}: AdminMobileNavProps) => {
  // Map sections to their nav item for highlighting
  const getSectionNavItem = (section: string): string => {
    switch (section) {
      case 'Dashboard':
      case 'Analytics':
        return 'Dashboard';
      case 'Pages':
      case 'Categories':
      case 'Page Categories':
      case 'Submitted Songs':
      case 'Master Library':
        return 'Pages';
      case 'Members':
      case 'Sub-Groups':
        return 'Members';
      case 'Notifications':
        return 'Notifications';
      case 'Media':
      case 'Media Upload':
      case 'Calendar':
      case 'Activity Logs':
        return 'More';
      default:
        return 'Dashboard';
    }
  };

  const currentNavItem = getSectionNavItem(activeSection);

  const navItems = [
    { icon: Home, label: 'Home', section: 'Dashboard' },
    { icon: FileText, label: 'Pages', section: 'Pages' },
    { icon: Users, label: 'Members', section: 'Members' },
    { icon: Bell, label: 'Alerts', section: 'Notifications' },
    { icon: Menu, label: 'More', section: 'menu' },
  ].filter(item => {
    if (isRestrictedAdmin) {
      return item.section === 'Pages' || item.section === 'menu';
    }
    return true;
  });

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[50] bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.section === 'menu'
            ? currentNavItem === 'More'
            : currentNavItem === item.section;

          return (
            <button
              key={item.section}
              onClick={() => {
                if (item.section === 'menu') {
                  onMenuOpen();
                } else {
                  setActiveSection(item.section);
                }
              }}
              className="flex flex-col items-center justify-center flex-1 h-full active:opacity-60 transition-opacity"
            >
              <Icon
                className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default AdminMobileNav;
