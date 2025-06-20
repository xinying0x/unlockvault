import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: 'view' | 'unlock' | 'new_offer' | 'user_signup';
  country: string;
  city: string;
  tool: string;
  timestamp: Date;
  ip: string;
  deviceType: string;
  browser: string;
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchActivities = async () => {
    try {
      setError(null);
      const response = await fetch('/api/activity');
      if (!response.ok) {
        throw new Error('Failed to fetch activity data');
      }
      const data = await response.json();
      setActivities(data);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setError('Failed to load activity data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchActivities();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

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

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'Australia': '🇦🇺',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'Argentina': '🇦🇷',
      'Russia': '🇷🇺',
      'Turkey': '🇹🇷',
      'Saudi Arabia': '🇸🇦',
      'Egypt': '🇪🇬',
      'UAE': '🇦🇪',
      'Morocco': '🇲🇦',
      'Algeria': '🇩🇿',
      'Tunisia': '🇹🇳',
      'Jordan': '🇯🇴',
      'Lebanon': '🇱🇧',
      'Iraq': '🇮🇶',
      'Syria': '🇸🇾',
      'Palestine': '🇵🇸',
      'Kuwait': '🇰🇼',
      'Bahrain': '🇧🇭',
      'Qatar': '🇶🇦',
      'Oman': '🇴🇲',
      'Yemen': '🇾🇪'
    };
    return flags[country] || '🌍';
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const maskIP = (ip: string) => {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.**`;
    }
    return ip.substring(0, ip.length - 4) + '****';
  };

  const getLocationDisplay = (country: string, city?: string) => {
    const flag = getCountryFlag(country);
    return `${flag} ${country}`;
  };

  if (isLoading) {
    return (
      <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30 h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading recent activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-gray-400 text-sm sm:text-base mb-3">{error}</p>
          <button 
            onClick={fetchActivities}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span className="animate-pulse">🔴</span>
          Live Activity
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Last update: {formatTimestamp(lastUpdate)}</span>
          <button 
            onClick={fetchActivities}
            className="p-1 hover:bg-gray-700/50 rounded transition-all"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>
      
      {activities.length > 0 ? (
        <ul className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {activities.map((activity, index) => (
            <li 
              key={activity.id} 
              className="flex items-start space-x-3 bg-gray-800/50 p-2 sm:p-3 rounded-lg hover:bg-gray-800/70 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600/20 rounded-full text-lg border border-purple-500/30 flex-shrink-0">
                {getCountryFlag(activity.country)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </span>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    <span className="font-medium text-white">Visitor from {getLocationDisplay(activity.country, activity.city)}</span>
                    {' opened '}
                    <span className="text-purple-300 font-semibold">{activity.tool}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <p className="text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                  <div className="flex items-center space-x-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      🌐 {maskIP(activity.ip)}
                    </span>
                    {activity.deviceType && (
                      <span className="flex items-center gap-1">
                        {activity.deviceType === 'mobile' ? '📱' : activity.deviceType === 'tablet' ? '📟' : '💻'}
                        {activity.deviceType}
                      </span>
                    )}
                    {activity.browser && (
                      <span className="flex items-center gap-1">
                        🌏 {activity.browser}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 text-4xl mb-2 animate-pulse">📊</div>
          <p className="text-gray-400 text-sm sm:text-base">No recent activity to display</p>
          <p className="text-gray-500 text-xs mt-1">Activity will appear here when users visit the offers</p>
        </div>
      )}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ActivityFeed;