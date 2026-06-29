import { invalidateQuery } from './invalidateQuery';
import type { CacheMaps } from '../types';

/**
 * Invalidates multiple query keys by delegating each key to {@link invalidateQuery}.
 *
 * @param cacheMaps - Internal cache + recall maps.
 * @param queryKeys - Query keys or prefixes to invalidate in order.
 */
export function invalidateQueries(cacheMaps: CacheMaps, queryKeys: unknown[]): void {
  queryKeys.forEach(queryKey => invalidateQuery(cacheMaps, queryKey));
}
