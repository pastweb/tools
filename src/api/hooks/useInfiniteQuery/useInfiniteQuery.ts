import { effect, isRef, reactive, ref, type Ref } from '../../../reactivity';
import { runWithRetry } from '../utils';
import type { QueryFetchStatus, QueryStatus } from '../useQuery';
import type { QueryResponse } from '../../createApiAgent';
import type { InfiniteQueryConfig, InfiniteQueryInfo } from './types';

function getErrorResponseStatus(error: unknown): number | null {
  const status = (error as { response?: { status?: unknown } })?.response?.status;
  return typeof status === 'number' ? status : null;
}

function getDefaultNextPageParam<TPage, TPageParam>(
  pagination: InfiniteQueryInfo<TPage, TPageParam>['pagination'],
): TPageParam | undefined {
  if (!pagination || pagination.current >= pagination.of) return undefined;
  return (pagination.current + 1) as TPageParam;
}

function getDefaultPreviousPageParam<TPage, TPageParam>(
  pagination: InfiniteQueryInfo<TPage, TPageParam>['pagination'],
): TPageParam | undefined {
  if (!pagination || pagination.current <= 1) return undefined;
  return (pagination.current - 1) as TPageParam;
}

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
 *   fn: page => agent.get(`/api/posts?_page=${page}&_limit=10`),
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
    fn,
    getNextPageParam,
    getPreviousPageParam,
    initialData,
    initialPageParam,
    immediate = true,
    retry,
    retryDelay,
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
    fetch: fetchFirstPage,
    fetchNextPage,
    fetchPreviousPage,
  });

  let activeFetch: Promise<void> | null = null;
  let activeNextFetch: Promise<void> | null = null;
  let activePreviousFetch: Promise<void> | null = null;
  let fetchId = 0;
  let nextPageParam: TPageParam | undefined = initialPages.length ? initialPageParam : initialPageParam;
  let previousPageParam: TPageParam | undefined;
  let firstPageResponse: QueryResponse<TPage> | null = null;
  let lastPageResponse: QueryResponse<TPage> | null = null;

  function setFetchStatus(fetchStatus: QueryFetchStatus): void {
    query.fetchStatus = fetchStatus;
    query.isFetching = fetchStatus === 'fetching';
    query.isLoading = query.status === 'pending' && fetchStatus === 'fetching';
  }

  function setPages(pages: TPage[], pageParams: TPageParam[]): void {
    query.pages = pages;
    query.data = pages;
    query.pageParams = pageParams;
  }

  function updatePage(index: number, page: TPage): void {
    const pages = [...query.pages];
    pages[index] = page;
    setPages(pages, [...query.pageParams]);
    query.status = 'success';
    query.isPending = false;
    query.isLoading = false;
    query.isError = false;
    query.error = null;
    query.isPlaceholderData = false;
  }

  function normalizePageParam(param: TPageParam | null | undefined | false): TPageParam | undefined {
    return param === null || param === false ? undefined : param;
  }

  function resolveNextPageParam(lastPage: QueryResponse<TPage>, lastPageParam: TPageParam): void {
    const next = getNextPageParam
      ? getNextPageParam(
        lastPage,
        query.pages,
        lastPageParam,
        query.pageParams,
      )
      : getDefaultNextPageParam<TPage, TPageParam>(lastPage.pagination ?? null);

    nextPageParam = normalizePageParam(next);
    query.hasNextPage = nextPageParam !== undefined;
  }

  function resolvePreviousPageParam(firstPage: QueryResponse<TPage>, firstPageParam: TPageParam): void {
    const previous = getPreviousPageParam
      ? getPreviousPageParam(
        firstPage,
        query.pages,
        firstPageParam,
        query.pageParams,
      )
      : getDefaultPreviousPageParam<TPage, TPageParam>(firstPage.pagination ?? null);

    previousPageParam = normalizePageParam(previous);
    query.hasPreviousPage = previousPageParam !== undefined;
  }

  function resolvePageParams(): void {
    if (lastPageResponse) {
      resolveNextPageParam(lastPageResponse, query.pageParams[query.pageParams.length - 1]);
    } else {
      nextPageParam = undefined;
      query.hasNextPage = false;
    }

    if (firstPageResponse) {
      resolvePreviousPageParam(firstPageResponse, query.pageParams[0]);
    } else {
      previousPageParam = undefined;
      query.hasPreviousPage = false;
    }
  }

  async function fetchPage(pageParam: TPageParam, mode: 'replace' | 'append' | 'prepend', currentFetchId: number): Promise<void> {
    const pageIndex = mode === 'replace' ? 0 : query.pages.length;
    const response = await runWithRetry(() => fn(pageParam), retry, retryDelay);
    if (currentFetchId !== fetchId) return;

    const nextPages = mode === 'replace'
      ? [response.data]
      : mode === 'prepend'
        ? [response.data, ...query.pages]
        : [...query.pages, response.data];
    const nextPageParams = mode === 'replace'
      ? [pageParam]
      : mode === 'prepend'
        ? [pageParam, ...query.pageParams]
        : [...query.pageParams, pageParam];

    query.status = 'success';
    query.responseStatus = response.status ?? null;
    query.pagination = response.pagination ?? null;
    query.isPending = false;
    query.isError = false;
    query.error = null;
    query.isPlaceholderData = false;
    setPages(nextPages, nextPageParams);
    if (mode === 'replace') {
      firstPageResponse = response;
      lastPageResponse = response;
    } else if (mode === 'prepend') {
      firstPageResponse = response;
    } else {
      lastPageResponse = response;
    }
    response.onData?.((page: TPage) => updatePage(mode === 'prepend' ? 0 : pageIndex, page));
    resolvePageParams();
  }

  async function fetchFirstPage(): Promise<void> {
    if (activeFetch) return activeFetch;

    const currentFetchId = ++fetchId;
    activeFetch = runFetchFirstPage(currentFetchId);
    await activeFetch;
    activeFetch = null;
  }

  async function runFetchFirstPage(currentFetchId: number): Promise<void> {
    setFetchStatus('fetching');
    query.isError = false;
    query.error = null;

    try {
      await fetchPage(initialPageParam, 'replace', currentFetchId);
    } catch (err) {
      if (currentFetchId !== fetchId) return;

      query.status = 'error';
      query.responseStatus = getErrorResponseStatus(err);
      query.isPending = false;
      query.isError = true;
      query.error = err;
      query.hasNextPage = false;
      query.hasPreviousPage = false;
    } finally {
      if (currentFetchId !== fetchId) return;
      setFetchStatus('idle');
    }
  }

  async function fetchNextPage(): Promise<void> {
    if (!query.hasNextPage || nextPageParam === undefined) return;
    if (activeNextFetch) return activeNextFetch;

    const currentFetchId = ++fetchId;
    activeNextFetch = runFetchNextPage(currentFetchId, nextPageParam);
    await activeNextFetch;
    activeNextFetch = null;
  }

  async function fetchPreviousPage(): Promise<void> {
    if (!query.hasPreviousPage || previousPageParam === undefined) return;
    if (activePreviousFetch) return activePreviousFetch;

    const currentFetchId = ++fetchId;
    activePreviousFetch = runFetchPreviousPage(currentFetchId, previousPageParam);
    await activePreviousFetch;
    activePreviousFetch = null;
  }

  async function runFetchNextPage(currentFetchId: number, pageParam: TPageParam): Promise<void> {
    setFetchStatus('fetching');
    query.isFetchingNextPage = true;
    query.isError = false;
    query.error = null;

    try {
      await fetchPage(pageParam, 'append', currentFetchId);
    } catch (err) {
      if (currentFetchId !== fetchId) return;

      query.status = 'error';
      query.responseStatus = getErrorResponseStatus(err);
      query.isPending = false;
      query.isError = true;
      query.error = err;
    } finally {
      if (currentFetchId !== fetchId) return;
      query.isFetchingNextPage = false;
      setFetchStatus('idle');
    }
  }

  async function runFetchPreviousPage(currentFetchId: number, pageParam: TPageParam): Promise<void> {
    setFetchStatus('fetching');
    query.isFetchingPreviousPage = true;
    query.isError = false;
    query.error = null;

    try {
      await fetchPage(pageParam, 'prepend', currentFetchId);
    } catch (err) {
      if (currentFetchId !== fetchId) return;

      query.status = 'error';
      query.responseStatus = getErrorResponseStatus(err);
      query.isPending = false;
      query.isError = true;
      query.error = err;
    } finally {
      if (currentFetchId !== fetchId) return;
      query.isFetchingPreviousPage = false;
      setFetchStatus('idle');
    }
  }

  const dependencies = Array.isArray(source) ? [...source, _immediate] : source ? [source, _immediate] : _immediate;

  effect(
    () => {
      if (_immediate.value) {
        fetchFirstPage();
      }
    },
    dependencies,
    true
  );

  return query;
}
