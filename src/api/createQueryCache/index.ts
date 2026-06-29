/**
 * Query cache module: {@link createQueryCache}, SSR `dehydrate`/`hydrate`,
 * and cache lifecycle options on `agent.get` (`fetchOnExpired`, `fetchOnInvalidate`, etc.).
 */
export { createQueryCache } from './createQueryCache';
export {
  serializeQueryKey,
  sliceDehydratedState,
  setSSRDehydratedState,
  getSSRDehydratedState,
  clearSSRDehydratedState,
} from './utils';
export { QUERY_CACHE_CONTEXT_KEY } from './constnts';

export type {
  CacheOptions,
  QueryCache,
  QueryData,
} from './types';
