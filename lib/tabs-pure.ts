// lib/tabs-pure.ts - Pure tab and URL functions

/**
 * Extracts the eTLD+1 from a given hostname.
 * Very simple stub for phase 1.
 */
export function etld1(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  // Basic handling for two-part TLDs (co.uk)
  if (parts[parts.length - 2].length <= 3 && parts[parts.length - 1].length <= 3) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

/**
 * Normalizes a URL by stripping UTM parameters, hashes, and trailing slashes.
 */
export function normalizeUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    url.hash = '';
    const params = new URLSearchParams(url.search);
    const toDelete = Array.from(params.keys()).filter((k) => k.startsWith('utm_'));
    for (const k of toDelete) params.delete(k);
    url.search = params.toString();
    return url.toString().replace(/\/$/, '');
  } catch {
    return urlStr;
  }
}

/**
 * Converts a domain name into a consistent CSS hue (0-360).
 */
export function domainToColor(domain: string): number {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}
