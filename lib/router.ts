// lib/router.ts - AI Feature Fallback Router
import { store } from './storage';

export async function routeFeature<T>(
  simpleFn: () => Promise<T>,
  aiFn: () => Promise<T>,
  showToast?: (msg: string) => void,
): Promise<T> {
  const settings = await store.settings.getValue();
  const key = await store.groqKey.getValue();
  if (!settings.aiMode || !key) return simpleFn();
  try {
    return await aiFn();
  } catch (e) {
    showToast?.('AI unavailable - used simple mode.');
    return simpleFn();
  }
}
