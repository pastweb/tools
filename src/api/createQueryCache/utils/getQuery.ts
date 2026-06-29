import { isEntryExpired } from './isEntryExpired';
import type { AxiosResponse } from 'axios';
import type { QueryData } from '../types';

/**
 * Returns a fresh cached `AxiosResponse` for `key`, or `null` if missing, invalidated, or expired.
 * Marks expired entries as `invalid` before returning `null`.
 *
 * @internal
 */
export function getQuery(queryCache: Map<string, QueryData>, key: string): AxiosResponse | null {
  const data = queryCache.get(key);
  if (!data) return null;
  if (data.invalid) return null;

  if (isEntryExpired(data.timestamp, data.expireIn)) {
    queryCache.set(key, { ...data, invalid: true });
    return null;
  }

  return data.response;
}
