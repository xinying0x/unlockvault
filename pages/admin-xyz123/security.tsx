import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';

interface SecuritySettings {
  currentEmail: string;
  newEmail: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SecurityPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SecuritySettings>({
    currentEmail: '',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Only redirect if not already on the login page and router is ready
    if (!router.isReady) return;

    if (!loading && !user && router.pathname !== '/admin-xyz123/login') {
      router.push('/admin-xyz123/login');
    } else if (user) {
      setSettings(prev => ({ ...prev, currentEmail: user.email || '' }));
    }
  }, [user, loading, router]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = async () => {
    if (!settings.newEmail || !settings.currentPassword) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    if (!validateEmail(settings.newEmail)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Email updated successfully!');
      setMessageType('success');
      setSettings(prev => ({ 
        ...prev, 
        currentEmail: prev.newEmail,
        newEmail: '',
        currentPassword: ''
      }));
    } catch (error) {
      setMessage('Failed to update email. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
      setMessage('Please fill in all password fields');
      setMessageType('error');
      return;
    }

    if (settings.newPassword !== settings.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    const passwordValidation = validatePassword(settings.newPassword);
    if (!passwordValidation.isValid) {
      setMessage('Password does not meet security requirements');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Password updated successfully!');
      setMessageType('success');
      setSettings(prev => ({ 
        ...prev, 
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage('Failed to update password. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(settings.newPassword);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Security Settings</h2>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Security Settings">
      <div className="max-w-4xl mx-auto">
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${messageType === 'success' ? 'bg-green-600/20 border border-green-500/30 text-green-300' : 'bg-red-600/20 border border-red-500/30 text-red-300'}`}>
            {message}
          </div>
        )}

        {/* Change Email Section */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-purple-300">Change Email</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleEmailChange(); }} className="space-y-4">
            <div>
              <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-300 mb-2">Current Email</label>
              <input
                type="email"
                id="currentEmail"
                value={settings.currentEmail}
                className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-gray-400 cursor-not-allowed focus:outline-none"
                disabled
              />
            </div>
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-300 mb-2">New Email</label>
              <input
                type="email"
                id="newEmail"
                value={settings.newEmail}
                onChange={(e) => setSettings({ ...settings, newEmail: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="new.admin@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="currentPasswordEmail" className="block text-sm font-medium text-gray-300 mb-2">Current Password (to confirm)</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPasswordEmail"
                  value={settings.currentPassword}
                  onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-10"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#18122B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Change Email'}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-purple-300">Change Password</h2>
          <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  value={settings.currentPassword}
                  onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-10"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  value={settings.newPassword}
                  onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-10"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={settings.confirmPassword}
                  onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-10"
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 space-y-1">
              <p className="font-semibold mb-2">Password Requirements:</p>
              <p className={passwordValidation.minLength ? 'text-green-400' : 'text-red-400'}>• At least 8 characters</p>
              <p className={passwordValidation.hasUpper ? 'text-green-400' : 'text-red-400'}>• At least one uppercase letter</p>
              <p className={passwordValidation.hasLower ? 'text-green-400' : 'text-red-400'}>• At least one lowercase letter</p>
              <p className={passwordValidation.hasNumber ? 'text-green-400' : 'text-red-400'}>• At least one number</p>
              <p className={passwordValidation.hasSpecial ? 'text-green-400' : 'text-red-400'}>• At least one special character (!@#$%^&*,.)</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#18122B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SecurityPage;