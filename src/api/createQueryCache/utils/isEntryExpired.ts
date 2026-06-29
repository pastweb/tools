import { isDateYoungerOf } from '../../../isDateYoungerOf';

/**
 * Determines whether a cache entry is expired based on its timestamp and `expireIn` duration.
 * Centralizes expiration logic for the cache layer, `scheduleRecall`, and `getQuery`.
 *
 * @param timestamp - Milliseconds since epoch when the entry was written.
 * @param expireIn - Duration string (e.g. `'5m'`). Uses {@link isDateYoungerOf}.
 * @returns `true` if the entry should be treated as expired.
 */
export function isEntryExpired(timestamp: number | null | undefined, expireIn: string | null | undefined): boolean {
  if (!timestamp || !expireIn) return false;
  return !isDateYoungerOf(new Date(timestamp), expireIn);
}
