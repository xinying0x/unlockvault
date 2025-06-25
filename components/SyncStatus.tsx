import React, { useState, useEffect } from 'react';

interface SyncStatus {
  mongoCount: number;
  fileCount: number;
  lastSync: string | null;
  needsSync: boolean;
}

interface FullSyncStatus {
  articles: SyncStatus;
  offers: SyncStatus;
  overallStatus: {
    needsSync: boolean;
    lastCheck: string;
  };
}

const SyncStatusComponent: React.FC = () => {
  const [status, setStatus] = useState<FullSyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sync-status', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/admin/sync-status', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        console.log('Sync completed:', data.message);
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    
    // Auto-refresh status every 60 seconds
    const interval = setInterval(fetchSyncStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never updated';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <div className="text-lg">Search Index Status</div>
            <div className="text-sm text-gray-400 font-normal">Real-time synchronization</div>
          </div>
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={fetchSyncStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all disabled:opacity-50"
            title="Refresh Status"
          >
            <span className={loading ? 'animate-spin' : ''}>{loading ? '⟳' : '🔄'}</span>
            <span className="text-sm">Refresh</span>
          </button>
          
          {status?.overallStatus.needsSync && (
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all disabled:opacity-50"
              title="Force Sync"
            >
              <span className={syncing ? 'animate-spin' : ''}>{syncing ? '⟳' : '🔄'}</span>
              <span className="text-sm">Sync Now</span>
            </button>
          )}
        </div>
      </div>

      {status ? (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${status.overallStatus.needsSync ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                <span className="text-lg">{status.overallStatus.needsSync ? '⚠️' : '✅'}</span>
              </div>
              <div>
                <div className="text-sm text-gray-400">Overall Status</div>
                <div className="text-xs text-gray-500">System State</div>
              </div>
            </div>
            <div className={`text-lg font-bold ${status.overallStatus.needsSync ? 'text-red-400' : 'text-green-400'}`}>
              {status.overallStatus.needsSync ? 'Out of Sync' : 'In Sync'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {status.overallStatus.needsSync ? 'Needs Update' : 'Up to Date'}
            </div>
          </div>

          {/* Articles and Offers Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Articles Status */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/40">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📄</span>
                Articles Status
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{status.articles.mongoCount}</div>
                  <div className="text-xs text-gray-400">MongoDB</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{status.articles.fileCount}</div>
                  <div className="text-xs text-gray-400">Search Index</div>
                </div>
              </div>
              
              <div className={`text-center text-sm font-medium ${status.articles.needsSync ? 'text-red-400' : 'text-green-400'}`}>
                {status.articles.needsSync ? 'Out of Sync' : 'In Sync'}
              </div>
              
              <div className="text-xs text-gray-400 text-center mt-2">
                Last Sync: {formatDate(status.articles.lastSync)}
              </div>
            </div>

            {/* Offers Status */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/40">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎯</span>
                Offers Status
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{status.offers.mongoCount}</div>
                  <div className="text-xs text-gray-400">MongoDB</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{status.offers.fileCount}</div>
                  <div className="text-xs text-gray-400">Search Index</div>
                </div>
              </div>
              
              <div className={`text-center text-sm font-medium ${status.offers.needsSync ? 'text-red-400' : 'text-green-400'}`}>
                {status.offers.needsSync ? 'Out of Sync' : 'In Sync'}
              </div>
              
              <div className="text-xs text-gray-400 text-center mt-2">
                Last Sync: {formatDate(status.offers.lastSync)}
              </div>
            </div>
          </div>

          {/* Auto Sync Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <span className="text-lg">ℹ️</span>
              </div>
              <div>
                <h4 className="text-blue-300 font-medium mb-2">Automatic Synchronization</h4>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Sync occurs automatically when articles or offers are created, updated, or deleted. Manual intervention is rarely needed.
                </p>
                <p className="text-blue-300/80 text-xs mt-2">
                  Status checked every minute to ensure data integrity • Last Check: {formatDate(status.overallStatus.lastCheck)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Loading index status...</div>
        </div>
      )}
    </div>
  );
};

export default SyncStatusComponent; 