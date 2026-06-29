import { isServer } from '../../../envs';
import { stringToMs } from '../../../stringToMs';
import { clearRefreshTimer } from './clearRefreshTimer';
import { isEntryExpired } from './isEntryExpired';
import type { CacheMaps } from '../types';

/**
 * Schedules (or re-schedules) automatic cache maintenance for a key.
 *
 * - `fetchOnExpired: string` - polls at the given interval; when the entry is expired,
 *   re-fetches via `fetchData`.
 * - `removeOnExpired: true` - polls at `expireIn`; removes the entry when expired.
 *
 * Uses `isDateYoungerOf` (via {@link isEntryExpired}) for expiration checks.
 * No-op on the server (`isServer`). Delayed invalidation refetch is handled by
 * {@link handleInvalidation}, not this function.
 *
 * @param cacheMaps - Internal cache + recall maps.
 * @param queryKey - Cache key to schedule.
 * @param delay - Optional override interval in ms (rare; used internally).
 *
 * @internal
 */
export function scheduleRecall(cacheMaps: CacheMaps, queryKey: string, delay?: number): void {
  if (isServer) return;

  const { queryCache, recallCache } = cacheMaps;
  const query = queryCache.get(queryKey);
  if (!query) return;

  const rc = recallCache.get(queryKey);
  if (!rc) return;

  const { fetchData } = rc;
  const { expireIn, fetchOnExpired, removeOnExpired } = query;

  clearRefreshTimer(cacheMaps, queryKey);

  let internalDelay = 0;
  if (delay !== undefined) internalDelay = delay;
  else if (typeof fetchOnExpired === 'string') internalDelay = stringToMs(fetchOnExpired);
  else if (removeOnExpired && expireIn) internalDelay = stringToMs(expireIn);

  if (internalDelay <= 0 && !removeOnExpired && typeof fetchOnExpired !== 'string') return;

  const checker = () => {
    const current = queryCache.get(queryKey);
    if (!current) return;

    const { expireIn: exp, timestamp, removeOnExpired: remove } = current;

    if (!isEntryExpired(timestamp, exp)) {
      const rec = recallCache.get(queryKey);
      if (rec) rec.refreshTimer = setTimeout(checker, internalDelay);
      return;
    }

    if (remove) {
      queryCache.delete(queryKey);
      clearRefreshTimer(cacheMaps, queryKey);
      recallCache.delete(queryKey);
      return;
    }

    fetchData();

    const rec = recallCache.get(queryKey);
    if (rec) rec.refreshTimer = setTimeout(checker, internalDelay);
  };

  rc.refreshTimer = setTimeout(checker, internalDelay);
  rc.checker = checker;
}
