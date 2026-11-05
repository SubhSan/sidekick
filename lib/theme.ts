// lib/theme.ts - Theme resolution logic
import type { Theme, AutoThemeBy } from './storage';

/**
 * Resolves the effective theme ('light' | 'dark') from settings.
 * 'auto' uses system preference or time of day based on autoThemeBy.
 */
export function resolveTheme(theme: Theme, autoThemeBy: AutoThemeBy): 'light' | 'dark' {
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';

  // Auto mode
  if (autoThemeBy === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Time-based: dark before 7am and after 8pm
  const hour = new Date().getHours();
  return (hour < 7 || hour >= 20) ? 'dark' : 'light';
}
