/**
 * Lightweight, memory-conscious image preloader with a bounded LRU cache.
 * Prevents memory leaks and heavy RAM usage on mobile devices.
 */

const MAX_CACHE_SIZE = 6;
const preloadedCache = new Map<string, HTMLImageElement>();

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
  preloadedCache.set(url, img);
}

export function preloadImagesBatch(urls: string[], maxCount = 4): void {
  urls.slice(0, maxCount).forEach(url => preloadImage(url));
}

export function clearImageCache(): void {
  preloadedCache.forEach((img) => {
    img.src = '';
  });
  preloadedCache.clear();
}
