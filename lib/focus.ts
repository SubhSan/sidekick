// lib/focus.ts - Daily focus expiration helpers
import dayjs from 'dayjs';
import type { FocusEntry } from './storage';

/**
 * Returns today's date in YYYY-MM-DD ISO format
 */
export function getTodayISO(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Returns true if the stored focus entry has expired (is from before today).
 * Yesterday's focus is shown as a placeholder for one day, then cleared.
 */
export function isFocusExpired(entry: FocusEntry | null): boolean {
  if (!entry) return true;
  return entry.dateISO < getTodayISO();
}
