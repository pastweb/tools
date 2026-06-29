import type { CacheMaps } from '../types';

/**
 * Executes all registered prefetch functions (collected during an SSR "dry run" via
 * agent.get / useQuery when isServer), populates the internal cache with the responses,
 * and returns a JSON string representing the cache state (suitable for persistence).
 *
 * This is the main entry point for SSR data collection.
 *
 * Snapshot format per key (compact array):
 * `[url, config, invalid, response, timestamp, expireIn, fetchOnExpired, fetchOnInvalidate, removeOnExpired, removeOnInvalidate]`
 *
 * @param cacheMaps - Internal cache + recall maps.
 * @returns JSON string of the cache state.
 */
export async function dehydrate(cacheMaps: CacheMaps): Promise<string> {
  const { queryCache, recallCache } = cacheMaps;
  await Promise.all(Array.from(recallCache.values()).map(c => c.fetchData()));

  const cacheObj: Record<string, any> = {};
  for (const [url, c] of queryCache) {
    cacheObj[url] = [
      c.url,
      c.config,
      c.invalid,
      c.response,
      c.timestamp,
      c.expireIn || '',
      c.fetchOnExpired || '',
      c.fetchOnInvalidate || '',
      c.removeOnExpired,
      c.removeOnInvalidate,
    ];
  }
  return JSON.stringify(cacheObj);
}
