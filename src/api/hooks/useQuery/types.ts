import type { Computed, Reactive, Ref } from '../../../reactivity';
import type { QueryResponse, Pagination } from '../../createApiAgent';
import type { RetryDelayOption, RetryOption } from '../types';

export type QueryStatus = 'pending' | 'success' | 'error';
export type QueryFetchStatus = 'idle' | 'fetching';

/**
 * Configuration for the `useQuery` hook.
 *
 * Cache-related options (`queryKey`, `expireIn`, `fetchOnExpired`, `fetchOnInvalidate`,
 * `removeOnExpired`, `removeOnInvalidate`) are **not** set on this config — pass them
 * to `agent.get(...)` inside `fn`. See {@link QueryOptions}.
 */
export interface QueryConfig<T> {
  /**
   * The function that performs the actual fetch. Usually returns `agent.get(...)`.
   * When using a caching agent the returned `QueryResponse` may contain cached data.
   *
   * @example
   * ```ts
   * fn: () => agent.get('/users', { queryKey: ['users'], expireIn: '5m', fetchOnExpired: '1s' })
   * ```
   */
  fn: () => Promise<QueryResponse<T>>;
  /**
   * Reactive source(s) that should trigger a re-fetch when they change.
   * Can be a single ref/computed/reactive getter or an array of them.
   * Required when `immediate` is false and you want the query to react to changes later.
   */
  source?: (() => any) | Ref<any> | Reactive<any> | Computed<any> | Array<(() => any) | Ref<any> | Reactive<any> | Computed<any>>;
  /**
   * Controls whether the query runs automatically.
   * - `true` (default): runs immediately.
   * - `false`: does not run until you call `fetch()` or set a ref to true.
   * - `Ref<boolean>`: reacts to the ref value.
   */
  immediate?: boolean | Ref<boolean>;
  /** Initial value for `data`. While waiting for the real response, `isPlaceholderData` will be true. */
  initialData?: T;
  /**
   * Retry behavior for failed query executions.
   *
   * - `false` or omitted: do not retry.
   * - `true`: retry up to 3 times.
   * - `number`: retry up to that many times after the first failed attempt.
   * - function: receives the 1-based failure count and error; return `true` to retry.
   *
   * @example
 * ```ts
 * useQuery({
 *   fn: () => agent.get('/users'),
 *   retry: 2,
 *   retryDelay: 250,
 * });
 * ```
   */
  retry?: RetryOption;
  /**
   * Delay before retry attempts. Numbers are milliseconds, strings use `stringToMs`,
   * and functions receive the 1-based failure count and error.
   */
  retryDelay?: RetryDelayOption;
};

/**
 * The reactive object returned by `useQuery()`.
 */
export interface QueryInfo<T> {
  /** Query lifecycle status. `pending` means no successful real response has been received yet. */
  status: QueryStatus;
  /** Network execution status. */
  fetchStatus: QueryFetchStatus;
  /** Numeric HTTP status from the last successful response or Axios error response. */
  responseStatus: number | null;
  /**
   * True while the query has not produced its first successful real response.
   * A disabled query (`immediate: false`) can be pending without fetching.
   */
  isPending: boolean;
  /** True only during the first fetch, before a successful real response exists. */
  isLoading: boolean;
  /** True during any fetch, including background refetches. */
  isFetching: boolean;
  /** True after a fetch that rejected. */
  isError: boolean;
  /** The response data (or `initialData` while `isPlaceholderData` is true). */
  data: T | null;
  /** Parsed pagination info when available. */
  pagination: Pagination<any>['pagination'] | null;
  /** The rejection reason when `isError` is true. */
  error: any;
  /** True when `data` currently holds the `initialData` value. */
  isPlaceholderData: boolean;
  /** Manually trigger the query (useful with `immediate: false`). */
  fetch: () => Promise<void>;
};
