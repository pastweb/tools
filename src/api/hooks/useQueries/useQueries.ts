import { effect, reactive } from '../../../reactivity';
import { useQuery } from '../useQuery';
import type { QueryConfig } from '../useQuery';
import type { QueriesData, QueriesInfo, UseQueriesInfo, UseQueriesInput } from './types';

function normalizeQueriesConfig<T extends readonly QueryConfig<any>[]>(config: UseQueriesInput<T>): T {
  return Array.isArray(config)
    ? config as unknown as T
    : (config as { queries: T }).queries;
}

function getAggregateStatus(queries: readonly { status: 'pending' | 'success' | 'error' }[]) {
  if (queries.some(query => query.status === 'error')) return 'error';
  if (queries.some(query => query.status === 'pending')) return 'pending';
  return 'success';
}

/**
 * Creates multiple `useQuery` instances and exposes a reactive aggregate state.
 *
 * Each child query behaves exactly like a standalone `useQuery`. The aggregate
 * flags are convenience values:
 * - `status` is `error` if any child is in error, otherwise `pending` if any child
 *   is pending, otherwise `success`.
 * - `fetchStatus` is `fetching` while at least one child query is fetching.
 * - Boolean flags are true when at least one child query has that state.
 * - `data` and `errors` preserve the input query order.
 *
 * @param config - Either an array of {@link QueryConfig} objects or `{ queries }`.
 * @returns A reactive aggregate plus the child query states.
 *
 * @example
 * ```ts
 * const dashboard = useQueries({
 *   queries: [
 *     { fn: () => agent.get('/api/users'), retry: 2 },
 *     { fn: () => agent.get('/api/posts'), source: page },
 *   ],
 * });
 *
 * await dashboard.fetch();
 * ```
 */
export function useQueries<T extends readonly QueryConfig<any>[]>(config: UseQueriesInput<T>): UseQueriesInfo<T> {
  const queryConfigs = normalizeQueriesConfig(config);
  const queries = queryConfigs.map(queryConfig => useQuery(queryConfig)) as QueriesInfo<T>;

  const state = reactive<UseQueriesInfo<T>>({
    queries,
    data: queries.map(query => query.data) as QueriesData<T>,
    status: getAggregateStatus(queries),
    fetchStatus: queries.some(query => query.fetchStatus === 'fetching') ? 'fetching' : 'idle',
    responseStatuses: queries.map(query => query.responseStatus),
    isPending: queries.some(query => query.isPending),
    isLoading: queries.some(query => query.isLoading),
    isFetching: queries.some(query => query.isFetching),
    isError: queries.some(query => query.isError),
    errors: queries.map(query => query.error),
    isPlaceholderData: queries.some(query => query.isPlaceholderData),
    fetch: async () => {
      await Promise.all(queries.map(query => query.fetch()));
    },
  });

  function syncState() {
    state.data = queries.map(query => query.data) as QueriesData<T>;
    state.status = getAggregateStatus(queries);
    state.fetchStatus = queries.some(query => query.fetchStatus === 'fetching') ? 'fetching' : 'idle';
    state.responseStatuses = queries.map(query => query.responseStatus);
    state.isPending = queries.some(query => query.isPending);
    state.isLoading = queries.some(query => query.isLoading);
    state.isFetching = queries.some(query => query.isFetching);
    state.isError = queries.some(query => query.isError);
    state.errors = queries.map(query => query.error);
    state.isPlaceholderData = queries.some(query => query.isPlaceholderData);
  }

  effect(
    syncState,
    () => queries.flatMap(query => [
      query.data,
      query.status,
      query.fetchStatus,
      query.responseStatus,
      query.isPending,
      query.isLoading,
      query.isFetching,
      query.isError,
      query.error,
      query.isPlaceholderData,
    ]),
    true
  );

  return state;
}
