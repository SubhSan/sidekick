import React, { useState, useEffect } from 'react';
import { store } from '../lib/storage';
import { getCachedWeather, forceRefreshWeather, geocodeCity, GeocodedCity } from '../lib/weather';
import { getWmoEntry, adviceFor, formatTemp, WeatherData } from '../lib/weather-pure';
import {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain,
  CloudSnow, CloudLightning, Snowflake, WifiOff, MapPin, Search, Loader2
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<any>> = {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Snowflake
};

type State =
  | { phase: 'idle' }
  | { phase: 'requesting' }
  | { phase: 'city-search' }
  | { phase: 'loaded'; data: WeatherData; stale: boolean }
  | { phase: 'error'; message: string };

export function WeatherCard() {
  const [state, setState] = useState<State>({ phase: 'idle' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedCity[]>([]);
  const [unit, setUnit] = useState<'c' | 'f'>('c');

  useEffect(() => {
    store.settings.getValue().then((settings) => {
      setUnit(settings.weather.unit);
      if (settings.weather.lat !== undefined && settings.weather.lon !== undefined) {
        loadWeather(settings.weather.lat, settings.weather.lon, settings.weather.place);
      }
    });
  }, []);

  async function loadWeather(lat: number, lon: number, placeName?: string) {
    setState({ phase: 'requesting' });
    try {
      const res = await getCachedWeather(lat, lon);
      setState({ phase: 'loaded', data: { ...res.data, placeName }, stale: res.stale });
    } catch (err: any) {
      setState({ phase: 'error', message: err.message });
    }
  }

  async function handleEnable() {
    setState({ phase: 'requesting' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const json = await res.json();
          const place = `${json.city || json.locality}, ${json.countryCode}`;
          const settings = await store.settings.getValue();
          await store.settings.setValue({
            ...settings,
            weather: { ...settings.weather, lat, lon, place }
          });
          await loadWeather(lat, lon, place);
        } catch {
          await loadWeather(lat, lon);
        }
      },
      () => {
        setState({ phase: 'city-search' });
      },
      { timeout: 10000 }
    );
  }

  async function doSearch() {
    if (!searchQuery.trim()) return;
    try {
      const res = await geocodeCity(searchQuery);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    }
  }

  async function selectCity(city: GeocodedCity) {
    const place = `${city.name}, ${city.country}`;
    const settings = await store.settings.getValue();
    await store.settings.setValue({
      ...settings,
      weather: { ...settings.weather, lat: city.latitude, lon: city.longitude, place }
    });
    await loadWeather(city.latitude, city.longitude, place);
  }

  async function handleRefresh() {
    const settings = await store.settings.getValue();
    if (settings.weather.lat !== undefined && settings.weather.lon !== undefined) {
      setState({ phase: 'requesting' });
      try {
        const res = await forceRefreshWeather(settings.weather.lat, settings.weather.lon);
        setState({ phase: 'loaded', data: { ...res.data, placeName: settings.weather.place }, stale: res.stale });
      } catch (err: any) {
        setState({ phase: 'error', message: err.message });
      }
    }
  }

  async function toggleUnit() {
    const next = unit === 'c' ? 'f' : 'c';
    setUnit(next);
    const settings = await store.settings.getValue();
    await store.settings.setValue({ ...settings, weather: { ...settings.weather, unit: next } });
  }

  return (
    <div className="absolute bottom-12 right-12 w-80 p-6 rounded-3xl text-[var(--fg)] flex flex-col gap-4 shadow-xl border border-[var(--border)] transition-all"
         style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))', WebkitBackdropFilter: 'blur(var(--glass-blur))' }}>
      
      {state.phase === 'idle' && (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-4">
          <CloudSun size={32} className="opacity-70" />
          <p className="text-sm opacity-80">Enable location for weather forecast.</p>
          <button onClick={handleEnable} className="px-4 py-2 bg-[var(--accent)] text-white rounded-full hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium">
            Enable Weather
          </button>
        </div>
      )}

      {state.phase === 'requesting' && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="animate-spin opacity-70" size={24} />
        </div>
      )}

      {state.phase === 'city-search' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Search Location</p>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-black/10 border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)] transition-colors" 
              placeholder="e.g. London" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            <button onClick={doSearch} className="p-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"><Search size={16}/></button>
          </div>
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto mt-2">
              {searchResults.map((c, i) => (
                <button key={i} onClick={() => selectCity(c)} className="text-left px-3 py-2 text-sm hover:bg-black/5 rounded-lg transition-colors truncate">
                  {c.name}, {c.country}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {state.phase === 'error' && (
        <div className="flex flex-col gap-2 text-center py-4 text-red-400">
          <p className="text-sm font-medium">Failed to load weather.</p>
          <p className="text-xs opacity-70">{state.message}</p>
          <button onClick={() => setState({ phase: 'idle' })} className="mt-3 text-xs underline opacity-80 hover:opacity-100">Retry</button>
        </div>
      )}

      {state.phase === 'loaded' && (
        <>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 opacity-70 text-xs">
                <MapPin size={12} />
                <span className="truncate max-w-[140px] cursor-pointer hover:underline" onClick={() => setState({ phase: 'city-search' })}>
                  {state.data.placeName || 'Unknown Location'}
                </span>
                {state.stale && <WifiOff size={12} className="text-red-400 ml-1" title="Offline - Showing cached data" />}
              </div>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-4xl font-light tracking-tighter cursor-pointer hover:opacity-80 transition-opacity" onClick={handleRefresh} title="Click to refresh">
                  {formatTemp(state.data.current.temperature_2m, unit)}
                </span>
              </div>
              <div className="text-[11px] opacity-70 mt-1 flex gap-1.5 items-center cursor-pointer hover:opacity-100 transition-opacity" onClick={toggleUnit} title="Toggle unit">
                <span>Feels like {formatTemp(state.data.current.apparent_temperature, unit)}</span>
                <span>•</span>
                <span>H: {formatTemp(state.data.daily.temperature_2m_max[0], unit)}</span>
                <span>L: {formatTemp(state.data.daily.temperature_2m_min[0], unit)}</span>
              </div>
            </div>
            {(() => {
              const entry = getWmoEntry(state.data.current.weather_code);
              const Icon = ICON_MAP[entry.iconName] || Cloud;
              return (
                <div className="flex flex-col items-center">
                  <Icon size={36} className="opacity-90 drop-shadow-md text-[var(--accent)]" />
                  <span className="text-[10px] opacity-70 mt-1 font-medium">{entry.label}</span>
                </div>
              );
            })()}
          </div>
          <div className="mt-2 text-sm opacity-90 leading-snug border-t border-[var(--border)] pt-3 font-medium">
            {adviceFor(state.data.current, state.data.daily)}
          </div>
        </>
      )}
    </div>
  );
}
