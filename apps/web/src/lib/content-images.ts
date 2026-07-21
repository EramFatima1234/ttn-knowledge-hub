import { DEFAULT_BANNER_URL, DEFAULT_THUMBNAIL_URL } from "./default-images";

export function resolveThumbnailUrl(url?: string | null): string {
  const trimmed = url?.trim();
  return trimmed || DEFAULT_THUMBNAIL_URL;
}

export function resolveBannerUrl(
  bannerUrl?: string | null,
  fallbackThumbnail?: string | null,
): string {
  const banner = bannerUrl?.trim();
  if (banner) return banner;

  const thumb = fallbackThumbnail?.trim();
  if (thumb) return thumb;

  return DEFAULT_BANNER_URL;
}
