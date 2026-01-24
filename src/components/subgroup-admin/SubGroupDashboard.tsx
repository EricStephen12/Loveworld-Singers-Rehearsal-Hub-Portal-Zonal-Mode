"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Music, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { SubGroup } from '@/lib/subgroup-service';
import { SubGroupDatabaseService } from '@/lib/subgroup-database-service';

interface SubGroupDashboardProps {
  subGroup: SubGroup;
}

export default function SubGroupDashboard({ subGroup }: SubGroupDashboardProps) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalSongs: 0,
    totalRehearsals: 0,
    upcomingRehearsals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [subGroup.id]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const statsData = await SubGroupDatabaseService.getSubGroupStats(subGroup.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Members', 
      value: stats.totalMembers, 
      icon: Users, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'Songs', 
      value: stats.totalSongs, 
      icon: Music, 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      label: 'Rehearsals', 
      value: stats.totalRehearsals, 
      icon: Calendar, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'Upcoming', 
      value: stats.upcomingRehearsals, 
      icon: Clock, 
      color: 'bg-orange-100 text-orange-600' 
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{subGroup.name}</h1>
        <p className="text-slate-500 mt-1">
          {subGroup.type.charAt(0).toUpperCase() + subGroup.type.slice(1)} • 
          {subGroup.status === 'active' ? (
            <span className="text-green-600 ml-1">Active</span>
          ) : (
            <span className="text-yellow-600 ml-1">{subGroup.status}</span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {isLoading ? '-' : stat.value}
                  </p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">New Rehearsal</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Music className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Add Song</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Users className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700">Add Member</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">View Reports</span>
          </button>
        </div>
      </div>

      {/* Sub-Group Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-900 mb-4">Group Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Type</span>
            <span className="font-medium text-slate-900 capitalize">{subGroup.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className={`font-medium ${subGroup.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
              {subGroup.status === 'active' ? 'Active' : subGroup.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Created</span>
            <span className="font-medium text-slate-900">
              {new Date(subGroup.createdAt).toLocaleDateString()}
            </span>
          </div>
          {subGroup.description && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-slate-500 block mb-1">Description</span>
              <p className="text-slate-700">{subGroup.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
