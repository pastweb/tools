import type { QueryData } from '../types';

/**
 * Internal helper that attaches a WeakRef-based callback to a cache entry.
 * The callback is later invoked from `saveQuery` when new data arrives for that key.
 *
 * @param queryCache - Internal query cache map.
 * @param queryKey - Cache key to subscribe.
 * @param fn - Callback invoked with new `response.data` on updates.
 *
 * @internal
 */
export function saveDataCallback<T>(queryCache: Map<string, QueryData>, queryKey: string, fn: (data: T) => void): void {
  const query = queryCache.get(queryKey);

  if (!query) return;

  query.onDataCallbacks.add(new WeakRef(fn));
}
