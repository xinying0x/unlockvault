import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  type: 'tool' | 'app' | 'game';
  category: string;
  slug: string;
  image: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "ابحث عن أدوات، تطبيقات، ألعاب...",
  onSearch,
  showSuggestions = true,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    if (!showSuggestions) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      setSuggestions(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = suggestions[selectedIndex];
          window.location.href = `/offers/${selected.slug}`;
        } else if (query.trim()) {
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    setQuery(suggestion.title);
    setShowDropdown(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tool': return '🔧';
      case 'app': return '📱';
      case 'game': return '🎮';
      default: return '📦';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tool': return 'text-blue-400';
      case 'app': return 'text-green-400';
      case 'game': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-12 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>

        {/* Loading/Clear Button */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowDropdown(false);
                if (onSearch) onSearch('');
              }}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <Link
                key={suggestion.id}
                href={`/${suggestion.type}s/${suggestion.slug}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  index === selectedIndex
                    ? 'bg-purple-600/30 border border-purple-500/50'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="w-10 h-10 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {suggestion.image ? (
                    <img
                      src={suggestion.image}
                      alt={suggestion.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {getTypeIcon(suggestion.type)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {suggestion.title}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className={getTypeColor(suggestion.type)}>
                      {getTypeIcon(suggestion.type)} {suggestion.type}
                    </span>
                    <span>•</span>
                    <span>{suggestion.category}</span>
                  </div>
                </div>

                <div className="text-gray-400">
                  →
                </div>
              </Link>
            ))}
          </div>

          {/* View All Results */}
          {query.trim() && (
            <div className="border-t border-gray-600 p-2">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="flex items-center justify-center gap-2 p-3 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 rounded-lg transition-all duration-200"
              >
                <span>🔍</span>
                <span>View all results for "{query}"</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {showDropdown && !isLoading && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl shadow-2xl z-50">
          <div className="p-6 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-gray-300 font-medium mb-1">No results found</div>
            <div className="text-gray-400 text-sm">
              Try different keywords or browse our categories
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 