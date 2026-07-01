/**
 * Context key used by {@link useQueryCache} to retrieve a shared `QueryCache`
 * from the Global Context / mediator context.
 *
 * Register the cache with `setContext(QUERY_CACHE_CONTEXT_KEY, queryCache)` before
 * mediators that call `useQueryCache()`.
 */
export const QUERY_CACHE_CONTEXT_KEY = '$$QUERY_CACHE_CONTEXT_KEY';

/**
 * Default DOM script id used to embed a dehydrated query-cache snapshot.
 */
export const DEHYDRATED_SCRIPT_ID = '__API_DEHYDRATED__';
