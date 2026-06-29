import type { CacheMaps } from '../types';

/**
 * Invokes every `checker` stored in `recallCache` (used by `refetchOnWindowFocus`).
 *
 * @param cacheMaps - Internal cache + recall maps.
 *
 * @internal
 */
export function runRecallCheckers(cacheMaps: CacheMaps): void {
  const { recallCache } = cacheMaps;

  for (const rec of recallCache.values()) {
    rec.checker?.();
  }
}
