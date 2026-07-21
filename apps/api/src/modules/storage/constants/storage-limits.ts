import type { StorageCategory } from './storage-categories';

/** Maximum upload sizes in bytes */
export const STORAGE_SIZE_LIMITS: Record<StorageCategory, number> = {
  videos: 200 * 1024 * 1024, // 200 MB
  thumbnails: 5 * 1024 * 1024, // 5 MB
  banners: 5 * 1024 * 1024, // 5 MB
  speakers: 5 * 1024 * 1024, // 5 MB
  resources: 20 * 1024 * 1024, // 20 MB
};

export function getStorageLimitLabel(category: StorageCategory): string {
  const bytes = STORAGE_SIZE_LIMITS[category];
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

export function validateStorageFileSize(
  category: StorageCategory,
  sizeBytes: number,
): string | null {
  const limit = STORAGE_SIZE_LIMITS[category];
  if (sizeBytes > limit) {
    return `File is too large. Maximum size for ${category} is ${getStorageLimitLabel(category)}.`;
  }
  return null;
}
