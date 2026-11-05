// lib/wallpaper.ts - IndexedDB storage for custom wallpapers via idb
import { openDB } from 'idb';

const DB_NAME = 'sidekick-wallpapers';
const STORE_NAME = 'wallpapers';
const DB_VERSION = 1;

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

/**
 * Saves a custom wallpaper blob to IndexedDB under the given ID (caller provides UUID).
 */
export async function saveCustomWallpaper(id: string, blob: Blob): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, blob, id);
}

/**
 * Returns the raw Blob for a custom wallpaper, or undefined if not found.
 */
export async function getCustomWallpaper(id: string): Promise<Blob | undefined> {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

/**
 * Deletes a custom wallpaper from IndexedDB.
 */
export async function deleteCustomWallpaper(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

/**
 * Returns an array of stored wallpaper IDs only (not blobs).
 */
export async function listCustomWallpapers(): Promise<string[]> {
  const db = await getDb();
  const keys = await db.getAllKeys(STORE_NAME);
  return keys.map(String);
}

/**
 * Validates a wallpaper file for supported type and size.
 * Returns an error string if invalid, or null if valid.
 * Images (JPEG/PNG/WebP) max 8MB. Videos (MP4/WebM) max 50MB.
 */
export function validateWallpaperFile(file: File): string | null {
  const imageMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const videoMimes = ['video/mp4', 'video/webm'];
  const allMimes = [...imageMimes, ...videoMimes];

  if (!allMimes.includes(file.type)) {
    return 'Unsupported file type. Use JPEG, PNG, WebP, MP4, or WebM.';
  }

  if (imageMimes.includes(file.type) && file.size > 8 * 1024 * 1024) {
    return 'Image files must be under 8MB.';
  }

  if (videoMimes.includes(file.type) && file.size > 50 * 1024 * 1024) {
    return 'Video files must be under 50MB.';
  }

  return null;
}

/**
 * Returns true if the given MIME type string is a video type.
 * Takes a MIME type string, NOT a File object.
 * Call as isVideoType(blob.type)
 */
export function isVideoType(mimeType: string): boolean {
  return mimeType === 'video/mp4' || mimeType === 'video/webm';
}
