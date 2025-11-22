'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScreenHeader from '@/components/ScreenHeader';
import SharedDrawer from '@/components/SharedDrawer';
import { getMenuItems } from '@/config/menuItems';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import {
  MessageCircle,
  Settings,
  ChevronRight,
  Wrench,
  BookOpen
} from 'lucide-react';


// Support options that lead to different areas
const supportOptions = [
  {
    id: 'faq',
    title: 'FAQ & Help Center',
    description: 'Find answers to frequently asked questions',
    icon: BookOpen,
    href: '/pages/support/faq',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'chat',
    title: 'Chat with Admin',
    description: 'Get direct help from our support team',
    icon: MessageCircle,
    href: '/pages/groups',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 'technical',
    title: 'Technical Support',
    description: 'Troubleshoot app issues and bugs',
    icon: Wrench,
    href: '/pages/support/technical',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  }
];


export default function SupportPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <ScreenHeader
        title="Admin Support"
        onMenuClick={() => setIsMenuOpen(true)}
        rightImageSrc="/logo.png"
      />

      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-6">
        {/* Support Options */}
        <div>
          {supportOptions.map((option) => (
            <Link key={option.id} href={option.href}>
              <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 active:scale-[0.97] group ring-1 ring-black/5 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${option.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                      <option.icon className={`w-4 h-4 ${option.iconColor}`} />
          </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 text-sm group-hover:text-black leading-tight">
                        {option.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                        {option.description}
          </p>
        </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </div>
                </div>
            </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Shared Drawer */}
      <SharedDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={(() => {
          const menuItems = getMenuItems()
          return menuItems || []
        })()}
      />

    </div>
  );
}