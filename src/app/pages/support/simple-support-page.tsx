'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Wrench, MessageCircle } from 'lucide-react';

export default function SimpleSupportPage() {
  const router = useRouter();

  const supportOptions = [
    {
      id: 'faq',
      title: 'FAQ & Help Center',
      description: 'Find answers to frequently asked questions',
      icon: BookOpen,
      href: '/pages/support/faq/simple-faq-page'
    },
    {
      id: 'chat',
      title: 'Chat with Admin',
      description: 'Get direct help from our support team',
      icon: MessageCircle,
      href: '/pages/support/chat/simple-chat-page'
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'Troubleshoot app issues and bugs',
      icon: Wrench,
      href: '/pages/support/technical/simple-technical-page'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Support</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Admin Support
          </h1>
          <p className="text-gray-600 text-sm">
            How can we help you today?
          </p>
        </div>

        {/* Support Options */}
        <div className="space-y-4">
          {supportOptions.map((option) => (
            <Link key={option.id} href={option.href}>
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <option.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {option.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-2">Need More Help?</h3>
          <p className="text-sm text-gray-600 mb-3">
            If you can't find what you're looking for, our support team is here to help.
          </p>
          <p className="text-xs text-gray-500">
            Support hours: Monday-Friday, 9AM-5PM EST
          </p>
        </div>
      </div>
    </div>
  );
}