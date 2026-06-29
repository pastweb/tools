import axios from 'axios';
import { saveQuery } from './saveQuery';
import { scheduleRecall } from './scheduleRecall';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { CacheMaps, SaveQueryOptions } from '../types';

/**
 * Restores cache entries from a JSON string previously produced by `dehydrate()`.
 * Uses the compact array format produced by dehydrate and passes the original
 * timestamp (if present) to `saveQuery`.
 *
 * Keys inside the snapshot may be URLs or serialized structured queryKeys.
 *
 * @param cacheMaps - Internal cache + recall maps to populate.
 * @param data - JSON string as returned by {@link dehydrate}.
 */
export function hydrate(cacheMaps: CacheMaps, data: string): void {
  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object') return;

    const agent = axios.create();

    Object.entries(parsed).forEach(([queryKey, entry]: [string, any]) => {
      if (!entry) return;

      let url: string;
      let config: Partial<AxiosRequestConfig>;
      let response: AxiosResponse | undefined;
      let expireIn = '';
      let ts: number | undefined;
      let invalid = false;
      let fetchOnExpired: true | string | '' = '';
      let fetchOnInvalidate: true | string | '' = '';
      let removeOnExpired = false;
      let removeOnInvalidate = false;

      if (Array.isArray(entry)) {
        [url, config, invalid, response, ts, expireIn, fetchOnExpired, fetchOnInvalidate, removeOnExpired, removeOnInvalidate] = entry;
      } else {
        url = entry.url;
        config = entry.config;
        invalid = !!entry.invalid;
        response = entry.response;
        ts = entry.timestamp;
        expireIn = entry.expireIn ?? '';
        fetchOnExpired = entry.fetchOnExpired ?? '';
        fetchOnInvalidate = entry.fetchOnInvalidate ?? '';
        removeOnExpired = entry.removeOnExpired;
        removeOnInvalidate = entry.removeOnInvalidate;
      }

      if (!response) return;

      const saveOptions: SaveQueryOptions = {
        url,
        config,
        invalid,
        expireIn,
        ...ts != null ? { timestamp: Number(ts) } : {},
        ...fetchOnExpired ? { fetchOnExpired } : {},
        ...fetchOnInvalidate ? { fetchOnInvalidate } : {},
        ...removeOnExpired ? { removeOnExpired } : {},
        ...removeOnInvalidate ? { removeOnInvalidate } : {},
      };

      saveQuery(cacheMaps, queryKey, response, saveOptions);

      const needsRecall = typeof fetchOnExpired === 'string' || fetchOnInvalidate || removeOnExpired;

      const fetchData = async () => {
        const freshRes = await agent.get(url, config);
        saveQuery(cacheMaps, queryKey, freshRes, saveOptions);
        if (expireIn && (typeof fetchOnExpired === 'string' || removeOnExpired)) scheduleRecall(cacheMaps, queryKey);
      };

      if (needsRecall) {
        cacheMaps.recallCache.set(queryKey, { fetchData });
        if (typeof fetchOnExpired === 'string' || removeOnExpired) scheduleRecall(cacheMaps, queryKey);
      }
    });
  } catch {
    // Ignore malformed or invalid data
  }
}
