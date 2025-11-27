'use client';

import React, { useEffect, useState } from 'react';
import { DeviceRegistration } from '@/lib/device-registration';
import { useAuth } from '@/hooks/useAuth';

export default function UserDevices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserDevices();
    }
  }, [user]);

  const loadUserDevices = async () => {
    try {
      setLoading(true);
      const userDevices = await DeviceRegistration.getUserDevices(user!.uid);
      setDevices(userDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceName = (userAgent: string) => {
    return DeviceRegistration.getDeviceName(userAgent);
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Devices</h3>
      
      {devices.length === 0 ? (
        <p className="text-gray-500 text-sm">No devices registered yet.</p>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {getDeviceName(device.userAgent)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {device.platform} • {device.screenResolution}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Last seen: {getTimeAgo(device.lastSeen)}</p>
                <p>First registered: {getTimeAgo(device.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>For security, each account can only be used on registered devices.</p>
        <p className="mt-1">If you see an unfamiliar device, please contact support.</p>
      </div>
    </div>
  );
}