"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';
import { Save, Smartphone, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { BackendAPI } from '@/lib/api-client';
import CustomLoader from '../CustomLoader';
import { ToastContainer, Toast } from '../Toast';

interface AppUpdateConfig {
  latestVersion: string;
  minRequiredVersion: string;
  downloadUrl: string;
  releaseNotes: string;
}

const AppUpdatesSection = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AppUpdateConfig>({
    latestVersion: '1.0.0',
    minRequiredVersion: '1.0.0',
    downloadUrl: '',
    releaseNotes: '',
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'app_settings', 'version_control');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as AppUpdateConfig);
      }
    } catch (error) {
      console.error('Error fetching app updates config:', error);
      addToast({ type: 'error', message: 'Failed to load app updates configuration.' });
    } finally {
      setLoading(false);
    }
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, 'app_settings', 'version_control');
      
      // Use BackendAPI to bypass client-side Firestore rules via Admin SDK
      const response = await BackendAPI.generic.update('app_settings', 'version_control', config);
      
      if (response.error || response.success === false) {
        throw new Error(response.error || 'Failed to update via backend API');
      }

      addToast({ type: 'success', message: 'App update settings saved successfully! Users will now see the prompt in their mobile app.' });
    } catch (error) {
      console.error('Error saving app updates config:', error);
      addToast({ type: 'error', message: 'Failed to save app updates configuration.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <CustomLoader message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-purple-600" />
            Mobile App Updates
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Control the version requirements and forced update modal for the Rehearsal Hub Mobile App.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchConfig}
            className="p-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all ${
              saving ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 active:scale-[0.98]'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900">How it works</h3>
          <p className="text-sm text-blue-800 mt-1">
            When users open the mobile app, it checks these settings. If their app version is lower than the <span className="font-semibold">Latest Version</span>, they are prompted to update. 
            If it is lower than the <span className="font-semibold">Minimum Required Version</span>, they are <span className="underline">forced</span> to update and cannot dismiss the modal.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Latest Version */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Latest App Version
              </label>
              <input
                type="text"
                value={config.latestVersion}
                onChange={(e) => setConfig({ ...config, latestVersion: e.target.value })}
                placeholder="e.g. 1.0.5"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all dark:text-white"
              />
              <p className="text-xs text-gray-500">
                The current active version of the mobile app. Users below this version will see a prompt to update.
              </p>
            </div>

            {/* Minimum Required Version */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Minimum Required Version
                <AlertCircle className="w-4 h-4 text-red-500" />
              </label>
              <input
                type="text"
                value={config.minRequiredVersion}
                onChange={(e) => setConfig({ ...config, minRequiredVersion: e.target.value })}
                placeholder="e.g. 1.0.3"
                className="w-full px-4 py-3 bg-gray-50 border border-red-100 dark:bg-gray-900 dark:border-red-900/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all dark:text-white"
              />
              <p className="text-xs text-red-500/80">
                Any user with a version lower than this will be locked out until they update.
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Download URL */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Download URL (APK Link or App Store Link)
            </label>
            <input
              type="text"
              value={config.downloadUrl}
              onChange={(e) => setConfig({ ...config, downloadUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all dark:text-white"
            />
            <p className="text-xs text-gray-500">
              Where users will be taken when they click "Download Update".
            </p>
          </div>

          {/* Release Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Release Notes (What's New)
            </label>
            <textarea
              value={config.releaseNotes}
              onChange={(e) => setConfig({ ...config, releaseNotes: e.target.value })}
              placeholder="Enter release notes or new features..."
              className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500">
              This text is displayed in the update modal so users know what they are downloading.
            </p>
          </div>

        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
};

export default AppUpdatesSection;
