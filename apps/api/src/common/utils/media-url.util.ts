export type MediaProvider =
  | 'direct-video'
  | 'embed'
  | 'image'
  | 'pdf'
  | 'unknown';

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function detectMediaProvider(url: string): MediaProvider {
  if (!isValidHttpUrl(url)) return 'unknown';
  const lower = url.toLowerCase();
  if (/\.(pdf)(\?|#|$)/i.test(lower)) return 'pdf';
  if (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(lower)) return 'direct-video';
  if (
    /youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com|cloudfront\.net|amazonaws\.com|blob\.core\.windows\.net|cloudinary\.com/i.test(
      lower,
    )
  ) {
    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/i.test(lower)) return 'image';
    if (/youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com/i.test(lower)) {
      return 'embed';
    }
    if (/\.(mp4|webm)(\?|#|$)/i.test(lower)) return 'direct-video';
    return 'embed';
  }
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/i.test(lower)) return 'image';
  return 'unknown';
}

export function normalizeHomepageTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
