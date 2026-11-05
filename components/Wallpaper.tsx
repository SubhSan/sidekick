import React, { useEffect, useState } from 'react';
import { store } from '../lib/storage';
import { getCustomWallpaper, isVideoType } from '../lib/wallpaper';
import type { WeatherData } from '../lib/storage';
import {
  RainBackground, ThunderBackground, DrizzleBackground, SnowBackground,
  CloudyBackground, FogBackground, ClearDayBackground, ClearNightBackground
} from './WeatherBackgrounds';

type WeatherScene = 'clear-day' | 'clear-night' | 'cloudy-day' | 'cloudy-night' | 'rain' | 'drizzle-day' | 'drizzle-night' | 'snow' | 'thunder' | 'fog-day' | 'fog-night';

export const WALLPAPER_PRESETS = [
  { id: 'starfield', label: 'Starfield', gradient: '#000000' },
  { id: 'aurora', label: 'Aurora', gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 'sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb, #f5576c, #fda085)' },
  { id: 'ocean', label: 'Ocean', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'forest', label: 'Forest', gradient: 'linear-gradient(135deg, #134e5e, #71b280)' },
  { id: 'midnight', label: 'Midnight', gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { id: 'peach', label: 'Peach', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
  { id: 'fire', label: 'Fire', gradient: 'linear-gradient(135deg, #f12711, #f5af19)' },
  { id: 'lavender', label: 'Lavender', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { id: 'slate', label: 'Slate', gradient: 'linear-gradient(135deg, #1e3c72, #2a5298)' },
  { id: 'emerald', label: 'Emerald', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
];

const SCENE_BACKGROUNDS: Record<WeatherScene, string> = {
  'clear-day': 'linear-gradient(180deg, #0a3d6b 0%, #1a6fad 20%, #4fa3d1 50%, #f5c97a 80%, #f4845f 100%)',
  'clear-night': 'linear-gradient(180deg, #000005 0%, #06091a 40%, #0d1433 70%, #1a1040 100%)',
  'cloudy-day': 'linear-gradient(180deg, #2c3e50 0%, #485563 30%, #7f8c8d 65%, #b8c6cb 100%)',
  'cloudy-night': 'linear-gradient(180deg, #050810 0%, #0f1520 35%, #1c2535 65%, #2a3545 100%)',
  'rain': 'linear-gradient(180deg, #0a0e18 0%, #141d2e 25%, #1e2d44 55%, #2e3f55 80%, #3a4f63 100%)',
  'drizzle-day': 'linear-gradient(180deg, #1e2a3a 0%, #2d3f52 30%, #4a5f72 60%, #6b7f8f 100%)',
  'drizzle-night': 'linear-gradient(180deg, #060a12 0%, #0e1520 35%, #1a2535 65%, #253040 100%)',
  'snow': 'linear-gradient(180deg, #c5d5e8 0%, #d8e4f0 30%, #e8eff7 60%, #f4f8fc 85%, #ffffff 100%)',
  'thunder': 'linear-gradient(180deg, #030508 0%, #0a0f1a 25%, #111926 50%, #1a2535 75%, #0f1e30 100%)',
  'fog-day': 'linear-gradient(180deg, #8a9bb0 0%, #a8b8c8 30%, #c2d0da 60%, #d8e4ec 85%, #e8f0f5 100%)',
  'fog-night': 'linear-gradient(180deg, #0a0d15 0%, #141c28 30%, #1e2a3a 60%, #2a3848 100%)',
};

export function getWeatherScene(code: number, isDay: boolean): WeatherScene {
  if ([95, 96, 99].includes(code)) return 'thunder';
  if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(code)) return 'snow';
  if ([61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
  if ([51, 53, 55].includes(code)) return isDay ? 'drizzle-day' : 'drizzle-night';
  if ([45, 48].includes(code)) return isDay ? 'fog-day' : 'fog-night';
  if ([2, 3].includes(code)) return isDay ? 'cloudy-day' : 'cloudy-night';
  return isDay ? 'clear-day' : 'clear-night';
}

function WeatherBackground({ code, isDay }: { code: number; isDay: boolean }) {
  const scene = getWeatherScene(code, isDay);
  const isDarkScene = ['clear-night', 'cloudy-night', 'drizzle-night', 'fog-night', 'rain', 'thunder'].includes(scene);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: SCENE_BACKGROUNDS[scene] }}>
      {scene === 'rain' && <RainBackground heavy={false} />}
      {scene === 'thunder' && <ThunderBackground />}
      {(scene === 'drizzle-day' || scene === 'drizzle-night') && <DrizzleBackground />}
      {scene === 'snow' && <SnowBackground />}
      {(scene === 'cloudy-day' || scene === 'cloudy-night') && <CloudyBackground dark={scene === 'cloudy-night'} />}
      {(scene === 'fog-day' || scene === 'fog-night') && <CloudyBackground dark={scene === 'fog-night'} />}
      {(scene === 'fog-day' || scene === 'fog-night') && <FogBackground dark={scene === 'fog-night'} />}
      {scene === 'clear-day' && <ClearDayBackground />}
      {scene === 'clear-night' && <ClearNightBackground />}
      {!isDarkScene && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />
      )}
    </div>
  );
}

export function Wallpaper() {
  const [mode, setMode] = useState<'fixed' | 'custom' | 'weather' | 'daily'>('weather');
  const [fixedId, setFixedId] = useState('starfield');
  const [customId, setCustomId] = useState<string | null>(null);
  
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blobType, setBlobType] = useState<string>('');
  
  const [dailyUrl, setDailyUrl] = useState<string | null>(null);
  const [dailyOpacity, setDailyOpacity] = useState(0);

  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [isDay, setIsDay] = useState<boolean>(true);

  // Settings watcher
  useEffect(() => {
    store.settings.getValue().then((settings) => {
      setMode(settings.wallpaper.mode);
      setFixedId(settings.wallpaper.fixedId);
      setCustomId(settings.wallpaper.customId);
    });
    const unwatch = store.settings.watch((settings) => {
      if (settings) {
        setMode(settings.wallpaper.mode);
        setFixedId(settings.wallpaper.fixedId);
        setCustomId(settings.wallpaper.customId);
      }
    });
    return () => { unwatch(); };
  }, []);

  // Daily Wallpaper loader
  useEffect(() => {
    if (mode === 'daily') {
      import('../lib/daily-wallpaper').then(({ getDailyWallpaperUrl, preloadImage }) => {
        getDailyWallpaperUrl().then(async (url) => {
          if (url) {
            await preloadImage(url).catch(() => {});
            setDailyUrl(url);
            requestAnimationFrame(() => setDailyOpacity(1));
          }
        });
      });
    } else {
      setDailyOpacity(0);
    }
  }, [mode]);

  // Custom Blob loader
  useEffect(() => {
    if (mode === 'custom' && customId) {
      getCustomWallpaper(customId).then(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setBlobType(blob.type);
        }
      });
    }
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [mode, customId]);

  // Weather Cache watcher
  useEffect(() => {
    if (mode !== 'weather') return;
    store.weatherCache.getValue().then((cache) => {
      if (cache?.data) {
        const data = cache.data as WeatherData;
        setWeatherCode(data.current?.weather_code ?? 0);
        setIsDay(data.current?.is_day !== 0);
      }
    });
    const unwatch = store.weatherCache.watch((cache) => {
      if (cache?.data) {
        const data = cache.data as WeatherData;
        setWeatherCode(data.current?.weather_code ?? 0);
        setIsDay(data.current?.is_day !== 0);
      }
    });
    return () => { unwatch(); };
  }, [mode]);

  return (
    <div className="fixed inset-0 -z-10 bg-[var(--bg)]">
      {mode === 'fixed' && (
        <div className="absolute inset-0" style={{ background: WALLPAPER_PRESETS.find(p => p.id === fixedId)?.gradient || '#000000' }}>
          {fixedId === 'starfield' && <ClearNightBackground />}
        </div>
      )}
      
      {mode === 'custom' && blobUrl && (
        isVideoType(blobType) ? (
          <video src={blobUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${blobUrl})` }} />
        )
      )}

      {mode === 'daily' && dailyUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url("${dailyUrl}")`,
            opacity: dailyOpacity,
          }}
        />
      )}

      {mode === 'weather' && (
        <WeatherBackground code={weatherCode ?? 0} isDay={isDay} />
      )}
    </div>
  );
}
