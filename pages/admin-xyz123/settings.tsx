import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  analyticsEnabled: boolean;
  maintenanceMode: boolean;
  defaultLockerType: string;
  maxRetries: number;
  cooldownPeriod: number;
  useDummyStats: boolean;
}

const SettingsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    analyticsEnabled: true,
    maintenanceMode: false,
    defaultLockerType: 'survey',
    maxRetries: 3,
    cooldownPeriod: 24,
    useDummyStats: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin-xyz123/login');
    } else if (user) {
      fetchSettings();
    }
  }, [user, loading, router]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Site Settings">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-600/20 border border-green-500/30 text-green-300">
            Settings saved successfully!
          </div>
        )}
        {saveError && (
          <div className="mb-6 p-4 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Settings */}
          <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30">
            <h2 className="text-xl font-semibold mb-6 text-purple-300">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-300 mb-2">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30">
            <h2 className="text-xl font-semibold mb-6 text-purple-300">System Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="analyticsEnabled"
                  name="analyticsEnabled"
                  checked={settings.analyticsEnabled}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-purple-900 rounded focus:ring-purple-500"
                />
                <label htmlFor="analyticsEnabled" className="ml-2 block text-sm text-gray-300">
                  Enable Analytics
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-purple-900 rounded focus:ring-purple-500"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-300">
                  Maintenance Mode
                </label>
              </div>
            </div>
          </div>

          {/* Locker Settings */}
          <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30">
            <h2 className="text-xl font-semibold mb-6 text-purple-300">Locker Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="defaultLockerType" className="block text-sm font-medium text-gray-300 mb-2">
                  Default Locker Type
                </label>
                <select
                  id="defaultLockerType"
                  name="defaultLockerType"
                  value={settings.defaultLockerType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="survey">Survey</option>
                  <option value="download">Download</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label htmlFor="maxRetries" className="block text-sm font-medium text-gray-300 mb-2">
                  Max Retries
                </label>
                <input
                  type="number"
                  id="maxRetries"
                  name="maxRetries"
                  value={settings.maxRetries}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="cooldownPeriod" className="block text-sm font-medium text-gray-300 mb-2">
                  Cooldown Period (hours)
                </label>
                <input
                  type="number"
                  id="cooldownPeriod"
                  name="cooldownPeriod"
                  value={settings.cooldownPeriod}
                  onChange={handleChange}
                  min="0"
                  max="72"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#18122B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Settings'
            )}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;