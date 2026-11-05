// lib/daily-wallpaper.ts - Fetches & caches daily background image from external provider

export interface DailyImageCache {
  dateISO: string;
  imageUrl: string;
  credit?: string;
}

const STORAGE_KEY = 'sidekick_daily_wallpaper';

/**
 * Fetches the daily image URL (e.g. Bing Daily Photo / Unsplash Daily)
 * and caches it in localStorage for the current date.
 */
export async function getDailyWallpaperUrl(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // 1. Check local cache first
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed: DailyImageCache = JSON.parse(cached);
      if (parsed.dateISO === today && parsed.imageUrl) {
        return parsed.imageUrl;
      }
    }
  } catch (e) {
    console.warn('Could not read wallpaper cache:', e);
  }

  // 2. Fetch fresh daily image from external provider
  let imageUrl = '';
  try {
    // Bing Daily Image JSON endpoint
    const response = await fetch(
      'https://api.allorigins.win/raw?url=' +
        encodeURIComponent('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US')
    );
    const data = await response.json();
    if (data?.images?.[0]?.url) {
      imageUrl = `https://www.bing.com${data.images[0].url}`;
    }
  } catch {
    // Fallback: High-res Nature daily image
    imageUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80';
  }

  // 3. Cache for today
  if (imageUrl) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dateISO: today, imageUrl }));
    } catch { /* ignore */ }
  }

  return imageUrl;
}

/**
 * Preloads an image in memory so it renders smoothly without flashing
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
  });
}

/**
 * Applies the daily image smoothly to the target element (body or container) with CSS fade transition
 */
export async function applyDailyBackgroundSmoothly(targetElement: HTMLElement = document.body) {
  try {
    const imageUrl = await getDailyWallpaperUrl();
    if (!imageUrl) return;

    await preloadImage(imageUrl);

    targetElement.style.transition = 'background-image 0.8s ease-in-out, background-color 0.8s ease';
    targetElement.style.backgroundSize = 'cover';
    targetElement.style.backgroundPosition = 'center';
    targetElement.style.backgroundRepeat = 'no-repeat';
    targetElement.style.backgroundAttachment = 'fixed';
    targetElement.style.backgroundImage = `url("${imageUrl}")`;
  } catch (err) {
    console.error('Failed to apply daily background:', err);
  }
}
