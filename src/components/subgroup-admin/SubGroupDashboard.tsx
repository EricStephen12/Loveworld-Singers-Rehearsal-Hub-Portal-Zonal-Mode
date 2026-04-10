"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Music, 
  Calendar, 
  Clock,
  Bell
} from 'lucide-react';
import { SubGroup } from '@/lib/subgroup-service';
import { SubGroupDatabaseService } from '@/lib/subgroup-database-service';

interface SubGroupDashboardProps {
  subGroup: SubGroup;
  onNavigate?: (section: string) => void;
}

export default function SubGroupDashboard({ subGroup, onNavigate }: SubGroupDashboardProps) {
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
    <div className="flex-1 flex flex-col p-6 lg:p-10 space-y-12">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} bg-opacity-10`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                    {isLoading ? '...' : stat.value}
                  </p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
            </div>
          );
        })}
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate?.('Pages')}
          className="flex flex-col items-start gap-4 p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-purple-600/20 transition-all text-left"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-purple-600 border border-slate-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-lg font-black text-slate-900 uppercase tracking-tight">Songs</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate?.('Members')}
          className="flex flex-col items-start gap-4 p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-600/20 transition-all text-left"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 border border-slate-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-lg font-black text-slate-900 uppercase tracking-tight">Members</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate?.('Notifications')}
          className="flex flex-col items-start gap-4 p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-orange-600/20 transition-all text-left"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-orange-600 border border-slate-100">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-lg font-black text-slate-900 uppercase tracking-tight">Notifications</span>
          </div>
        </button>
      </div>
    </div>
  );
}
