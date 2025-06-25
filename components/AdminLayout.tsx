import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin-xyz123/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  const menuItems = [
    { href: '/admin-xyz123/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin-xyz123/new', label: 'Add New Offer', icon: '➕' },
    { href: '/admin-xyz123/manage', label: 'Manage Offers', icon: '📝' },
    { href: '/admin-xyz123/articles', label: 'Articles & Blog', icon: '📄' },
    { href: '/admin-xyz123/visitors', label: 'Visitors Analytics', icon: '👥' },
    { href: '/admin-xyz123/social-settings', label: 'Social Media', icon: '📱' },
    { href: '/admin-xyz123/security', label: 'Security', icon: '🛡️' },
    { href: '/admin-xyz123/settings', label: 'Settings', icon: '⚙️' },
    { href: '/', label: 'View Site', icon: '🌐', target: '_blank' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white overflow-hidden lg:flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 md:w-72 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-purple-500/30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 lg:w-72 lg:min-w-[18rem] lg:flex-shrink-0 overflow-y-auto lg:flex lg:flex-col lg:shadow-xl`}>
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-purple-500/30 lg:flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-2xl">🔓</span>
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.target}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                router.pathname === item.href || (item.href !== '/admin-xyz123/dashboard' && router.pathname.startsWith(item.href))
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-purple-500/30 mt-auto lg:flex-shrink-0">
          <div className="flex items-center gap-3 p-3 bg-purple-600/20 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium">Administrator</div>
              <div className="text-gray-400 text-sm truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-xl transition-colors mt-2"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:flex lg:flex-col min-h-screen lg:min-w-0">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-purple-500/30 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xl">🔓</span>
            <span className="text-lg font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ☰
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto lg:bg-gradient-to-br lg:from-transparent lg:to-purple-900/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{title}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}