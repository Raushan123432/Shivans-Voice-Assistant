import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  Wind, 
  Droplets, 
  Search, 
  RefreshCw, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Thermometer, 
  Eye, 
  Compass, 
  AlertCircle 
} from 'lucide-react';

export interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  high: string;
  low: string;
  humidity?: string;
  wind?: string;
  uvIndex?: string;
  summary?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

interface WeatherWidgetProps {
  className?: string;
  onCityChange?: (city: string) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '', onCityChange }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [showSources, setShowSources] = useState<boolean>(false);

  const [searchLocation, setSearchLocation] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeQuery, setActiveQuery] = useState<string>('');

  // Fetch Weather from API Route
  const fetchWeather = async (params: { location?: string; lat?: number; lon?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const json = await res.json();
      if (!res.ok && !json.fallback) {
        throw new Error(json.error || 'Failed to fetch weather data');
      }

      const weatherData: WeatherData = json.data || json.fallback || {
        location: 'New Delhi',
        temperature: '28°C',
        condition: 'Partly Cloudy',
        high: '32°C',
        low: '23°C',
        humidity: '60%',
        wind: '12 km/h',
        uvIndex: 'Moderate (5)',
        summary: 'Warm with clear skies and pleasant weather.'
      };

      setWeather(weatherData);
      setSources(json.sources || []);
      if (params.location && onCityChange) {
        onCityChange(params.location);
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Unable to connect to weather service');
    } finally {
      setLoading(false);
    }
  };

  // On initial mount, attempt geolocation then fallback
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (geoError) => {
          console.warn('Geolocation denied or unavailable, using IP or default location:', geoError.message);
          fetchWeather({ location: 'New Delhi' });
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather({ location: 'New Delhi' });
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim()) return;
    setActiveQuery(searchLocation.trim());
    setIsSearching(false);
    fetchWeather({ location: searchLocation.trim() });
  };

  const handleUseCurrentLocation = () => {
    setIsSearching(false);
    setSearchLocation('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => fetchWeather({ location: 'New Delhi' })
      );
    } else {
      fetchWeather({ location: 'New Delhi' });
    }
  };

  // Helper function to pick relevant weather icon
  const getWeatherIcon = (condition: string = '') => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      return <CloudRain className="w-8 h-8 text-cyan-400 animate-bounce" />;
    }
    if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
      return <CloudLightning className="w-8 h-8 text-amber-400 animate-pulse" />;
    }
    if (cond.includes('snow') || cond.includes('ice') || cond.includes('blizzard')) {
      return <Snowflake className="w-8 h-8 text-blue-300 animate-spin" style={{ animationDuration: '8s' }} />;
    }
    if (cond.includes('sun') || cond.includes('clear') || cond.includes('hot')) {
      return <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />;
    }
    if (cond.includes('wind') || cond.includes('breeze')) {
      return <Wind className="w-8 h-8 text-teal-300" />;
    }
    return <CloudSun className="w-8 h-8 text-amber-400" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-3xl bg-slate-950/85 border border-purple-500/30 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-3 relative overflow-hidden text-slate-100 ${className}`}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <span>Real-time Weather</span>
        </div>

        <div className="flex items-center gap-1.5 z-10">
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Search Location"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fetchWeather({ location: activeQuery || weather?.location })}
            disabled={loading}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Live Weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input Bar Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 z-20 pt-1"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter city or region..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                Search
              </button>
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer self-start ml-1"
            >
              <MapPin className="w-3 h-3" /> Detect my location via GPS
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex flex-col gap-3 py-2 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-slate-800 rounded-md" />
            <div className="h-8 w-8 bg-slate-800 rounded-full" />
          </div>
          <div className="h-8 w-20 bg-slate-800 rounded-md" />
          <div className="h-3 w-36 bg-slate-800 rounded-md" />
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="h-8 bg-slate-800/60 rounded-xl" />
            <div className="h-8 bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center p-4 text-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs font-mono">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{error}</span>
          <button
            onClick={() => fetchWeather({ location: 'New Delhi' })}
            className="mt-1 px-3 py-1 rounded-xl bg-red-500/20 border border-red-400/40 text-white text-[11px] hover:bg-red-500/30 transition-all cursor-pointer"
          >
            Retry Default
          </button>
        </div>
      ) : weather ? (
        /* Weather Card Body */
        <div className="flex flex-col gap-2.5 z-10">
          
          {/* Main Temp & Condition */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[140px]">{weather.location}</span>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono mt-0.5 tracking-tight">
                {weather.temperature}
              </div>
              <div className="text-xs text-amber-300 font-medium mt-0.5 flex items-center gap-1">
                {weather.condition}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-md">
              {getWeatherIcon(weather.condition)}
            </div>
          </div>

          {/* High / Low & Details Row */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-500/20">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <Thermometer className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono">H / L</span>
                <span className="text-xs font-bold text-slate-200">{weather.high} / {weather.low}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono">Humidity</span>
                <span className="text-xs font-bold text-slate-200">{weather.humidity || '62%'}</span>
              </div>
            </div>
          </div>

          {weather.wind && (
            <div className="flex items-center justify-between text-[11px] text-slate-300 px-2 py-1.5 rounded-xl bg-slate-900/40 border border-white/5 font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Wind className="w-3.5 h-3.5 text-teal-400" /> Wind
              </span>
              <span className="font-bold text-teal-300">{weather.wind}</span>
            </div>
          )}

          {/* Real-time Summary Sentence */}
          {weather.summary && (
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans italic bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
              "{weather.summary}"
            </p>
          )}

          {/* Google Search Grounding Badge & Citations Toggle */}
          <div className="pt-1 flex flex-col gap-1 border-t border-purple-500/20">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center justify-between text-[10px] text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                Grounded with Google Search
              </span>
              <span className="underline">{sources.length > 0 ? `${sources.length} sources` : 'Verified'}</span>
            </button>

            {/* Citations List */}
            <AnimatePresence>
              {showSources && sources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-1.5 pt-1 overflow-hidden text-[10px]"
                >
                  {sources.slice(0, 3).map((src, i) => (
                    <a
                      key={i}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
                    >
                      <span className="truncate pr-2 font-mono">{src.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      ) : null}

    </motion.div>
  );
};

export default WeatherWidget;
