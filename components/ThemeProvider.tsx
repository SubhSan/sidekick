import React, { useEffect } from 'react';
import { store } from '../lib/storage';
import { resolveTheme } from '../lib/theme';
import type { Settings } from '../lib/storage';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let unwatch: (() => void) | undefined;

    // Apply theme function
    const applyTheme = (settings: Settings) => {
      const theme = resolveTheme(settings.theme, settings.autoThemeBy);
      document.documentElement.setAttribute('data-theme', theme);
    };

    // Initial load
    store.settings.getValue().then((settings) => {
      applyTheme(settings);
    });

    // Watch for changes
    unwatch = store.settings.watch((newSettings) => {
      if (newSettings) applyTheme(newSettings);
    });

    // Clean up watcher
    return () => {
      if (unwatch) unwatch();
    };
  }, []);

  return <>{children}</>;
}
