import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { QueryOptions, QueryResponse } from '../createApiAgent';

/**
 * Options for {@link createQueryCache}.
 */
export interface CacheOptions {
  /**
   * DOM script id used by page-level query-cache hydration helpers.
   *
   * Defaults to {@link DEHYDRATED_SCRIPT_ID}.
   */
  deHydratedScriptID?: string;
  /**
   * When `true`, re-runs every registered `checker` in `recallCache` when the browser
   * window/tab regains focus. Defaults to `false`. Only active when {@link isBrowser} is `true`.
   */
  refetchOnWindowFocus?: boolean;
  /**
   * When `true`, re-runs every registered `checker` in `recallCache` when the browser
   * comes back online. Defaults to `false`. Only active when {@link isBrowser} is `true`.
   */
  refetchOnReconnect?: boolean;
}

/**
 * Serialized query-cache snapshot embedded in server-rendered HTML or passed
 * directly to client hydration.
 */
export type QueryCacheSnapshot = string | null | undefined;

/**
 * Internal shape stored inside a `QueryCache` for each cached entry.
 *
 * The storage key is either a serialized `queryKey` or the raw request URL.
 * Lifecycle options (`fetchOnExpired`, etc.) are copied from `agent.get` `QueryOptions`
 * and persisted across `dehydrate` / `hydrate`.
 */
export interface QueryData {
  /** Original fetch URL (stored on the server for SSR snapshot replay). */
  url?: string;
  /** Serializable subset of the Axios config used for the request (SSR snapshots). */
  config?: Partial<AxiosRequestConfig<any>>;
  /** Whether the entry has been explicitly invalidated. */
  invalid: boolean;
  /** The last successful Axios response. */
  response: AxiosResponse;
  /** Timestamp (ms since epoch) when the response was stored. */
  timestamp: number;
  /** The expireIn string that was in effect when this entry was written. */
  expireIn?: string;
  /** Auto-refetch on expiration. `string` schedules a timer; `true` is passive (refetch on next get if stale). */
  fetchOnExpired?: true | string;
  /** Auto-refetch (or delayed refetch) after invalidation. */
  fetchOnInvalidate?: true | string;
  /** Remove entry instead of refetching when expiration is reached. */
  removeOnExpired?: boolean;
  /** Remove entry immediately when invalidated. */
  removeOnInvalidate?: boolean;
  /** WeakRef callbacks subscribed via `response.onData(...)`. */
  onDataCallbacks: Set<WeakRef<Function>>;
};

/**
 * Per-key recall state used for SSR prefetch registration and client-side
 * scheduled refetch / removal (see `fetchOnExpired`, `removeOnExpired`).
 */
export type RecallCache = {
  /** Active `setTimeout` id for polling or delayed invalidation refetch, if any. */
  refreshTimer?: ReturnType<typeof setTimeout> | null;
  /** Function that performs the actual network request and writes to `queryCache`. */
  fetchData: () => void;
  /** Internal tick function used to reschedule expiration polling. */
  checker?: () => void;
};

/**
 * The two internal maps that back a `QueryCache` instance.
 */
export interface CacheMaps {
  /** Stored responses keyed by URL or serialized `queryKey`. */
  queryCache:  Map<string, QueryData>;
  /** Registered prefetch / refetch functions and their timers, keyed like `queryCache`. */
  recallCache: Map<string, RecallCache>;
};

/**
 * Options passed to the internal `saveQuery` helper when writing or restoring a cache entry.
 */
export interface SaveQueryOptions {
  /** The fetch URL used for network replay (SSR / hydrate). */
  url: string;
  /** Axios request config (serializable subset stored on the server). */
  config: AxiosRequestConfig<any>;
  /** Whether the entry has been marked invalid via `invalidateQuery`. */
  invalid?: boolean;
  /** Expiration duration string (e.g. `'5m'`). */
  expireIn?: string;
  /** See {@link QueryOptions.fetchOnExpired}. */
  fetchOnExpired?: true | string;
  /** See {@link QueryOptions.fetchOnInvalidate}. */
  fetchOnInvalidate?: true | string;
  /** See {@link QueryOptions.removeOnExpired}. */
  removeOnExpired?: boolean;
  /** See {@link QueryOptions.removeOnInvalidate}. */
  removeOnInvalidate?: boolean;
  /** Override timestamp (ms). Used by `hydrate` to restore the original write time. */
  timestamp?: number;
};

/**
 * The cache object returned by `createQueryCache()`.
 *
 * Keys are either the full request URL or a serialized structured `queryKey` (when provided
 * as an array to `agent.get(url, { queryKey: [...] })` or equivalent). This enables hybrid
 * URL-based or key-based caching.
 */
export interface QueryCache {
  /**
   * Returns the DOM script id used for page-level dehydrated query-cache snapshots.
   */
  getDehydrateScriptID: () => string;
  /** Retrieve raw cached data for a URL key (or undefined). */
  get: (key: string) => QueryData | undefined;
  /** Return all entries as [key, QueryData] pairs. */
  getAll: () => [string, QueryData][];
  /** Whether a non-stale entry exists for the key. */
  has: (key: string) => boolean;
  /**
   * Remove a specific key and clear any associated recall timer / prefetch registration.
   * @param key - Cache key (URL or serialized `queryKey`).
   */
  delete: (key: string) => boolean;
  /**
   * Internal method used by `agent.get`. When the agent was given a `queryCache`,
   * this handles cache lookup, SSR registration, or the actual network request + store.
   * The first argument is the fetch URL; options.queryKey (array) controls the actual storage key.
   */
  set: <T = any>(url: string, agent: AxiosInstance, options: QueryOptions) => Promise<QueryResponse<T>>;
  /**
   * Mark entries invalid.
   * - No argument → invalidate everything.
   * - A string or `unknown[]` (structured queryKey) → treated as a key/prefix. Arrays are serialized first.
   * - Array of strings or arrays → each is processed (strings used as-is, arrays serialized).
   *
   * The same value (or prefix) you used for `queryKey` when fetching will match.
   *
   * Respects per-entry lifecycle options: `fetchOnInvalidate` triggers (or delays) a refetch;
   * `removeOnInvalidate` deletes the entry; active `fetchOnExpired` timers are cleared.
   */
  invalidateQuery: (queryKey?: unknown | unknown[]) => void;
  /**
   * Invalidates multiple query keys/prefixes by calling `invalidateQuery` for each item.
   *
   * @param queryKeys - Query keys, structured query keys, or URL prefixes.
   */
  invalidateQueries: (queryKeys: unknown[]) => void;
  /**
   * Executes all registered SSR prefetch functions (if any). This performs the actual
   * network requests and populates the cache. Returns a JSON string snapshot of the
   * cache state (for persistence, e.g. in SSR page cache files).
   *
   * Snapshot entries include lifecycle options (`fetchOnExpired`, `fetchOnInvalidate`,
   * `removeOnExpired`, `removeOnInvalidate`) in a compact array format.
   */
  dehydrate: () => Promise<string>;
  /**
   * Restores the cache from a JSON string previously returned by `dehydrate()`.
   * Uses `saveQuery` internally to repopulate the cache with original response data,
   * timestamps, expiration info, and lifecycle options. Re-registers recall functions
   * and restarts client-side timers where applicable.
   *
   * @param data - JSON string from `dehydrate()`.
   */
  hydrate: (data: string) => void;
  /**
   * Clears all in-memory cache entries and recall registrations.
   * Call at the start of each SSR request before the collection render passes.
   */
  resetForSSR: () => void;
};
