// lib/bookmarks-pure.ts - Pure bookmark parsing functions

export const STOPWORDS = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an']);

export function extractDomainTag(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return '';
  }
}

export function extractPathTag(url: string): string {
  try {
    const path = new URL(url).pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      const tag = parts[0].toLowerCase();
      if (!STOPWORDS.has(tag)) return tag;
    }
    return '';
  } catch {
    return '';
  }
}

export function autoTagUrl(url: string): string[] {
  const domain = extractDomainTag(url);
  const path = extractPathTag(url);
  return [domain, path].filter(Boolean);
}
