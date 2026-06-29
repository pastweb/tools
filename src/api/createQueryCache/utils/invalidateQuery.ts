import { escapeRegExp } from './escapeRegExp';
import { handleInvalidation } from './handleInvalidation';
import { serializeQueryKey } from './serializeQueryKey';
import type { CacheMaps } from '../types';

/**
 * Invalidates cache entries for a specific key, array of keys, or all entries.
 * Works for both URL-based keys and structured queryKey values.
 *
 * - Passing a string: treated as a prefix (matches stored keys starting with it).
 * - Passing an `unknown[]`: serialized (same as when setting) and used as prefix.
 * - Passing an array of (string | unknown[]): each entry is normalized (arrays via serializeQueryKey)
 *   and used as separate prefixes. This preserves old usage like `invalidateQuery(['/api/a', '/api/b'])`.
 *
 * You can pass the exact same `queryKey` value you used when calling `get` / `useQuery`.
 *
 * After marking entries invalid, {@link handleInvalidation} applies `fetchOnInvalidate`
 * and `removeOnInvalidate` per entry.
 *
 * @param cacheMaps - Internal cache + recall maps.
 * @param queryKey - Prefix string, structured key array, or `null`/`undefined` to invalidate all.
 */
export function invalidateQuery(cacheMaps: CacheMaps, queryKey: unknown): void {
  const queryCache = cacheMaps.queryCache;

  if (queryKey == null) {
    Array.from(queryCache.keys()).forEach(k => {
      const query = queryCache.get(k);
      if (!query) return;
      query.invalid = true;
      queryCache.set(k, query);
      handleInvalidation(cacheMaps, k);
    });
    return;
  }

  const prefixes = Array.isArray(queryKey)
    ? [serializeQueryKey(queryKey)]
    : [String(queryKey)];

  const regex = prefixes.map(p => new RegExp(`^${escapeRegExp(p)}`));

  Array.from(queryCache.keys()).forEach(stored => {
    if (!regex.some(pattern => pattern.test(stored))) return;

    const query = queryCache.get(stored);
    if (!query) return;

    query.invalid = true;
    queryCache.set(stored, query);
    handleInvalidation(cacheMaps, stored);
  });
}
