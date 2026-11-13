import { effect, isRef, reactive, ref } from '../../../reactivity';
import { setAsInfiniteQuery } from './setAsInfiniteQuery';
import { fetchFirstPage, fetchNextPage, fetchPreviousPage } from './utils';
import type { Ref } from '../../../reactivity';
import type { QueryFetchStatus, QueryStatus } from '../useQuery';
import type { InfiniteQueryConfig, InfiniteQueryInfo, InfiniteQuerySettings } from './types';

/**
 * Creates a reactive infinite query that fetches ordered pages with explicit page params.
 *
 * `fetch()` resets to `initialPageParam` and replaces the page list. `fetchNextPage()`
 * appends the next page when `hasNextPage` is true. `fetchPreviousPage()` prepends
 * the previous page when `hasPreviousPage` is true. If you omit page param resolvers,
 * the hook uses the pagination metadata attached by `createApiAgent` when available.
 *
 * @param config - Infinite query configuration.
 * @returns Reactive infinite query state.
 *
 * @example
 * ```ts
 * const posts = useInfiniteQuery({
 *   initialPageParam: 1,
 *   fn: page => agent.get(`/api/posts?page=${page}&limit=10`),
 *   getNextPageParam: (_last, _pages, lastPageParam) => lastPageParam + 1,
 * });
 *
 * await posts.fetchNextPage();
 * ```
 */
export function useInfiniteQuery<TPage, TPageParam = unknown>(
  config: InfiniteQueryConfig<TPage, TPageParam>,
): InfiniteQueryInfo<TPage, TPageParam> {
  const {
    initialData,
    initialPageParam,
    immediate = true,
    source,
  } = config;
  const _immediate = isRef(immediate) ? immediate as Ref<boolean> : typeof immediate === 'boolean' ? ref(immediate) : ref(true);
  const initialPages = initialData?.pages ?? [];
  const initialPageParams = initialData?.pageParams ?? [];
  const initialStatus: QueryStatus = initialPages.length ? 'success' : 'pending';
  const initialFetchStatus: QueryFetchStatus = _immediate.value ? 'fetching' : 'idle';

  const query = reactive<InfiniteQueryInfo<TPage, TPageParam>>({
    status: initialStatus,
    fetchStatus: initialFetchStatus,
    responseStatus: null,
    pages: [...initialPages],
    data: [...initialPages],
    pageParams: [...initialPageParams],
    pagination: null,
    isPending: initialStatus === 'pending',
    isLoading: initialStatus === 'pending' && initialFetchStatus === 'fetching',
    isFetching: initialFetchStatus === 'fetching',
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
    hasNextPage: initialPages.length > 0,
    hasPreviousPage: false,
    isError: false,
    error: null,
    isPlaceholderData: !!initialData,
    fetch: () => fetchFirstPage(settings),
    fetchNextPage: () => fetchNextPage(settings),
    fetchPreviousPage: () => fetchPreviousPage(settings),
  });

  const settings: InfiniteQuerySettings<TPage, TPageParam> = {
    config: { ...config },
    query,
    activeFetch: null,
    activeNextFetch: null,
    activePreviousFetch: null,
    fetchId: 0,
    nextPageParam: initialPageParam,
    previousPageParam: undefined,
    firstPageResponse: null,
    lastPageResponse: null,
  };

  const dependencies = Array.isArray(source) ? [...source, _immediate] : source ? [source, _immediate] : _immediate;

  effect(
    () => {
      if (_immediate.value) {
        fetchFirstPage(settings);
      }
    },
    dependencies,
    true
  );

  setAsInfiniteQuery(query);
  return query;
}
