import React, { useState, useEffect } from 'react';

interface SyncStatus {
  mongoCount: number;
  fileCount: number;
  lastSync: string | null;
  needsSync: boolean;
}

const SyncStatusComponent: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sync-offers', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setLastSyncTime(data.timestamp);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setLoading(false);
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
        
        <button
          onClick={fetchSyncStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all disabled:opacity-50"
          title="Refresh Status"
        >
          <span className={loading ? 'animate-spin' : ''}>{loading ? '⟳' : '🔄'}</span>
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {status ? (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <span className="text-lg">🗄️</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Database</div>
                  <div className="text-xs text-gray-500">MongoDB</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400">{status.mongoCount}</div>
              <div className="text-xs text-gray-400 mt-1">Available offers</div>
            </div>
            
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <span className="text-lg">🔍</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Search Index</div>
                  <div className="text-xs text-gray-500">JSON File</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{status.fileCount}</div>
              <div className="text-xs text-gray-400 mt-1">Indexed offers</div>
            </div>
            
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${status.needsSync ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  <span className="text-lg">{status.needsSync ? '⚠️' : '✅'}</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="text-xs text-gray-500">Sync State</div>
                </div>
              </div>
              <div className={`text-lg font-bold ${status.needsSync ? 'text-red-400' : 'text-green-400'}`}>
                {status.needsSync ? 'Out of Sync' : 'In Sync'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {status.needsSync ? 'Needs Update' : 'Up to Date'}
              </div>
            </div>
          </div>

          {/* Sync Information */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Last Sync:</span>
                <span className="text-white text-sm font-medium">{formatDate(status.lastSync)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Last Check:</span>
                <span className="text-white text-sm font-medium">{formatDate(lastSyncTime)}</span>
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
                  Sync occurs automatically when offers are created, updated, or deleted. Manual intervention is rarely needed.
                </p>
                <p className="text-blue-300/80 text-xs mt-2">
                  Status checked every minute to ensure data integrity
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