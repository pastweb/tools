import type { Computed, Reactive, Ref } from '../../../reactivity';
import type { Pagination, QueryResponse } from '../../createApiAgent';
import type { RetryDelayOption, RetryOption } from '../types';
import type { QueryFetchStatus, QueryStatus } from '../useQuery';

export interface InfiniteQueryInitialData<TPage, TPageParam> {
  /** Pages already available before the first fetch. */
  pages: TPage[];
  /** Page params matching `pages` by index. */
  pageParams: TPageParam[];
}

/**
 * Configuration for the `useInfiniteQuery` hook.
 *
 * @example
 * ```ts
 * const posts = useInfiniteQuery({
 *   initialPageParam: 1,
 *   fn: page => agent.get(`/posts?_page=${page}&_limit=10`),
 *   getNextPageParam: lastPage => lastPage.pagination?.current + 1,
 * });
 * ```
 */
export interface InfiniteQueryConfig<TPage, TPageParam = unknown> {
  /** The first page param used by `fetch()` and the initial automatic fetch. */
  initialPageParam: TPageParam;
  /** Fetches one page for the supplied page param. */
  fn: (pageParam: TPageParam) => Promise<QueryResponse<TPage>>;
  /**
   * Computes the next page param from the last response.
   * Return `undefined`, `null`, or `false` when no next page exists.
   * If omitted, the hook tries to use the agent pagination object.
   */
  getNextPageParam?: (
    lastPage: QueryResponse<TPage>,
    pages: TPage[],
    lastPageParam: TPageParam,
    pageParams: TPageParam[],
  ) => TPageParam | null | undefined | false;
  /**
   * Computes the previous page param from the first response.
   * Return `undefined`, `null`, or `false` when no previous page exists.
   * If omitted, the hook tries to use the agent pagination object.
   */
  getPreviousPageParam?: (
    firstPage: QueryResponse<TPage>,
    pages: TPage[],
    firstPageParam: TPageParam,
    pageParams: TPageParam[],
  ) => TPageParam | null | undefined | false;
  /**
   * Reactive source(s) that should reset the infinite query and fetch the first page
   * when they change.
   */
  source?: (() => any) | Ref<any> | Reactive<any> | Computed<any> | Array<(() => any) | Ref<any> | Reactive<any> | Computed<any>>;
  /**
   * Controls whether the first page runs automatically.
   * - `true` (default): runs immediately.
   * - `false`: wait for `fetch()`.
   * - `Ref<boolean>`: reacts to the ref value.
   */
  immediate?: boolean | Ref<boolean>;
  /** Initial pages to expose before the first real fetch. */
  initialData?: InfiniteQueryInitialData<TPage, TPageParam>;
  /** Retry behavior for failed page fetches. */
  retry?: RetryOption;
  /** Delay before retry attempts. */
  retryDelay?: RetryDelayOption;
}

/**
 * Reactive object returned by `useInfiniteQuery()`.
 */
export interface InfiniteQueryInfo<TPage, TPageParam = unknown> {
  /** Query lifecycle status. */
  status: QueryStatus;
  /** Network execution status. */
  fetchStatus: QueryFetchStatus;
  /** Numeric HTTP status from the last successful response or Axios error response. */
  responseStatus: number | null;
  /** Pages in fetch order. */
  pages: TPage[];
  /** Alias for `pages`, for parity with `useQuery.data`. */
  data: TPage[];
  /** Page params matching `pages` by index. */
  pageParams: TPageParam[];
  /** Pagination object from the last fetched page, when provided by the agent. */
  pagination: Pagination<any>['pagination'] | null;
  /** True while no successful real response has been received yet. */
  isPending: boolean;
  /** True only during the first page fetch. */
  isLoading: boolean;
  /** True during any fetch. */
  isFetching: boolean;
  /** True while `fetchNextPage()` is appending a page. */
  isFetchingNextPage: boolean;
  /** True while `fetchPreviousPage()` is prepending a page. */
  isFetchingPreviousPage: boolean;
  /** True when the last resolved page indicates that another page can be fetched. */
  hasNextPage: boolean;
  /** True when the first resolved page indicates that a previous page can be fetched. */
  hasPreviousPage: boolean;
  /** True after a page fetch rejected. */
  isError: boolean;
  /** The rejection reason when `isError` is true. */
  error: any;
  /** True when `pages` currently comes from `initialData`. */
  isPlaceholderData: boolean;
  /** Fetches the first page and resets existing pages. */
  fetch: () => Promise<void>;
  /** Fetches and appends the next page when available. */
  fetchNextPage: () => Promise<void>;
  /** Fetches and prepends the previous page when available. */
  fetchPreviousPage: () => Promise<void>;
}
