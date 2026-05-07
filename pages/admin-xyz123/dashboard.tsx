import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import ActivityFeed from '../../components/ActivityFeed';
import { useAuth } from '../../hooks/useAuth';

interface Offer {
  id: string;
  slug?: string;
  title: string;
  type?: string;
  category?: string;
  status?: string;
  views?: number;
  unlocks?: number;
  addedAt?: string;
}

interface Article {
  id: string;
  title: string;
  published?: boolean;
  views?: number;
}

interface StatsResponse {
  totalOffers?: number;
  totalViews?: number;
  totalUnlocks?: number;
  totalVisits?: number;
  todayVisits?: number;
  uniqueVisitors?: number;
}

interface VisitStatsResponse {
  totalVisits?: number;
  uniqueIPs?: number;
  todayVisits?: number;
  vpnUsers?: number;
  botTraffic?: number;
  adBlockUsers?: number;
  countries?: Record<string, number>;
  browsers?: Record<string, number>;
  devices?: Record<string, number>;
  trafficSources?: Record<string, number>;
}

interface DashboardState {
  offers: Offer[];
  articles: Article[];
  stats: StatsResponse;
  visits: VisitStatsResponse;
}

interface AdsterraItem {
  date?: string;
  revenue?: number;
  impression?: number;
  clicks?: number;
  ctr?: number;
  cpm?: number;
}

interface AdsterraStats {
  configured?: boolean;
  items?: AdsterraItem[];
  error?: string;
}

const emptyDashboard: DashboardState = {
  offers: [],
  articles: [],
  stats: {},
  visits: {},
};

