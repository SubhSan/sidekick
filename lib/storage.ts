import { storage } from 'wxt/utils/storage';

// Types
export type Theme = 'light' | 'dark' | 'auto';
export type AutoThemeBy = 'system' | 'time';
export type SearchEngine = 'google' | 'duckduckgo' | 'bing';
export type TempUnit = 'c' | 'f';
export type WallpaperMode = 'fixed' | 'custom' | 'weather' | 'daily';

export interface Settings {
  name: string;
  theme: Theme;
  autoThemeBy: AutoThemeBy;
  aiMode: boolean;
  searchEngine: SearchEngine;
  tabNudgeThreshold: number;
  weather: { unit: TempUnit; lat?: number; lon?: number; place?: string };
  wallpaper: { mode: WallpaperMode; fixedId?: string; customId?: string };
  onboardingDone: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  name: '', theme: 'auto', autoThemeBy: 'system', aiMode: false,
  searchEngine: 'google', tabNudgeThreshold: 20,
  weather: { unit: 'c' },
  wallpaper: { mode: 'weather' },
  onboardingDone: false,
};

export interface Task { id: string; text: string; done: boolean; createdAt: number; }
export interface SavedSession { id: string; name: string; createdAt: number; tabs: Array<{ url: string; title: string; pinned: boolean }>; }
export interface ReadLaterItem { id: string; url: string; title: string; favicon: string; excerpt: string; addedAt: number; source: 'simple' | 'ai'; }
export interface FocusEntry { text: string; dateISO: string; }
export interface WeatherCache { data: unknown; fetchedAt: number; }
export interface PomodoroState {
  status: 'idle' | 'running' | 'paused';
  mode: 'work' | 'break' | 'longBreak';
  workDuration: number;
  breakDuration: number;
  longBreakDuration?: number;
  endTime?: number;
  timeLeft?: number;
  completedToday: number;
  lastDate: string;
  monthHistory?: Record<string, number>; // "YYYY-MM-DD" -> count
}

export const DEFAULT_POMODORO: PomodoroState = {
  status: 'idle',
  mode: 'work',
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  completedToday: 0,
  lastDate: '',
  monthHistory: {},
};

export const store = {
  settings:     storage.defineItem<Settings>('local:settings', { fallback: DEFAULT_SETTINGS }),
  groqKey:      storage.defineItem<string>('local:groqKey', { fallback: '' }),  // NEVER sync
  focus:        storage.defineItem<FocusEntry | null>('local:focus', { fallback: null }),
  tasks:        storage.defineItem<Task[]>('local:tasks', { fallback: [] }),
  blocklist:    storage.defineItem<string[]>('local:blocklist', { fallback: [] }),
  focusModeOn:  storage.defineItem<boolean>('local:focusModeOn', { fallback: false }),
  sessionsSaved: storage.defineItem<SavedSession[]>('local:sessionsSaved', { fallback: [] }),
  bookmarkTags: storage.defineItem<Record<string, string[]>>('local:bookmarkTags', { fallback: {} }),
  bookmarkOrder: storage.defineItem<Record<string, string[]>>('local:bookmarkOrder', { fallback: {} }),
  readLater:    storage.defineItem<ReadLaterItem[]>('local:readLater', { fallback: [] }),
  jargonCache:  storage.defineItem<Record<string, { def: string; at: number }>>('local:jargonCache', { fallback: {} }),
  weatherCache: storage.defineItem<WeatherCache | null>('local:weatherCache', { fallback: null }),
  pomodoro:     storage.defineItem<PomodoroState>('local:pomodoro', { fallback: DEFAULT_POMODORO }),
};
