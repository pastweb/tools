import { isBrowser } from '../../envs';
import { setCache, invalidateQuery, invalidateQueries, dehydrate, hydrate, runRecallCheckers } from './utils';
import { resetForSSR as resetCacheForSSR } from './utils';
import { DEHYDRATED_SCRIPT_ID } from './constants';
import { readPageDehydratedSnapshot } from './utils/readPageDehydratedSnapshot';
import type { AxiosInstance } from 'axios';
import type { QueryOptions } from '../createApiAgent';
import type { CacheOptions, QueryCache, CacheMaps } from './types';

/**
 * Creates a standalone query cache that can be shared between one or more API agents.
 *
 * When you pass the returned cache as `queryCache` to `createApiAgent({ queryCache })`,
 * all those agents will share the same storage and the same set of SSR prefetch registrations.
 *
 * In SSR environments the cache cooperates with `isServer`:
 * - `agent.get(...)` (or a `useQuery` using it) immediately returns a placeholder response
 *   and registers a prefetch.
 * - Calling `dehydrate()` executes all registered prefetches (performing the actual requests)
 *   and populates the cache. It returns a JSON string snapshot of the cache, which can be
 *   persisted (e.g. to `.pastweb/ssr-manifest.json`).
 * - `hydrate(json)` can later be used (typically at the beginning of a real render pass)
 *   to restore the cache from the previously saved JSON string.
 *
 * Cache entries support lifecycle options on `agent.get`: `fetchOnExpired` (replaces `callOnExpired`),
 * `fetchOnInvalidate`, `removeOnExpired`, and `removeOnInvalidate`. See `QueryOptions` TSDoc.
 *
 * @param options - Optional {@link CacheOptions}. `deHydratedScriptID` defaults to {@link DEHYDRATED_SCRIPT_ID}; `refetchOnWindowFocus` and `refetchOnReconnect` default to `false`.
 *
 * @example
 * ```ts
 * const queryCache = createQueryCache({ refetchOnWindowFocus: true });
 * const api = createApiAgent({ queryCache });
 *
 * // during SSR collection pass (dry render registers queries)
 * const snapshot = await queryCache.dehydrate();
 * // save `snapshot` to disk...
 *
 * // later, before real render:
 * queryCache.hydrate(savedSnapshot);
 * ```
 *
 * @returns A new standalone `QueryCache` instance.
 */
export function createQueryCache(options: CacheOptions = {}): QueryCache {
  const {
    deHydratedScriptID = DEHYDRATED_SCRIPT_ID,
    refetchOnWindowFocus = false,
    refetchOnReconnect = false,
  } = options;

  const cacheMaps: CacheMaps = {
    queryCache: new Map(),
    recallCache: new Map(),
  };

  if (refetchOnWindowFocus && isBrowser) {
    const onFocus = () => runRecallCheckers(cacheMaps);
    window.addEventListener('focus', onFocus);
  }

  if (refetchOnReconnect && isBrowser) {
    const onReconnect = () => runRecallCheckers(cacheMaps);
    window.addEventListener('online', onReconnect);
  }

  const cache: QueryCache = {
    getDehydrateScriptID: () => deHydratedScriptID,
    get: (key: string) => cacheMaps.queryCache.get(key),
    getAll: () => Array.from(cacheMaps.queryCache),
    has: (key: string) => cacheMaps.queryCache.has(key),
    set: (url: string, agent: AxiosInstance, options: QueryOptions) => setCache(cacheMaps, url, agent, options),
    delete: (key: string) => {
      const deleted = cacheMaps.queryCache.delete(key);
      const rec = cacheMaps.recallCache.get(key);
      if (rec) {
        if (rec.refreshTimer) clearTimeout(rec.refreshTimer);
        cacheMaps.recallCache.delete(key);
      }
      return deleted;
    },
    invalidateQuery: (queryKey?: unknown) => invalidateQuery(cacheMaps, queryKey),
    invalidateQueries: (queryKeys: unknown[]) => invalidateQueries(cacheMaps, queryKeys),
    dehydrate: () => dehydrate(cacheMaps),
    hydrate: (data: string) => hydrate(cacheMaps, data),
    resetForSSR: () => resetCacheForSSR(cacheMaps),
  };

  if (isBrowser) {
    const snapshot = readPageDehydratedSnapshot(deHydratedScriptID);

    if (snapshot) {
      hydrate(cacheMaps, snapshot);
    }
  }

  return cache;
}
