import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../hooks/useAuth';

interface AdsterraItem {
  date?: string;
  revenue?: number;
  impression?: number;
  clicks?: number;
  ctr?: number;
  cpm?: number;
}

interface AdsterraResponse {
  configured?: boolean;
  items?: AdsterraItem[];
  error?: string;
  details?: string;
  message?: string;
}

export default function AdsterraPage() {
  const { user, loading, isAuthChecked } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdsterraResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatNumber = (value?: number | null) => {
    const number = Number(value || 0);
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return number.toString();
  };

  const loadStats = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch('/api/adsterra/stats');
      const payload = await response.json();
      setData(payload);
    } catch (error: any) {
      setData({
        configured: false,
        error: 'Could not load Adsterra stats',
        message: error.message,
        items: [],
      });
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
    loadStats();
  }, [isAuthChecked, loadStats, router, user]);

  const items = Array.isArray(data?.items) ? data.items : [];
  const totals = useMemo(() => {
    return {
      revenue: items.reduce((sum, item) => sum + Number(item.revenue || 0), 0),
      impressions: items.reduce((sum, item) => sum + Number(item.impression || 0), 0),
      clicks: items.reduce((sum, item) => sum + Number(item.clicks || 0), 0),
      cpm: items.length > 0
        ? items.reduce((sum, item) => sum + Number(item.cpm || 0), 0) / items.length
        : 0,
    };
  }, [items]);

  if (loading || !isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0B1E] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
          <p className="text-gray-300">Loading Adsterra...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Adsterra">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Adsterra</h1>
            <p className="mt-1 text-sm text-gray-400">Revenue, impressions, clicks, CTR, and CPM for the last 7 days.</p>
          </div>
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {!data?.configured && (
          <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5">
            <h2 className="font-bold text-yellow-100">Adsterra API key is missing</h2>
            <p className="mt-2 text-sm text-yellow-100/80">
              Add `ADSTERRA_API_KEY` to `.env.local` or your hosting environment, then refresh this page.
            </p>
          </section>
        )}

        {data?.error && (
          <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <h2 className="font-bold text-red-100">{data.error}</h2>
            {(data.message || data.details) && (
              <p className="mt-2 break-all text-sm text-red-100/80">{data.message || data.details}</p>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-5">
            <p className="text-sm font-medium text-gray-300">Revenue</p>
            <p className="mt-3 text-3xl font-black text-green-300">${totals.revenue.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-5">
            <p className="text-sm font-medium text-gray-300">Impressions</p>
            <p className="mt-3 text-3xl font-black text-white">{formatNumber(totals.impressions)}</p>
          </div>
          <div className="rounded-xl border border-purple-500/25 bg-purple-500/10 p-5">
            <p className="text-sm font-medium text-gray-300">Clicks</p>
            <p className="mt-3 text-3xl font-black text-white">{formatNumber(totals.clicks)}</p>
          </div>
          <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 p-5">
            <p className="text-sm font-medium text-gray-300">Average CPM</p>
            <p className="mt-3 text-3xl font-black text-white">${totals.cpm.toFixed(2)}</p>
          </div>
        </section>

        <section className="rounded-xl border border-blue-900/30 bg-[#1C1535]/50 p-5">
          <h2 className="mb-4 text-xl font-bold text-white">Daily Stats</h2>
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4 text-right">Revenue</th>
                    <th className="py-3 pr-4 text-right">Impressions</th>
                    <th className="py-3 pr-4 text-right">Clicks</th>
                    <th className="py-3 pr-4 text-right">CTR</th>
                    <th className="py-3 text-right">CPM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item, index) => (
                    <tr key={`${item.date || 'date'}-${index}`}>
                      <td className="py-3 pr-4 font-semibold text-white">{item.date || '-'}</td>
                      <td className="py-3 pr-4 text-right text-green-200">${Number(item.revenue || 0).toFixed(3)}</td>
                      <td className="py-3 pr-4 text-right text-gray-300">{formatNumber(item.impression)}</td>
                      <td className="py-3 pr-4 text-right text-gray-300">{formatNumber(item.clicks)}</td>
                      <td className="py-3 pr-4 text-right text-gray-300">{Number(item.ctr || 0).toFixed(2)}%</td>
                      <td className="py-3 text-right text-gray-300">${Number(item.cpm || 0).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-black/20 p-6 text-center text-gray-400">
              No Adsterra rows returned for this period.
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
