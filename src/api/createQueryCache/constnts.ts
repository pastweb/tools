/**
 * Context key used by {@link useQueryCache} to retrieve a shared `QueryCache`
 * from the Global Context / mediator context.
 *
 * Register the cache with `setContext(QUERY_CACHE_CONTEXT_KEY, queryCache)` before
 * mediators that call `useQueryCache()`.
 */
export const QUERY_CACHE_CONTEXT_KEY = '$$QUERY_CACHE_CONTEXT_KEY';
