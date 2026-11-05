// lib/tabs.ts - Tab operations requiring Chrome APIs
export { etld1, normalizeUrl, domainToColor } from './tabs-pure';

import { store, SavedSession } from './storage';
import { etld1, normalizeUrl } from './tabs-pure';
import dayjs from 'dayjs';

export async function groupTabsSimple(): Promise<void> {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // Bucket by eTLD+1
  const buckets = new Map<string, chrome.tabs.Tab[]>();
  const solo: chrome.tabs.Tab[] = [];

  for (const tab of tabs) {
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) continue;
    try {
      const host = new URL(tab.url).hostname;
      const domain = etld1(host);
      const list = buckets.get(domain) ?? [];
      list.push(tab);
      buckets.set(domain, list);
    } catch { continue; }
  }

  const grouped: chrome.tabs.Tab[] = [];
  for (const [, tabList] of buckets) {
    if (tabList.length >= 2) grouped.push(...tabList);
    else solo.push(...tabList);
  }

  // Create groups for domains with ≥2 tabs
  const domainGroups = new Map<string, number[]>();
  for (const tab of grouped) {
    if (!tab.url || !tab.id) continue;
    const host = new URL(tab.url).hostname;
    const domain = etld1(host);
    const ids = domainGroups.get(domain) ?? [];
    ids.push(tab.id);
    domainGroups.set(domain, ids);
  }

  for (const [, ids] of domainGroups) {
    await chrome.tabs.group({ tabIds: ids });
  }

  // Solo tabs grouped into "Misc" only if ≥3 solo
  if (solo.length >= 3) {
    const soloIds = solo.map(t => t.id!).filter(Boolean);
    const groupId = await chrome.tabs.group({ tabIds: soloIds });
    await chrome.tabGroups.update(groupId, { title: 'Misc' });
  }
}

export async function findDuplicateTabs(): Promise<Array<{ url: string; closeIds: number[] }>> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const urlMap = new Map<string, chrome.tabs.Tab[]>();

  for (const tab of tabs) {
    if (!tab.url || tab.url.startsWith('chrome://')) continue;
    const norm = normalizeUrl(tab.url);
    const list = urlMap.get(norm) ?? [];
    list.push(tab);
    urlMap.set(norm, list);
  }

  const result: Array<{ url: string; closeIds: number[] }> = [];
  for (const [url, tabList] of urlMap) {
    if (tabList.length < 2) continue;
    // Keep active tab or lowest-id tab; close the rest
    const keeper = tabList.find(t => t.active) ?? tabList.reduce((a, b) => (a.id! < b.id! ? a : b));
    const closeIds = tabList.filter(t => t.id !== keeper.id).map(t => t.id!);
    result.push({ url, closeIds });
  }
  return result;
}

export async function closeDuplicateTabs(closeIds: number[]): Promise<void> {
  if (closeIds.length > 0) await chrome.tabs.remove(closeIds);
}

export async function saveSession(name: string): Promise<void> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const session: SavedSession = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    tabs: tabs
      .filter(t => t.url && !t.url.startsWith('chrome://'))
      .map(t => ({ url: t.url!, title: t.title || t.url!, pinned: t.pinned ?? false })),
  };
  const sessions = await store.sessionsSaved.getValue();
  await store.sessionsSaved.setValue([session, ...sessions]);
}

export async function restoreSession(id: string): Promise<void> {
  const sessions = await store.sessionsSaved.getValue();
  const session = sessions.find(s => s.id === id);
  if (!session) return;
  const urls = session.tabs.map(t => t.url);
  await chrome.windows.create({ url: urls });
}

export async function deleteSession(id: string): Promise<void> {
  const sessions = await store.sessionsSaved.getValue();
  await store.sessionsSaved.setValue(sessions.filter(s => s.id !== id));
}

export async function renameSession(id: string, newName: string): Promise<void> {
  const sessions = await store.sessionsSaved.getValue();
  const updated = sessions.map(s => s.id === id ? { ...s, name: newName } : s);
  await store.sessionsSaved.setValue(updated);
}

export function defaultSessionName(): string {
  return `Session - ${dayjs().format('MMM D, h:mm A')}`;
}
