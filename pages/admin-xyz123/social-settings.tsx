import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/AdminLayout';

interface SocialSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  whatsapp: string;
  telegram: string;
  email: string;
  website: string;
}

const SocialSettingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SocialSettings>({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    linkedin: '',
    whatsapp: '',
    telegram: '',
    email: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSettings();
    }
  }, [authLoading, user]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/social-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching social settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (platform: keyof SocialSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/social-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح!' });
      } else {
        setMessage({ type: 'error', text: 'فشل في حفظ الإعدادات' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال' });
    } finally {
      setSaving(false);
    }
  };

  const socialPlatforms = [
    {
      key: 'facebook' as keyof SocialSettings,
      label: 'Facebook',
      icon: '📘',
      placeholder: 'https://facebook.com/yourpage',
      color: 'blue'
    },
    {
      key: 'twitter' as keyof SocialSettings,
      label: 'X (Twitter)',
      icon: '🐦',
      placeholder: 'https://x.com/yourusername',
      color: 'gray'
    },
    {
      key: 'instagram' as keyof SocialSettings,
      label: 'Instagram',
      icon: '📷',
      placeholder: 'https://instagram.com/yourusername',
      color: 'pink'
    },
    {
      key: 'youtube' as keyof SocialSettings,
      label: 'YouTube',
      icon: '📺',
      placeholder: 'https://youtube.com/@yourchannel',
      color: 'red'
    },
    {
      key: 'tiktok' as keyof SocialSettings,
      label: 'TikTok',
      icon: '🎵',
      placeholder: 'https://tiktok.com/@yourusername',
      color: 'red'
    },
    {
      key: 'linkedin' as keyof SocialSettings,
      label: 'LinkedIn',
      icon: '💼',
      placeholder: 'https://linkedin.com/in/yourprofile',
      color: 'blue'
    },
    {
      key: 'whatsapp' as keyof SocialSettings,
      label: 'WhatsApp',
      icon: '💬',
      placeholder: '+1234567890',
      color: 'green'
    },
    {
      key: 'telegram' as keyof SocialSettings,
      label: 'Telegram',
      icon: '✈️',
      placeholder: 'https://t.me/yourusername',
      color: 'blue'
    },
    {
      key: 'email' as keyof SocialSettings,
      label: 'Email',
      icon: '📧',
      placeholder: 'contact@yoursite.com',
      color: 'gray'
    },
    {
      key: 'website' as keyof SocialSettings,
      label: 'Website',
      icon: '🌐',
      placeholder: 'https://yourwebsite.com',
      color: 'purple'
    }
  ];

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Social Media Settings | Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Social Media Settings</h1>
            <p className="text-gray-400">إدارة روابط مواقع التواصل الاجتماعي التي تظهر في جميع المقالات</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-300' 
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {socialPlatforms.map((platform) => (
                <div key={platform.key} className="space-y-2">
                  <label className="flex items-center gap-3 text-sm font-medium text-white">
                    <span className="text-2xl">{platform.icon}</span>
                    <span>{platform.label}</span>
                  </label>
                  <input
                    type="text"
                    value={settings[platform.key]}
                    onChange={(e) => handleChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-700/50">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'حفظ الإعدادات'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>👁️</span>
            معاينة كيف ستظهر في المقالات
          </h3>
          
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2 text-white">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share this article
            </h4>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {socialPlatforms.filter(p => settings[p.key]).map((platform) => (
                <div
                  key={platform.key}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                    platform.color === 'blue' ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' :
                    platform.color === 'gray' ? 'bg-gray-600/20 border-gray-500/30 text-gray-300' :
                    platform.color === 'pink' ? 'bg-pink-600/20 border-pink-500/30 text-pink-300' :
                    platform.color === 'red' ? 'bg-red-600/20 border-red-500/30 text-red-300' :
                    platform.color === 'green' ? 'bg-green-600/20 border-green-500/30 text-green-300' :
                    'bg-purple-600/20 border-purple-500/30 text-purple-300'
                  }`}
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <span className="text-xs font-medium">{platform.label}</span>
                </div>
              ))}
            </div>
            
            {Object.values(settings).every(value => !value) && (
              <p className="text-gray-400 text-center mt-4">
                لا توجد روابط محفوظة بعد. أضف الروابط أعلاه لرؤية المعاينة.
              </p>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <h4 className="text-blue-300 font-medium mb-2">كيفية الاستخدام</h4>
              <ul className="text-blue-200 text-sm leading-relaxed space-y-2">
                <li>• أضف روابط مواقع التواصل الاجتماعي الخاصة بك في الحقول أعلاه</li>
                <li>• ستظهر هذه الروابط تلقائياً في جميع المقالات</li>
                <li>• يمكنك ترك أي حقل فارغ إذا كنت لا تريد عرض ذلك الموقع</li>
                <li>• للـ WhatsApp: أدخل رقم الهاتف مع رمز البلد (مثال: +201234567890)</li>
                <li>• بقية الحقول: أدخل الرابط الكامل للصفحة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SocialSettingsPage; 