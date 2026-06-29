import { stringToMs } from '../../../stringToMs';
import { clearRefreshTimer } from './clearRefreshTimer';
import type { CacheMaps } from '../types';

/**
 * Runs lifecycle side effects after `invalidateQuery` marks an entry invalid.
 *
 * - Clears active `fetchOnExpired` timers.
 * - `removeOnInvalidate` -> deletes the entry and recall registration.
 * - `fetchOnInvalidate: true` -> immediate refetch via stored `fetchData`.
 * - `fetchOnInvalidate: string` -> delayed refetch after the duration.
 *
 * @param cacheMaps - Internal cache + recall maps.
 * @param key - Cache key that was invalidated.
 *
 * @internal
 */
export function handleInvalidation(cacheMaps: CacheMaps, key: string): void {
  const { queryCache, recallCache } = cacheMaps;
  const query = queryCache.get(key);
  if (!query) return;

  if (query.fetchOnExpired) clearRefreshTimer(cacheMaps, key);

  if (query.removeOnInvalidate) {
    queryCache.delete(key);
    recallCache.delete(key);
    return;
  }

  if (query.fetchOnInvalidate) {
    const delay = typeof query.fetchOnInvalidate === 'string' ? stringToMs(query.fetchOnInvalidate) : 0;
    const rc = recallCache.get(key);
    if (!rc) return;
    if (delay) {
      clearRefreshTimer(cacheMaps, key);
      rc.refreshTimer = setTimeout(() => rc.fetchData(), delay);
    } else {
      rc.fetchData();
    }
  }
}
