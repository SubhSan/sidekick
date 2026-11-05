import { describe, it, expect } from 'vitest';
import { etld1, normalizeUrl, domainToColor } from '../lib/tabs-pure';
import { splitTasksSimple, hasSplitTrigger, pruneTasks } from '../lib/tasks-pure';
import { getWmoEntry, adviceFor, celsiusToFahrenheit, formatTemp } from '../lib/weather-pure';
import { autoTagUrl } from '../lib/bookmarks-pure';
import { getTimeOfDay, getGreeting } from '../lib/greeting';
import { isFocusExpired } from '../lib/focus';
import dayjs from 'dayjs';

describe('tabs-pure', () => {
  it('extracts etld1 correctly', () => {
    expect(etld1('github.com')).toBe('github.com');
    expect(etld1('sub.domain.github.com')).toBe('github.com');
    expect(etld1('bbc.co.uk')).toBe('bbc.co.uk');
  });

  it('normalizes URLs by stripping utm params, hashes, trailing slashes', () => {
    expect(normalizeUrl('https://example.com/path/?utm_source=twitter&utm_medium=social#section'))
      .toBe('https://example.com/path');
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
  });

  it('generates consistent domain hues', () => {
    const hue1 = domainToColor('google.com');
    const hue2 = domainToColor('google.com');
    expect(hue1).toBe(hue2);
    expect(hue1).toBeGreaterThanOrEqual(0);
    expect(hue1).toBeLessThanOrEqual(360);
  });
});

describe('tasks-pure', () => {
  it('splits tasks with multiple triggers', () => {
    const raw = 'Buy groceries and Cook dinner and Wash the dishes';
    const split = splitTasksSimple(raw);
    expect(split.length).toBeGreaterThanOrEqual(2);
  });

  it('detects split trigger', () => {
    expect(hasSplitTrigger('item 1\nitem 2')).toBe(true);
    expect(hasSplitTrigger('single item')).toBe(false);
  });

  it('prunes tasks completed over 7 days ago', () => {
    const eightDaysAgo = dayjs().subtract(8, 'day').valueOf();
    const oneDayAgo = dayjs().subtract(1, 'day').valueOf();
    const tasks = [
      { id: '1', text: 'Old completed', done: true, completedAt: eightDaysAgo, createdAt: eightDaysAgo },
      { id: '2', text: 'Recent completed', done: true, completedAt: oneDayAgo, createdAt: oneDayAgo },
      { id: '3', text: 'Unfinished', done: false, createdAt: eightDaysAgo },
    ];
    const pruned = pruneTasks(tasks);
    expect(pruned.map(t => t.id)).toEqual(['2', '3']);
  });
});

describe('weather-pure', () => {
  it('maps WMO codes to descriptions', () => {
    const clear = getWmoEntry(0);
    expect(clear.label.toLowerCase()).toContain('clear');
    const rain = getWmoEntry(63);
    expect(rain.label.toLowerCase()).toContain('rain');
  });

  it('converts temperature and formats units', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(formatTemp(21.4, 'c')).toBe('21°C');
    expect(formatTemp(21.4, 'f')).toBe('71°F');
  });
});

describe('bookmarks-pure', () => {
  it('auto-tags URLs intelligently', () => {
    const tags = autoTagUrl('https://github.com/facebook/react');
    expect(tags.length).toBeGreaterThan(0);
  });
});

describe('greeting & focus', () => {
  it('computes time of day and greeting', () => {
    expect(getTimeOfDay(8)).toBe('morning');
    expect(getGreeting('Alice', 'morning')).toContain('morning');
    expect(getGreeting('Alice', 'morning')).toContain('Alice');
  });

  it('determines focus expiration', () => {
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');
    expect(isFocusExpired({ text: 'Test', dateISO: yesterday })).toBe(true);
    expect(isFocusExpired({ text: 'Test', dateISO: today })).toBe(false);
  });
});
