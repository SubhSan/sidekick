import React, { useState, useEffect } from 'react';
import { store } from '../lib/storage';
import { getTodayISO, isFocusExpired } from '../lib/focus';
import type { FocusEntry } from '../lib/storage';

export function DailyFocus() {
  const [focus, setFocus] = useState('');
  const [placeholder, setPlaceholder] = useState('What is your main focus for today?');

  useEffect(() => {
    store.focus.getValue().then((entry) => {
      if (entry) {
        if (!isFocusExpired(entry)) {
          setFocus(entry.text);
        } else {
          // It's from yesterday (or earlier). Set it as placeholder temporarily.
          setPlaceholder(`Yesterday: ${entry.text}`);
        }
      }
    });

    const unwatch = store.focus.watch((entry) => {
      if (entry && !isFocusExpired(entry)) {
        setFocus(entry.text);
      }
    });

    return () => {
      unwatch();
    };
  }, []);

  const saveFocus = async () => {
    const trimmed = focus.trim();
    if (trimmed) {
      await store.focus.setValue({ text: trimmed, dateISO: getTodayISO() });
    } else {
      await store.focus.removeValue();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveFocus();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <input
        type="text"
        className="w-full bg-transparent border-b-2 border-[var(--muted)] focus:border-[var(--fg)] outline-none text-center text-xl md:text-2xl py-2 transition-colors placeholder:text-[var(--muted)] text-[var(--fg)]"
        placeholder={placeholder}
        value={focus}
        onChange={(e) => setFocus(e.target.value)}
        onBlur={saveFocus}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
