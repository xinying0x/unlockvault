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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/activity');
        if (!response.ok) {
          throw new Error('Failed to fetch activity data');
        }
        const data = await response.json();
        setActivities(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setError('Failed to load activity data');
        setIsLoading(false);
      }
    };

    fetchActivities();
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
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-gray-400 text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-900/30">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Recent Activity</h2>
      {activities.length > 0 ? (
        <ul className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start space-x-3 bg-gray-800/50 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600/20 rounded-full text-lg">
                {getCountryFlag(activity.country)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </span>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    <span className="font-medium">Visitor from {getLocationDisplay(activity.country, activity.city)}</span>
                    {' '}unlocked{' '}
                    <span className="text-purple-300">{activity.tool}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-gray-500 text-xs">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>IP: {maskIP(activity.ip)}</span>
                    {activity.deviceType && (
                      <span>• {activity.deviceType}</span>
                    )}
                    {activity.browser && (
                      <span>• {activity.browser}</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 text-4xl mb-2">📊</div>
          <p className="text-gray-400 text-sm sm:text-base">No recent activity to display</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;