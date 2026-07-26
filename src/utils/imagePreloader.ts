/**
 * Lightweight, memory-conscious image preloader with a bounded LRU cache.
 * Prevents memory leaks and heavy RAM usage on mobile devices.
 */

const MAX_CACHE_SIZE = 10;
const preloadedCache = new Map<string, HTMLImageElement>();

export function getOptimizedThumbnailUrl(url?: string, targetWidth = 500): string {
  if (!url) return '';
  
  // Unsplash dynamic resize & WebP formatting
  if (url.includes('images.unsplash.com')) {
    const hasQuery = url.includes('?');
    const separator = hasQuery ? '&' : '?';
    // Replace or append w and q parameters
    let cleanUrl = url.replace(/([?&])w=\d+/, '').replace(/([?&])q=\d+/, '');
    const cleanSep = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl}${cleanSep}w=${targetWidth}&q=80&auto=format&fit=crop`;
  }

  return url;
}

export function preloadImage(url?: string): void {
  if (!url || typeof window === 'undefined') return;

  // If already in cache, move to top (most recently used)
  if (preloadedCache.has(url)) {
    const img = preloadedCache.get(url)!;
    preloadedCache.delete(url);
    preloadedCache.set(url, img);
    return;
  }

  // Evict oldest cached image if capacity reached
  if (preloadedCache.size >= MAX_CACHE_SIZE) {
    const oldestUrl = preloadedCache.keys().next().value;
    if (oldestUrl) {
      const oldestImg = preloadedCache.get(oldestUrl);
      if (oldestImg) {
        oldestImg.src = ''; // Help garbage collection release memory
      }
      preloadedCache.delete(oldestUrl);
    }
  }

  // Preload new image
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  
  // Attempt decoding in advance to avoid frame jank
  if ('decode' in img) {
    img.decode().catch(() => {
      // Non-critical if decode fails or interrupted
    });
  }

  preloadedCache.set(url, img);
}

export async function preloadImageAsync(url?: string): Promise<HTMLImageElement | null> {
  if (!url || typeof window === 'undefined') return null;

  if (preloadedCache.has(url)) {
    const cachedImg = preloadedCache.get(url)!;
    preloadedCache.delete(url);
    preloadedCache.set(url, cachedImg);
    return cachedImg;
  }

  preloadImage(url);
  const img = preloadedCache.get(url);
  if (img && 'decode' in img) {
    try {
      await img.decode();
    } catch (e) {
      // ignore decode failure, image will still load normally
    }
  }
  return img || null;
}

export function preloadImagesBatch(urls: string[], maxCount = 6): void {
  urls.slice(0, maxCount).forEach(url => preloadImage(url));
}

export function clearImageCache(): void {
  preloadedCache.forEach((img) => {
    img.src = '';
  });
  preloadedCache.clear();
}
