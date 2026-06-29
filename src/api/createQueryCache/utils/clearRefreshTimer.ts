import type { CacheMaps, RecallCache } from '../types';

/**
 * Clears any pending `setTimeout` on a recall entry.
 *
 * @param cacheMaps - Internal cache + recall maps.
 * @param queryKey - Cache key whose timer should be cleared.
 *
 * @internal
 */
export function clearRefreshTimer(cacheMaps: CacheMaps, queryKey: string): void {
  const { recallCache } = cacheMaps;

  if (!recallCache.has(queryKey)) return;

  const cache = recallCache.get(queryKey) as RecallCache;

  if (cache.refreshTimer !== null) {
    clearTimeout(cache.refreshTimer);
    cache.refreshTimer = null;
  }
}
