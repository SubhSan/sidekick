// lib/readlater.ts - Read later storage operations
import { store } from './storage';
import type { ReadLaterItem } from './storage';

export async function getReadLater(): Promise<ReadLaterItem[]> {
  const items = await store.readLater.getValue();
  // Sort: unread (positive addedAt) first by newest, then read (negative addedAt) at bottom
  return items.sort((a, b) => {
    const aRead = a.addedAt < 0;
    const bRead = b.addedAt < 0;
    if (aRead !== bRead) return aRead ? 1 : -1;
    return Math.abs(b.addedAt) - Math.abs(a.addedAt);
  });
}

export async function saveReadLater(item: Omit<ReadLaterItem, 'id' | 'addedAt'>): Promise<void> {
  const items = await store.readLater.getValue();
  // Prevent duplicate URLs
  if (items.some(existing => existing.url === item.url && existing.addedAt > 0)) return;
  const newItem: ReadLaterItem = {
    ...item,
    id: crypto.randomUUID(),
    addedAt: Date.now(),
  };
  await store.readLater.setValue([newItem, ...items]);
}

export async function removeReadLater(id: string): Promise<void> {
  const items = await store.readLater.getValue();
  await store.readLater.setValue(items.filter(i => i.id !== id));
}

export async function markReadLaterRead(id: string): Promise<void> {
  const items = await store.readLater.getValue();
  const updated = items.map(item => {
    if (item.id === id && item.addedAt > 0) {
      // Negate addedAt to push read entries to the bottom of the list
      return { ...item, addedAt: -item.addedAt };
    }
    return item;
  });
  await store.readLater.setValue(updated);
}

export async function markReadLaterUnread(id: string): Promise<void> {
  const items = await store.readLater.getValue();
  const updated = items.map(item => {
    if (item.id === id && item.addedAt < 0) {
      return { ...item, addedAt: -item.addedAt };
    }
    return item;
  });
  await store.readLater.setValue(updated);
}
