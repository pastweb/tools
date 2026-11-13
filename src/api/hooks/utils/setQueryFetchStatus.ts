import type { QueryFetchStatus, QueryInfo } from '../useQuery/types';

/**
 * Updates the shared transport flags for a regular or infinite query.
 * @example
 * ```ts
 * setQueryFetchStatus(query, 'fetching');
 * ```
 */
export function setQueryFetchStatus(
  query: Pick<QueryInfo<unknown>, 'status' | 'fetchStatus' | 'isFetching' | 'isLoading'>,
  fetchStatus: QueryFetchStatus,
): void {
  query.fetchStatus = fetchStatus;
  query.isFetching = fetchStatus === 'fetching';
  query.isLoading = query.status === 'pending' && fetchStatus === 'fetching';
}
