import { isServer } from '../../../envs';
import { getQuery } from './getQuery';
import { saveDataCallback } from './saveDataCallback';
import { saveQuery } from './saveQuery';
import { scheduleRecall } from './scheduleRecall';
import { serializeQueryKey } from './serializeQueryKey';
import type { AxiosInstance } from 'axios';
import type { QueryOptions, QueryResponse } from '../../createApiAgent';
import type { CacheMaps, SaveQueryOptions } from '../types';

/**
 * Core cache-aware GET implementation.
 *
 * - On the client: returns cached data if present and fresh, otherwise performs the request
 *   via the supplied `agent` and stores the result.
 * - On the server (`isServer`): immediately returns a placeholder `QueryResponse` and registers
 *   a function (via `dehydrate()`) that will later execute the real request and populate the cache.
 *
 * The effective storage key is derived here:
 * - If `options.queryKey` is present (array recommended, or string), it is passed to
 *   `serializeQueryKey()` to produce the cache key.
 * - If omitted, the provided `url` (the fetch URL) is used directly as the cache key.
 * This gives hybrid support: structured keys when supplied, plain URL fallback otherwise.
 *
 * Lifecycle options on `options` (`fetchOnExpired`, `fetchOnInvalidate`, `removeOnExpired`,
 * `removeOnInvalidate`) are stored on the entry and drive timers / invalidation side effects.
 *
 * @param cacheMaps - Internal cache + recall maps.
 * @param url - Request URL passed to the Axios agent.
 * @param agent - Axios instance used for network requests.
 * @param options - `QueryOptions` from `agent.get` (includes cache lifecycle flags).
 * @returns Cached or freshly fetched `QueryResponse` (placeholder on the server).
 */
export async function setCache<T = any>(
  cacheMaps: CacheMaps,
  url: string,
  agent: AxiosInstance,
  options: QueryOptions,
): Promise<QueryResponse<T>> {
  const { queryKey, expireIn = '', fetchOnExpired, fetchOnInvalidate, removeOnExpired, removeOnInvalidate, ...config } = options;
  delete config.select;

  const { queryCache, recallCache } = cacheMaps;
  const cacheKey = serializeQueryKey(queryKey || url);
  const saveOptions: SaveQueryOptions = { url, config, expireIn, fetchOnExpired, fetchOnInvalidate, removeOnExpired, removeOnInvalidate };

  const needsRecall = isServer || typeof fetchOnExpired === 'string' || fetchOnInvalidate || removeOnExpired;

  const fetchData = async () => {
    const freshRes = await agent.get(url, config);
    saveQuery(cacheMaps, cacheKey, freshRes, saveOptions);
    if (expireIn && (typeof fetchOnExpired === 'string' || removeOnExpired)) scheduleRecall(cacheMaps, cacheKey);
  };

  if (needsRecall && !recallCache.has(cacheKey)) {
    recallCache.set(cacheKey, { fetchData });
  }

  let res: QueryResponse<T>;

  if (isServer) {
    res = {
      data: undefined as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      onData: () => {},
    } as QueryResponse<T>;
  } else {
    const onData = (fn: (data: T) => void) => saveDataCallback(queryCache, cacheKey, fn);
    const response = getQuery(queryCache, cacheKey);

    if (response) {
      res = { ...response, onData };
    } else {
      res = await agent.get(url, config);
      saveQuery(cacheMaps, cacheKey, res, saveOptions);
      if (expireIn && (typeof fetchOnExpired === 'string' || removeOnExpired)) scheduleRecall(cacheMaps, cacheKey);
      const freshResponse = getQuery(queryCache, cacheKey) as QueryResponse;
      res = { ...freshResponse, onData };
    }
  }

  return res;
}