export default function AdminDashboard() {
  const { user, loading, isAuthChecked } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardState>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [adsterra, setAdsterra] = useState<AdsterraStats | null>(null);

  const formatNumber = (value?: number | null) => {
    const number = Number(value || 0);
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return number.toString();
  };

  const loadDashboard = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError('');

    try {
      const [statsRes, visitsRes, offersRes, articlesRes, adsterraRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/visit-stats'),
        fetch('/api/offers'),
        fetch('/api/articles?published=all'),
        fetch('/api/adsterra/stats').catch(() => null),
      ]);

      const stats = statsRes.ok ? await statsRes.json() : {};
      const visits = visitsRes.ok ? await visitsRes.json() : {};
      const offers = offersRes.ok ? await offersRes.json() : [];
      const articlesPayload = articlesRes.ok ? await articlesRes.json() : [];
      const articles = Array.isArray(articlesPayload)
        ? articlesPayload
        : Array.isArray(articlesPayload.articles)
          ? articlesPayload.articles
          : [];
      const adsterraPayload = adsterraRes?.ok ? await adsterraRes.json() : null;

      setData({
        stats,
        visits,
        offers: Array.isArray(offers) ? offers : [],
        articles: Array.isArray(articles) ? articles : [],
      });
      setAdsterra(adsterraPayload);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError('Could not load dashboard data.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || !isAuthChecked) return;
    if (!user) {
      router.push('/admin-xyz123/login');
      return;
    }
    loadDashboard();
  }, [isAuthChecked, loadDashboard, router, user]);

  const realStats = useMemo(() => {
    const activeOffers = data.offers.filter((offer) => (offer.status || 'active') === 'active');
    const totalViews = data.stats.totalViews ?? activeOffers.reduce((sum, offer) => sum + Number(offer.views || 0), 0);
    const totalUnlocks = data.stats.totalUnlocks ?? activeOffers.reduce((sum, offer) => sum + Number(offer.unlocks || 0), 0);
    const publishedArticles = data.articles.filter((article) => article.published).length;
    const articleViews = data.articles.reduce((sum, article) => sum + Number(article.views || 0), 0);

    return {
      activeOffers: data.stats.totalOffers ?? activeOffers.length,
      totalViews,
      totalUnlocks,
      conversionRate: totalViews > 0 ? (totalUnlocks / totalViews) * 100 : 0,
      totalVisits: data.visits.totalVisits ?? data.stats.totalVisits ?? 0,
      todayVisits: data.visits.todayVisits ?? data.stats.todayVisits ?? 0,
      uniqueVisitors: data.visits.uniqueIPs ?? data.stats.uniqueVisitors ?? 0,
      botTraffic: data.visits.botTraffic ?? 0,
      vpnUsers: data.visits.vpnUsers ?? 0,
      adBlockUsers: data.visits.adBlockUsers ?? 0,
      totalArticles: data.articles.length,
      publishedArticles,
      draftArticles: data.articles.length - publishedArticles,
      articleViews,
    };
  }, [data]);

  const topOffers = useMemo(() => {
    return [...data.offers]
      .sort((a, b) => Number(b.unlocks || 0) - Number(a.unlocks || 0) || Number(b.views || 0) - Number(a.views || 0))
      .slice(0, 6);
  }, [data.offers]);

  const recentOffers = useMemo(() => {
    return [...data.offers]
      .sort((a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime())
      .slice(0, 5);
  }, [data.offers]);

  const adsterraTotals = useMemo(() => {
    const items = Array.isArray(adsterra?.items) ? adsterra.items : [];
    return {
      revenue: items.reduce((sum, item) => sum + Number(item.revenue || 0), 0),
      impressions: items.reduce((sum, item) => sum + Number(item.impression || 0), 0),
      clicks: items.reduce((sum, item) => sum + Number(item.clicks || 0), 0),
      items,
    };
  }, [adsterra]);

  const cards = [
    {
      title: 'Active Offers',
      value: formatNumber(realStats.activeOffers),
      detail: 'Games, apps, and tools',
      color: 'border-green-500/25 bg-green-500/10',
    },
    {
      title: 'Total Views',
      value: formatNumber(realStats.totalViews),
      detail: 'From offer records',
      color: 'border-blue-500/25 bg-blue-500/10',
    },
    {
      title: 'Unlocks',
      value: formatNumber(realStats.totalUnlocks),
      detail: `${realStats.conversionRate.toFixed(1)}% conversion`,
      color: 'border-purple-500/25 bg-purple-500/10',
    },
    {
      title: 'Visitors',
      value: formatNumber(realStats.uniqueVisitors),
      detail: `${formatNumber(realStats.todayVisits)} today`,
      color: 'border-yellow-500/25 bg-yellow-500/10',
    },
    {
      title: 'Articles',
      value: formatNumber(realStats.totalArticles),
      detail: `${formatNumber(realStats.publishedArticles)} published`,
      color: 'border-indigo-500/25 bg-indigo-500/10',
    },
    {
      title: 'Security Signals',
      value: formatNumber(realStats.botTraffic + realStats.vpnUsers + realStats.adBlockUsers),
      detail: 'Bots, VPN, and adblock',
      color: 'border-red-500/25 bg-red-500/10',
    },
  ];

  const actions = [
    { title: 'Add Offer', href: '/admin-xyz123/new', note: 'Create a new unlock item' },
    { title: 'Manage Offers', href: '/admin-xyz123/manage', note: 'Edit active content' },
    { title: 'QR Generator', href: '/admin-xyz123/qr-generator', note: 'Create unlock QR links' },
    { title: 'Articles', href: '/admin-xyz123/articles', note: 'Manage blog content' },
    { title: 'Adsterra', href: '/admin-xyz123/adsterra', note: 'Revenue and ad stats' },
    { title: 'Visitors', href: '/admin-xyz123/visitors', note: 'Inspect traffic' },
    { title: 'Security', href: '/admin-xyz123/security', note: 'Admin credentials' },
  ];

  if (loading || !isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0B1E] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-purple-400/30 border-t-purple-400 animate-spin" />
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">Only live data and working tools are shown here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-gray-500">Updated {lastRefresh.toLocaleTimeString()}</span>
            )}
            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {cards.map((card) => (
            <div key={card.title} className={`rounded-xl border p-5 ${card.color}`}>
              <p className="text-sm font-medium text-gray-300">{card.title}</p>
              <p className="mt-3 text-3xl font-black text-white">{card.value}</p>
              <p className="mt-2 text-xs text-gray-400">{card.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-xl border border-purple-900/30 bg-[#1C1535]/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Top Offers</h2>
              <Link href="/admin-xyz123/manage" className="text-sm text-purple-300 hover:text-purple-200">
                Manage
              </Link>
            </div>

            {topOffers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="py-3 pr-4">Offer</th>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4 text-right">Views</th>
                      <th className="py-3 text-right">Unlocks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {topOffers.map((offer) => (
                      <tr key={offer.id || offer.slug}>
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-white">{offer.title}</p>
                          <p className="text-xs text-gray-500">{offer.category || 'Uncategorized'}</p>
                        </td>
                        <td className="py-3 pr-4 capitalize text-gray-300">{offer.type || 'offer'}</td>
                        <td className="py-3 pr-4 text-right text-gray-300">{formatNumber(offer.views)}</td>
                        <td className="py-3 text-right font-semibold text-purple-200">{formatNumber(offer.unlocks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-black/20 p-6 text-center text-gray-400">
                No offer data yet.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-purple-900/30 bg-[#1C1535]/50 p-5">
            <h2 className="mb-4 text-xl font-bold text-white">Quick Actions</h2>
            <div className="space-y-3">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="block rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-purple-400/40 hover:bg-purple-500/10"
                >
                  <p className="font-semibold text-white">{action.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{action.note}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Adsterra</h2>
              <p className="text-sm text-gray-400">Last 7 days from your Adsterra API key.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                adsterra?.configured ? 'bg-green-500/15 text-green-200' : 'bg-yellow-500/15 text-yellow-200'
              }`}>
                {adsterra?.configured ? 'Connected' : 'Needs API key'}
              </span>
              <Link href="/admin-xyz123/adsterra" className="text-sm font-semibold text-blue-200 hover:text-blue-100">
                Open
              </Link>
            </div>
          </div>

          {adsterra?.configured ? (
            <>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Revenue</p>
                  <p className="mt-2 text-2xl font-black text-green-300">${adsterraTotals.revenue.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Impressions</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatNumber(adsterraTotals.impressions)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Clicks</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatNumber(adsterraTotals.clicks)}</p>
                </div>
              </div>

              {adsterra?.error && (
                <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {adsterra.error}
                </p>
              )}
            </>
          ) : (
            <p className="mt-5 rounded-lg border border-yellow-500/25 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Add `ADSTERRA_API_KEY` to your environment to show real Adsterra stats here.
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-purple-900/30 bg-[#1C1535]/50 p-5">
            <h2 className="mb-4 text-xl font-bold text-white">Recent Offers</h2>
            {recentOffers.length > 0 ? (
              <div className="space-y-3">
                {recentOffers.map((offer) => (
                  <div key={offer.id || offer.slug} className="flex items-center justify-between rounded-lg bg-black/20 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{offer.title}</p>
                      <p className="text-xs text-gray-500">
                        {offer.addedAt ? new Date(offer.addedAt).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                    <Link
                      href={`/admin-xyz123/edit/${offer.id}`}
                      className="ml-4 rounded-md bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200 hover:bg-white/15"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-black/20 p-6 text-center text-gray-400">
                No recent offers.
              </div>
            )}
          </div>

          <ActivityFeed />
        </section>
      </div>
    </AdminLayout>
  );
}
