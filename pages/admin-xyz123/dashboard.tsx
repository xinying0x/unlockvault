import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import AdminLayout from '../../components/AdminLayout';
import ActivityFeed from '../../components/ActivityFeed';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface Tool {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: string;
  lockerLinks: { [key: string]: string };
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
}

interface RecentActivity {
  id: string;
  type: 'view' | 'unlock' | 'new_offer' | 'user_signup';
  description: string;
  timestamp: string;
  user?: string;
  offer?: string;
}

interface DashboardStats {
  totalOffers: number;
  totalViews: number;
  totalUnlocks: number;
  totalUsers: number;
  todayViews: number;
  todayUnlocks: number;
  conversionRate: number;
  revenue: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  activeUsers: number;
  bounceRate: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  count?: number;
  badge?: string;
}

interface DashboardData {
  totalViews: number;
  totalUnlocks: number;
  conversionRate: number;
  totalUsers: number;
  vpnUsers: number;
  dailyStats: Array<{
    timestamp: string;
    _count: {
      id: number;
    };
  }>;
  recentTools: Array<{
    id: string;
    title: string;
    views: number;
    unlocks: number;
  }>;
  totalOffers: number;
  todayViews: number;
  todayUnlocks: number;
  revenue: number;
  recentActivity: any[];
  topOffers: Array<{
    id: string;
    title: string;
    views: number;
    unlocks: number;
    conversionRate: number;
  }>;
  geographicData: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  deviceData: Array<{
    device: string;
    users: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    users: number;
    percentage: number;
  }>;
  viewsByBrowser: Array<{
    browser: string;
    users: number;
    percentage: number;
  }>;
  viewsByOS: Array<{
    os: string;
    users: number;
    percentage: number;
  }>;
  viewsByCountry: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  viewsByDevice: Array<{
    device: string;
    users: number;
    percentage: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user, loading, isAuthChecked } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOffers: 0,
    totalViews: 0,
    totalUnlocks: 0,
    totalUsers: 125000,
    todayViews: 0,
    todayUnlocks: 0,
    conversionRate: 0,
    revenue: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    bounceRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !refreshing) {
        fetchDashboardData(true);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [isLoading, refreshing]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!isAuthChecked) {
      return;
    }

    if (!user) {
      router.push('/admin-xyz123/login');
      return;
    }

    fetchDashboardData();
  }, [user, loading, router, isAuthChecked]);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
    setIsLoading(true);
    }
    
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/activity')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({
          ...prev,
          ...statsData,
          weeklyGrowth: Math.floor(Math.random() * 20) + 5, // Simulated data
          monthlyGrowth: Math.floor(Math.random() * 50) + 10,
          activeUsers: Math.floor(statsData.totalUsers * 0.15),
          bounceRate: Math.floor(Math.random() * 30) + 20
        }));
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData);
      }

      setLastRefresh(new Date());
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const quickActions: QuickAction[] = useMemo(() => [
    {
      title: 'Add New Offer',
      description: 'Create a new tool, app, or game offer',
      icon: '➕',
      href: '/admin-xyz123/new',
      color: 'from-green-500 to-emerald-600',
      count: stats.totalOffers,
      badge: 'New'
    },
    {
      title: 'Manage Offers',
      description: 'Edit, delete, or feature existing offers',
      icon: '📝',
      href: '/admin-xyz123/manage',
      color: 'from-blue-500 to-cyan-600',
      badge: `${stats.totalOffers} Items`
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: '📊',
      href: '/admin-xyz123/visitors',
      color: 'from-purple-500 to-violet-600',
      badge: 'Live'
    },
    {
      title: 'Security Settings',
      description: 'Change admin credentials and security',
      icon: '🛡️',
      href: '/admin-xyz123/security',
      color: 'from-red-500 to-pink-600',
      badge: 'Secure'
    },
    {
      title: 'Site Settings',
      description: 'Configure site-wide settings',
      icon: '⚙️',
      href: '/admin-xyz123/settings',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: '👥',
      href: '/admin-xyz123/users',
      color: 'from-indigo-500 to-blue-600',
      badge: `${formatNumber(stats.totalUsers)} Users`
    }
  ], [stats.totalOffers, stats.totalUsers]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'unlock': return '🔓';
      case 'view': return '👁️';
      case 'new_offer': return '✨';
      case 'user_signup': return '👤';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'unlock': return 'text-green-400';
      case 'view': return 'text-blue-400';
      case 'new_offer': return 'text-purple-400';
      case 'user_signup': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-400';
    if (growth < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➖';
  };

  if (loading || !isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">An error occurred</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your platform today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors focus:outline-none disabled:opacity-50"
            >
              <span className={`${refreshing ? 'animate-spin' : ''}`}>🔄</span>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <div className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getGrowthColor(stats.weeklyGrowth)}`}>
                  {getGrowthIcon(stats.weeklyGrowth)} +{stats.weeklyGrowth}%
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Offers</h3>
            <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
              {formatNumber(stats.totalOffers)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm p-6 rounded-xl border border-green-500/20 hover:border-green-400/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getGrowthColor(stats.monthlyGrowth)}`}>
                  {getGrowthIcon(stats.monthlyGrowth)} +{stats.monthlyGrowth}%
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
              {formatNumber(stats.totalViews)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-400/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <span className="text-2xl">🔓</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-purple-400">
                  {((stats.totalUnlocks / stats.totalViews) * 100 || 0).toFixed(1)}% CVR
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Unlocks</h3>
            <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
              {formatNumber(stats.totalUnlocks)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-400/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-yellow-400">
                  {formatNumber(stats.activeUsers)} Active
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
              {formatNumber(stats.totalUsers)}
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>⚡</span>
            <span>Quick Actions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.href} href={action.href}>
                <div className={`relative bg-gradient-to-br ${action.color} p-6 rounded-xl text-white hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{action.icon}</span>
                      {action.badge && (
                        <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                    {action.count !== undefined && (
                      <div className="mt-3 text-2xl font-bold">
                        {formatNumber(action.count)}
                      </div>
                    )}
                  </div>
                </div>
            </Link>
            ))}
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Performance Metrics */}
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📈</span>
              <span>Performance Metrics</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Conversion Rate</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {((stats.totalUnlocks / stats.totalViews) * 100 || 0).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatNumber(stats.totalUnlocks)} / {formatNumber(stats.totalViews)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Bounce Rate</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{stats.bounceRate}%</div>
                  <div className="text-sm text-gray-400">Session quality</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300">Active Users</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{formatNumber(stats.activeUsers)}</div>
                  <div className="text-sm text-gray-400">
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Overview */}
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🌟</span>
              <span>Today's Overview</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl mb-2">👁️</div>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.todayViews)}</div>
                <div className="text-sm text-gray-400">Views Today</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
                <div className="text-2xl mb-2">🔓</div>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.todayUnlocks)}</div>
                <div className="text-sm text-gray-400">Unlocks Today</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-2xl font-bold text-white">${formatNumber(stats.revenue)}</div>
                <div className="text-sm text-gray-400">Revenue</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-2xl font-bold text-white">{stats.weeklyGrowth}%</div>
                <div className="text-sm text-gray-400">Weekly Growth</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily Views Chart */}
        {dashboardData && dashboardData.dailyStats && dashboardData.dailyStats.length > 0 && (
            <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span>
                <span>Daily Views Trend</span>
              </h2>
              <div className="w-full h-[300px]">
              <Line
                data={{
                  labels: dashboardData.dailyStats.map(stat => new Date(stat.timestamp).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Views',
                      data: dashboardData.dailyStats.map(stat => stat._count.id),
                      borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      tension: 0.4,
                      fill: true,
                        pointBackgroundColor: 'rgb(139, 92, 246)',
                        pointBorderColor: 'rgb(139, 92, 246)',
                        pointHoverBackgroundColor: 'rgb(139, 92, 246)',
                        pointHoverBorderColor: 'rgb(255, 255, 255)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                      x: { 
                        ticks: { color: '#9ca3af' }, 
                        grid: { color: '#374151' },
                        border: { color: '#374151' }
                      },
                      y: { 
                        ticks: { color: '#9ca3af' }, 
                        grid: { color: '#374151' },
                        border: { color: '#374151' }
                      },
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index',
                  },
                }}
              />
            </div>
          </div>
        )}

          {/* Activity Feed */}
          <ActivityFeed />
        </div>

          {/* Top Offers */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🏆</span>
            <span>Top Performing Offers</span>
          </h2>
            {dashboardData && dashboardData.topOffers && dashboardData.topOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.topOffers.slice(0, 6).map((offer, index) => (
                <div key={offer.id} className="bg-slate-800/50 p-4 rounded-lg hover:bg-slate-800/70 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{offer.title}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
                      <div className="text-blue-400 font-bold">{formatNumber(offer.views)}</div>
                      <div className="text-gray-400">Views</div>
                    </div>
                    <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/20">
                      <div className="text-green-400 font-bold">{formatNumber(offer.unlocks)}</div>
                      <div className="text-gray-400">Unlocks</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-purple-400 font-bold text-lg">{offer.conversionRate}%</div>
                    <div className="text-gray-400 text-xs">Conversion Rate</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-400">No offers data available yet.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;