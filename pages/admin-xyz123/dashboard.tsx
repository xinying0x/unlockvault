import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
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
  Legend
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
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  count?: number;
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
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/activity')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Add New Offer',
      description: 'Create a new tool, app, or game offer',
      icon: '➕',
      href: '/admin-xyz123/new',
      color: 'from-green-500 to-emerald-600',
      count: stats.totalOffers
    },
    {
      title: 'Manage Offers',
      description: 'Edit, delete, or feature existing offers',
      icon: '📝',
      href: '/admin-xyz123/manage',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Security Settings',
      description: 'Change admin credentials and security',
      icon: '🛡️',
      href: '/admin-xyz123/security',
      color: 'from-red-500 to-pink-600'
    }
  ];

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

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

  if (loading || !isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Quick Stats Cards */}
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
            <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">Total Offers</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalOffers}</p>
          </div>
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
            <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">Total Views</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalViews}</p>
          </div>
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
            <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">Total Unlocks</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalUnlocks}</p>
          </div>
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
            <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">Total Users</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Welcome Section / Call to Action */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Welcome to the Dashboard!</h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            You have successfully logged in to the UnlockVault control panel. You can now manage offers, statistics, and site settings.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin-xyz123/new">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add New Offer
              </button>
            </Link>
            <Link href="/admin-xyz123/manage">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Manage Offers
              </button>
            </Link>
            <Link href="/admin-xyz123/security">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Manage Users
              </button>
            </Link>
          </div>
        </div>

        {/* Daily Views Chart */}
        {dashboardData && dashboardData.dailyStats && dashboardData.dailyStats.length > 0 && (
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Daily Views</h2>
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px]">
              <Line
                data={{
                  labels: dashboardData.dailyStats.map(stat => new Date(stat.timestamp).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Views',
                      data: dashboardData.dailyStats.map(stat => stat._count.id),
                      borderColor: 'rgb(139, 92, 246)',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      tension: 0.4,
                      fill: true,
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
                    x: { ticks: { color: '#a0a0a0' }, grid: { color: '#3a2c5a' } },
                    y: { ticks: { color: '#a0a0a0' }, grid: { color: '#3a2c5a' } },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Recent Activity & Top Offers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Activity Feed */}
          <ActivityFeed />

          {/* Top Offers */}
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Top Offers</h2>
            {dashboardData && dashboardData.topOffers && dashboardData.topOffers.length > 0 ? (
              <ul className="space-y-3 sm:space-y-4">
                {dashboardData.topOffers.slice(0, 5).map((offer) => (
                  <li key={offer.id} className="flex items-center justify-between bg-gray-800/50 p-2 sm:p-3 rounded-lg">
                    <div>
                      <h3 className="text-gray-300 text-xs sm:text-sm font-semibold">{offer.title}</h3>
                      <p className="text-gray-500 text-xs mt-1">Views: {formatNumber(offer.views)} | Unlocks: {formatNumber(offer.unlocks)}</p>
                    </div>
                    <span className="text-purple-400 font-bold text-sm sm:text-base">
                      {offer.conversionRate}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm sm:text-base">No offers to display.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;