import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

interface Visit {
  ip: string;
  country: string;
  city?: string;
  bot: boolean;
  adBlock: boolean;
  vpn: boolean;
  timestamp: string;
  date: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  trafficSource?: string;
  offerId?: string;
}

interface VisitorStats {
  totalVisits: number;
  uniqueIPs: number;
  countries: { [key: string]: number };
  vpnUsers: number;
  botTraffic: number;
  adBlockUsers: number;
}

const VisitorsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitorStats>({
    totalVisits: 0,
    uniqueIPs: 0,
    countries: {},
    vpnUsers: 0,
    botTraffic: 0,
    adBlockUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin-xyz123/login');
    } else if (user) {
      fetchVisitors();
    }
  }, [user, loading, router]);

  const fetchVisitors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/visitors');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.visits && data.stats) {
        setVisits(data.visits);
        setStats(data.stats);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching visitors:', error);
      // عرض بيانات تجريبية في حالة فشل الاتصال
      setStats({
        totalVisits: 0,
        uniqueIPs: 0,
        countries: {},
        vpnUsers: 0,
        botTraffic: 0,
        adBlockUsers: 0
      });
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
      'Germany': '🇩🇪', 'France': '🇫🇷', 'Italy': '🇮🇹', 'Spain': '🇪🇸',
      'Netherlands': '🇳🇱', 'Australia': '🇦🇺', 'Japan': '🇯🇵',
      'South Korea': '🇰🇷', 'China': '🇨🇳', 'India': '🇮🇳', 'Brazil': '🇧🇷',
      'Mexico': '🇲🇽', 'Argentina': '🇦🇷', 'Russia': '🇷🇺', 'Turkey': '🇹🇷',
      'Saudi Arabia': '🇸🇦', 'Egypt': '🇪🇬', 'UAE': '🇦🇪', 'Morocco': '🇲🇦',
      'Algeria': '🇩🇿', 'Tunisia': '🇹🇳', 'Jordan': '🇯🇴', 'Lebanon': '🇱🇧',
      'Iraq': '🇮🇶', 'Syria': '🇸🇾', 'Palestine': '🇵🇸', 'Kuwait': '🇰🇼',
      'Bahrain': '🇧🇭', 'Qatar': '🇶🇦', 'Oman': '🇴🇲', 'Yemen': '🇾🇪'
    };
    return flags[country] || '🌍';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (visit.city && visit.city.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCountry = !filterCountry || visit.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVisits = filteredVisits.slice(startIndex, startIndex + itemsPerPage);

  const uniqueCountries = Array.from(new Set(visits.map(v => v.country))).sort();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout title="Visitors Analytics">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Visits</h3>
            <p className="text-3xl font-bold text-white">{stats.totalVisits}</p>
          </div>
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Unique IPs</h3>
            <p className="text-3xl font-bold text-white">{stats.uniqueIPs}</p>
          </div>
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">VPN Users</h3>
            <p className="text-3xl font-bold text-orange-400">{stats.vpnUsers}</p>
          </div>
          <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Bot Traffic</h3>
            <p className="text-3xl font-bold text-red-400">{stats.botTraffic}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search IP/Country/City</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search visitors..."
                className="w-full px-4 py-2 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Country</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>
                    {getCountryFlag(country)} {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCountry('');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Visitors Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
            <h2 className="text-xl font-bold">Visitor Details</h2>
            <p className="text-purple-100">Real-time visitor tracking with IP addresses and locations</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FLAGS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIMESTAMP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BROWSER</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DEVICE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COUNTRY</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP ADDRESS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentVisits.map((visit) => (
                  <tr key={visit.ip} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-1">
                        {visit.vpn && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">VPN</span>}
                        {visit.bot && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">BOT</span>}
                        {visit.adBlock && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">ADBLOCK</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(visit.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visit.browser}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="capitalize">{visit.deviceType}</span>
                      <div className="text-xs text-gray-500">{visit.os}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {getCountryFlag(visit.country)}
                        <span className="ml-2">{visit.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {visit.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-purple-900/30 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default VisitorsPage; 