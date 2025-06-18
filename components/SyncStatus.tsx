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
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching sync status with credentials...');
      const response = await fetch('/api/admin/sync-offers', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('📡 Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sync status data:', data);
        setStatus(data.status);
        setLastSyncTime(data.timestamp);
      } else {
        console.error('❌ Failed response:', response.status, response.statusText);
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
      console.log('🔄 Triggering manual sync with credentials...');
      const response = await fetch('/api/admin/sync-offers', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Sync response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sync successful:', data);
        setStatus(data.status);
        setLastSyncTime(data.timestamp);
        
        // Show success message
        alert('✅ Offers synchronized successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Sync failed:', response.status, errorData);
        alert(`❌ Sync failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('❌ Sync failed: Network error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    
    // Auto-refresh status every 30 seconds
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getSyncStatusColor = (needsSync: boolean) => {
    return needsSync ? 'text-red-400' : 'text-green-400';
  };

  const getSyncStatusText = (needsSync: boolean) => {
    return needsSync ? '⚠️ Out of Sync' : '✅ In Sync';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🔄 Search Index Sync Status
        </h3>
        <button
          onClick={fetchSyncStatus}
          disabled={loading}
          className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          title="Refresh Status"
        >
          {loading ? '🔄' : '↻'}
        </button>
      </div>

      {status ? (
        <div className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{status.mongoCount}</div>
              <div className="text-sm text-gray-400">MongoDB Offers</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{status.fileCount}</div>
              <div className="text-sm text-gray-400">Search Index</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 text-center">
              <div className={`text-lg font-bold ${getSyncStatusColor(status.needsSync)}`}>
                {getSyncStatusText(status.needsSync)}
              </div>
              <div className="text-sm text-gray-400">Status</div>
            </div>
          </div>

          {/* Sync Information */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Last Sync:</span>
                <span className="ml-2 text-white">{formatDate(status.lastSync)}</span>
              </div>
              <div>
                <span className="text-gray-400">Last Check:</span>
                <span className="ml-2 text-white">{formatDate(lastSyncTime)}</span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          {status.needsSync && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400">
                <span>⚠️</span>
                <span className="font-medium">Search index is out of sync!</span>
              </div>
              <p className="text-red-300 text-sm mt-1">
                The search results may not reflect recent changes. Click "Sync Now" to update.
              </p>
            </div>
          )}

          {/* Manual Sync Button */}
          <div className="flex justify-center">
            <button
              onClick={triggerSync}
              disabled={syncing}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                syncing
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : status.needsSync
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Syncing...
                </>
              ) : (
                <>
                  🔄 {status.needsSync ? 'Sync Now' : 'Force Sync'}
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            Auto-sync occurs automatically when offers are created, updated, or deleted.
            <br />
            Manual sync may be needed if automatic sync fails or after database imports.
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Loading sync status...</div>
        </div>
      )}
    </div>
  );
};

export default SyncStatusComponent; 