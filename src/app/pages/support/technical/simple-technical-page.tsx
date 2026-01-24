'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Monitor, Wifi, Volume2 } from 'lucide-react';

export default function SimpleTechnicalPage() {
  const router = useRouter();

  const technicalIssues = [
    {
      id: 'audio',
      title: 'Audio Playback Issues',
      description: 'Songs not playing or audio problems',
      icon: Volume2,
      solutions: [
        'Check your device volume and mute settings',
        'Ensure your browser allows audio playback',
        'Try refreshing the page',
        'Clear browser cache and cookies',
        'Check your internet connection'
      ]
    },
    {
      id: 'performance',
      title: 'App Running Slowly',
      description: 'Performance and loading issues',
      icon: Monitor,
      solutions: [
        'Close other apps running in the background',
        'Restart your device',
        'Check your internet connection speed',
        'Clear browser cache and data',
        'Try using a different browser'
      ]
    },
    {
      id: 'connectivity',
      title: 'Connection Problems',
      description: 'Network and connectivity issues',
      icon: Wifi,
      solutions: [
        'Check your internet connection',
        'Try switching between WiFi and mobile data',
        'Restart your router/modem',
        'Check if other websites load properly',
        'Contact your internet service provider'
      ]
    },
    {
      id: 'device',
      title: 'Device Compatibility',
      description: 'Issues with specific devices',
      icon: Smartphone,
      solutions: [
        'Ensure your device meets minimum requirements',
        'Update your browser to the latest version',
        'Try using a different browser',
        'Check device storage space',
        'Restart your device'
      ]
    }
  ];

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
          <h1 className="text-lg font-semibold text-gray-900">Technical Support</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Technical Support
          </h1>
          <p className="text-gray-600 text-sm">
            Troubleshoot common technical issues and get help with app problems.
          </p>
        </div>

        {/* Common Issues */}
        <div className="space-y-4">
          {technicalIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <issue.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {issue.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Solutions to try:</h4>
                <ul className="space-y-1">
                  {issue.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}