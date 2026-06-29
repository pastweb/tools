import type { CacheMaps } from '../types';

/**
 * Clears in-memory cache state before a new SSR request cycle.
 *
 * Prevents cross-request leakage when the shared `queryCache` module is a singleton.
 * `runSSRCycle` should call this at the start of each dynamic render.
 */
export function resetForSSR(cacheMaps: CacheMaps): void {
  const { queryCache, recallCache } = cacheMaps;

  queryCache.clear();

  for (const rec of recallCache.values()) {
    if (rec.refreshTimer) clearTimeout(rec.refreshTimer);
  }

  recallCache.clear();
}
