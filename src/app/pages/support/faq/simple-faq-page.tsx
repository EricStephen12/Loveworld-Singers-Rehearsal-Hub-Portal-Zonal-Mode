'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
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
  }
];

export default function SimpleFAQPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.push('/pages/support')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">FAQ</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Search */}
        

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl p-4 shadow-sm">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <h3 className="font-medium text-gray-900 text-sm leading-tight">
                    {faq.question}
                  </h3>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">No results found</p>
              <p className="text-gray-400 text-sm">Try searching with different keywords</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}