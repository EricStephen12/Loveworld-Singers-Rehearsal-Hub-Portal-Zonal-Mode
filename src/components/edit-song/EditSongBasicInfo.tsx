"use client";

import React from 'react';
import { History } from 'lucide-react';
import { Category } from '@/types/supabase';

interface EditSongBasicInfoProps {
  songTitle: string;
  setSongTitle: (value: string) => void;
  songCategories: string[];
  setSongCategories: (categories: string[]) => void;
  setSongCategory: (category: string) => void;
  songStatus: 'heard' | 'unheard';
  setSongStatus: (status: 'heard' | 'unheard') => void;
  songPraiseNight: string;
  setSongPraiseNight: (value: string) => void;
  categories: Category[];
  praiseNightCategories: any[];
  inputClasses: string;
  handlePaste: (e: React.ClipboardEvent, currentValue: string, setValue: (value: string) => void) => void;
  handleCreateHistory: (type: any) => void;
}

export const EditSongBasicInfo: React.FC<EditSongBasicInfoProps> = ({
  songTitle,
  setSongTitle,
  songCategories,
  setSongCategories,
  setSongCategory,
  songStatus,
  setSongStatus,
  songPraiseNight,
  setSongPraiseNight,
  categories,
  praiseNightCategories,
  inputClasses,
  handlePaste,
  handleCreateHistory
}) => {
  return (
    <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h4 className="text-base sm:text-lg font-semibold text-slate-900">Song Details</h4>
        <button
          onClick={() => handleCreateHistory('song-details')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
        >
          <History className="w-3 h-3" />
          Add History
        </button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Song Title *
          </label>
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            onPaste={(e) => handlePaste(e, songTitle, setSongTitle)}
            dir="ltr"
            style={{ textAlign: 'left', direction: 'ltr' }}
            className={`${inputClasses} text-lg font-medium`}
            placeholder="Enter song title"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categories * (Select one or more)
            </label>
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50 max-h-48 overflow-y-auto">
              {categories.map(category => (
                <label key={category.id} className="flex items-center space-x-3 py-2 hover:bg-slate-100 rounded px-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={songCategories.includes(category.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newCategories = [...songCategories, category.name];
                        setSongCategories(newCategories);
                        setSongCategory(newCategories[0] || '');
                      } else {
                        const newCategories = songCategories.filter(cat => cat !== category.name);
                        setSongCategories(newCategories);
                        setSongCategory(newCategories[0] || '');
                      }
                    }}
                    className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-sm text-slate-700">{category.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Selected: {songCategories.length > 0 ? songCategories.join(', ') : 'None'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={songStatus}
              onChange={(e) => setSongStatus(e.target.value as 'heard' | 'unheard')}
              className={inputClasses}
            >
              <option value="heard">Heard</option>
              <option value="unheard">Unheard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Praise Night
          </label>
          <select
            value={songPraiseNight}
            onChange={(e) => setSongPraiseNight(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
          >
            <option value="">Select Praise Night</option>
            {praiseNightCategories.map(praiseNight => (
              <option key={praiseNight.id} value={praiseNight.name}>{praiseNight.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
