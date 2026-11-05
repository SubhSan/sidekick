// lib/weather.ts - Weather API client and caching
export { getWmoEntry, adviceFor, celsiusToFahrenheit, formatTemp, WMO_MAP } from './weather-pure';
export type { CurrentWeather, DailyWeather, WeatherData, WmoEntry } from './weather-pure';

import { store } from './storage';
import type { WeatherData } from './weather-pure';

const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetches fresh weather data from Open-Meteo for given coordinates.
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,is_day',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
  });
  const res = await fetch(`${WEATHER_API_URL}?${params}`);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const json = await res.json();
  return {
    current: json.current,
    daily: json.daily,
  };
}

/**
 * Returns cached weather if fresh (<30 min old), otherwise fetches and updates cache.
 * On network failure with stale cache: returns { data, stale: true }.
 */
export async function getCachedWeather(lat: number, lon: number): Promise<{ data: WeatherData; stale: boolean }> {
  const cached = await store.weatherCache.getValue();
  const now = Date.now();

  if (cached && (now - cached.fetchedAt) < WEATHER_CACHE_TTL) {
    return { data: cached.data as WeatherData, stale: false };
  }

  try {
    const data = await fetchWeather(lat, lon);
    await store.weatherCache.setValue({ data, fetchedAt: now });
    return { data, stale: false };
  } catch {
    if (cached) {
      return { data: cached.data as WeatherData, stale: true };
    }
    throw new Error('No weather data available');
  }
}

/**
 * Bypasses TTL check, always fetches fresh data. Falls back to stale cache on error.
 */
export async function forceRefreshWeather(lat: number, lon: number): Promise<{ data: WeatherData; stale: boolean }> {
  try {
    const data = await fetchWeather(lat, lon);
    await store.weatherCache.setValue({ data, fetchedAt: Date.now() });
    return { data, stale: false };
  } catch {
    const cached = await store.weatherCache.getValue();
    if (cached) return { data: cached.data as WeatherData, stale: true };
    throw new Error('No weather data available and fetch failed');
  }
}

export interface GeocodedCity {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

/**
 * Searches for cities by name using Open-Meteo geocoding API.
 */
export async function geocodeCity(city: string): Promise<GeocodedCity[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5`
  );
  if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
  const json = await res.json();
  return json.results ?? [];
}
