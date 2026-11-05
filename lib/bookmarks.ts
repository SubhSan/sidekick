// lib/bookmarks.ts - Bookmark operations requiring Chrome APIs
export { autoTagUrl, extractDomainTag, extractPathTag, STOPWORDS } from './bookmarks-pure';

import Fuse from 'fuse.js';
import { store } from './storage';
import { autoTagUrl } from './bookmarks-pure';

interface TaggedBookmark {
  id: string;
  title: string;
  url: string;
  tags: string[];
}

let cachedBookmarks: TaggedBookmark[] | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

function flattenBookmarks(node: chrome.bookmarks.BookmarkTreeNode, result: TaggedBookmark[] = []): TaggedBookmark[] {
  if (node.url) {
    const bkTags = autoTagUrl(node.url);
    result.push({ id: node.id, title: node.title || node.url, url: node.url, tags: bkTags });
  }
  if (node.children) {
    for (const child of node.children) flattenBookmarks(child, result);
  }
  return result;
}

export async function getBookmarks(): Promise<TaggedBookmark[]> {
  if (cachedBookmarks && Date.now() - cachedAt < CACHE_TTL) return cachedBookmarks;
  const tree = await chrome.bookmarks.getTree();
  const flat = tree.flatMap(root => flattenBookmarks(root));
  cachedBookmarks = flat;
  cachedAt = Date.now();
  return flat;
}

export async function searchBookmarks(query: string): Promise<TaggedBookmark[]> {
  const bookmarks = await getBookmarks();
  if (!query.trim()) return bookmarks.slice(0, 20);
  const fuse = new Fuse(bookmarks, {
    keys: [
      { name: 'title', weight: 0.6 },
      { name: 'url', weight: 0.2 },
      { name: 'tags', weight: 0.2 },
    ],
    threshold: 0.4,
  });
  return fuse.search(query).map(r => r.item);
}

export async function autoTagBookmark(id: string, url: string): Promise<void> {
  const tags = autoTagUrl(url);
  const existing = await store.bookmarkTags.getValue();
  await store.bookmarkTags.setValue({ ...existing, [id]: tags });
}

export async function removeBookmarkTags(id: string): Promise<void> {
  const existing = await store.bookmarkTags.getValue();
  const { [id]: _, ...rest } = existing;
  await store.bookmarkTags.setValue(rest);
}

export async function tagAllExistingBookmarks(): Promise<void> {
  const tree = await chrome.bookmarks.getTree();
  const flat = tree.flatMap(root => flattenBookmarks(root));
  const existing = await store.bookmarkTags.getValue();
  const updated = { ...existing };
  for (const bk of flat) {
    updated[bk.id] = bk.tags;
  }
  await store.bookmarkTags.setValue(updated);
  // Invalidate cache
  cachedBookmarks = null;
  cachedAt = 0;
}
