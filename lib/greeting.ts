// lib/greeting.ts - Time-of-day greeting logic
// Pure functions - no storage, no side effects

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Returns the time-of-day label based on hour (0-23)
 * 5-11: morning, 12-16: afternoon, 17-20: evening, 21-4: night
 */
export function getTimeOfDay(hour: number = new Date().getHours()): TimeOfDay {
  if (hour >= 5 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 16) return 'afternoon';
  if (hour >= 17 && hour <= 20) return 'evening';
  return 'night';
}

/**
 * Returns greeting string for the given name and time of day
 */
export function getGreeting(name: string, tod: TimeOfDay = getTimeOfDay()): string {
  const part = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
  }[tod];
  return name ? `${part}, ${name}` : part;
}
