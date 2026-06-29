import type { QueryConfig, QueryFetchStatus, QueryInfo, QueryStatus } from '../useQuery';

export type QueryDataFromConfig<T> = T extends QueryConfig<infer Data> ? Data : never;

export type QueriesInfo<T extends readonly QueryConfig<any>[]> = {
  [K in keyof T]: T[K] extends QueryConfig<any> ? QueryInfo<QueryDataFromConfig<T[K]>> : never;
};

export type QueriesData<T extends readonly QueryConfig<any>[]> = {
  [K in keyof T]: T[K] extends QueryConfig<any> ? QueryDataFromConfig<T[K]> | null : never;
};

/**
 * Configuration for the `useQueries` hook.
 *
 * Accepts the same query configs used by {@link useQuery}. Each child query keeps
 * its own `source`, `immediate`, `retry`, `retryDelay`, cache callbacks, and manual
 * `fetch()` behavior.
 *
 * @example
 * ```ts
 * const queries = useQueries({
 *   queries: [
 *     { fn: () => agent.get('/users') },
 *     { fn: () => agent.get('/posts'), immediate: false },
 *   ],
 * });
 * ```
 */
export interface UseQueriesConfig<T extends readonly QueryConfig<any>[]> {
  /** Query configurations to create and coordinate. */
  queries: T;
}

export type UseQueriesInput<T extends readonly QueryConfig<any>[]> = UseQueriesConfig<T> | T;

/**
 * The reactive object returned by `useQueries()`.
 */
export interface UseQueriesInfo<T extends readonly QueryConfig<any>[]> {
  /** Child query states in the same order as the input configs. */
  queries: QueriesInfo<T>;
  /** Convenience array of each child query's current `data`. */
  data: QueriesData<T>;
  /** Aggregate lifecycle status. */
  status: QueryStatus;
  /** Aggregate fetch status. */
  fetchStatus: QueryFetchStatus;
  /** Current child query HTTP response statuses, preserving input order. */
  responseStatuses: Array<number | null>;
  /** True while at least one child query has not produced its first successful real response. */
  isPending: boolean;
  /** True while at least one child query is loading its first response. */
  isLoading: boolean;
  /** True while at least one child query is fetching. */
  isFetching: boolean;
  /** True when at least one child query is currently in an error state. */
  isError: boolean;
  /** Current child query errors, preserving input order. */
  errors: unknown[];
  /** True when at least one child query is holding placeholder data. */
  isPlaceholderData: boolean;
  /** Manually trigger all child queries. */
  fetch: () => Promise<void>;
}
