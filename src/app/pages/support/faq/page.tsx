'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/ScreenHeader';
import SharedDrawer from '@/components/SharedDrawer';
import { getMenuItems } from '@/config/menuItems';
import { useAuth } from '@/hooks/useAuth';
import {
  ChevronRight,
  Search,
  BookOpen,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Pre-made FAQ data
const faqData: FAQ[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click "Forgot Password". Enter your email address and check your inbox for reset instructions.',
    category: 'account'
  },
  {
    id: '2',
    question: 'Why can\'t I access the media player?',
    answer: 'Make sure you have a stable internet connection and try refreshing the page. If the issue persists, clear your browser cache.',
    category: 'technical'
  },
  {
    id: '3',
    question: 'How do I update my profile information?',
    answer: 'Go to your Profile page and tap the edit button next to any field you want to change. Don\'t forget to save your changes.',
    category: 'account'
  },
  {
    id: '4',
    question: 'The app is running slowly, what should I do?',
    answer: 'Try closing other apps on your device and restart the LoveWorld Singers app. Make sure you have a good internet connection.',
    category: 'technical'
  },
  {
    id: '5',
    question: 'How do I join a rehearsal group?',
    answer: 'Go to the Groups section and browse available groups. Tap "Join Group" on any group you\'re interested in.',
    category: 'general'
  },
  {
    id: '6',
    question: 'Can I download songs for offline use?',
    answer: 'Currently, songs are only available for streaming. Offline downloads will be available in a future update.',
    category: 'feature'
  },
  {
    id: '7',
    question: 'How do I change my profile picture?',
    answer: 'Go to your Profile page, tap the edit button, then tap on your profile picture to upload a new one.',
    category: 'account'
  },
  {
    id: '8',
    question: 'Why can\'t I hear audio in the app?',
    answer: 'Check your device volume, ensure your browser allows audio playback, and make sure you have a stable internet connection.',
    category: 'technical'
  },
  {
    id: '9',
    question: 'How do I contact other choir members?',
    answer: 'Use the Groups feature to connect with other members in your choir group.',
    category: 'general'
  },
  {
    id: '10',
    question: 'What devices are supported?',
    answer: 'The app works on smartphones, tablets, and desktop computers with modern web browsers.',
    category: 'technical'
  }
];

export default function FAQPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = getMenuItems(handleLogout);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/pages/support')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">FAQ & Help Center</h1>
          </div>
          <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide content-bottom-safe pt-16" style={{
        height: '100vh',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-6 pb-24">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600">
              Find quick answers to common questions about the LoveWorld Singers app.
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl ring-1 ring-black/5 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          {!searchQuery && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/90 transition-all duration-300 active:scale-[0.97] ring-1 ring-black/5 shadow-sm">
                  <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-800">Account</span>
                </button>
                <button className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/90 transition-all duration-300 active:scale-[0.97] ring-1 ring-black/5 shadow-sm">
                  <HelpCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-800">Technical</span>
                </button>
              </div>
            </div>
          )}

          {/* FAQ List */}
          <div>
            {filteredFAQs.length > 0 ? (
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 active:scale-[0.97] group ring-1 ring-black/5">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full text-left flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight">
                          {faq.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${faq.category === 'account' ? 'bg-blue-100 text-blue-700' :
                              faq.category === 'technical' ? 'bg-orange-100 text-orange-700' :
                                faq.category === 'general' ? 'bg-green-100 text-green-700' :
                                  'bg-purple-100 text-purple-700'
                            }`}>
                            {faq.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ml-3 ${expandedFAQ === faq.id ? 'rotate-90' : ''
                          }`}
                      />
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-2">No results found</p>
                <p className="text-gray-400 text-sm">Try searching with different keywords</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SharedDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Menu" items={menuItems} />
    </div>
  );
}