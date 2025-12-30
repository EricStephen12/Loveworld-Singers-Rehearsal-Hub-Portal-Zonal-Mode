"use client";

import React from 'react';
import {
  Home,
  FileText,
  Users,
  Bell,
  Menu
} from "lucide-react";

interface AdminMobileNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onMenuOpen: () => void;
}

export default function AdminMobileNav({
  activeSection,
  setActiveSection,
  onMenuOpen
}: AdminMobileNavProps) {
  const navItems = [
    { icon: Home, label: 'Home', section: 'Dashboard' },
    { icon: FileText, label: 'Pages', section: 'Pages' },
    { icon: Users, label: 'Members', section: 'Members' },
    { icon: Bell, label: 'Activity', section: 'Notifications' },
    { icon: Menu, label: 'Menu', section: 'menu' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.section === 'menu' 
            ? false 
            : activeSection === item.section;
          
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
                className={`w-6 h-6 ${isActive ? 'text-black' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-black font-semibold' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
