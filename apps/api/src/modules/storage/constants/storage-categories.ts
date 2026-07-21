export const STORAGE_CATEGORIES = [
  'videos',
  'thumbnails',
  'banners',
  'resources',
  'speakers',
] as const;

export type StorageCategory = (typeof STORAGE_CATEGORIES)[number];

export function isStorageCategory(value: string): value is StorageCategory {
  return (STORAGE_CATEGORIES as readonly string[]).includes(value);
}
