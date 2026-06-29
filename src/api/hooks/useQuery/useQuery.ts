import { effect, isRef, reactive, ref, type Ref } from '../../../reactivity';
import { runWithRetry } from '../utils';
import type { QueryConfig, QueryFetchStatus, QueryInfo, QueryStatus } from './types';

function getErrorResponseStatus(error: unknown): number | null {
  const status = (error as { response?: { status?: unknown } })?.response?.status;
  return typeof status === 'number' ? status : null;
}

/**
 * Creates a reactive query state machine powered by the library's `effect` + `reactive` primitives.
 *
 * The query automatically re-runs when:
 * - `immediate` becomes true (or the ref is true)
 * - Any value in `source` changes
 *
 * When the agent used inside `fn` has caching enabled, `useQuery` subscribes to `onData` so
 * that external cache updates (from other queries or after mutations) keep the returned state fresh.
 *
 * Supply `queryKey?: unknown[]` (recommended) to give the query a stable identity:
 *
 *   useQuery({
 *     fn: () => agent.get(`/items/${id}`, { queryKey: ['item', id] })
 *   });
 *
 * @param config - Query configuration (fn, queryKey, sources, immediate, initialData, …).
 *   Cache lifecycle options (`fetchOnExpired`, `fetchOnInvalidate`, `removeOnExpired`, `removeOnInvalidate`)
 *   are passed to `agent.get(...)` inside `fn`, not on this config object.
 * @returns A reactive `QueryInfo` object that can be observed via `effect` or in templates.
 *   `status` tracks lifecycle (`pending`, `success`, `error`), `fetchStatus` tracks
 *   transport activity (`idle`, `fetching`), and `responseStatus` stores the HTTP status.
 *
 * @example
 * ```ts
 * const users = useQuery({
 *   fn: () => agent.get('/api/users'),
 *   retry: 2,
 *   retryDelay: 250,
 * });
 * ```
 */
export function useQuery<T>(config: QueryConfig<T>): QueryInfo<T> {
  const { fn, initialData, source, immediate = true, retry, retryDelay } = config;
  const _immediate = isRef(immediate) ? immediate as Ref<boolean> : typeof immediate === 'boolean' ? ref(immediate as boolean) : ref(true);
  const initialStatus: QueryStatus = initialData === undefined ? 'pending' : 'success';
  const initialFetchStatus: QueryFetchStatus = _immediate.value ? 'fetching' : 'idle';

  const query = reactive<QueryInfo<T>>({
    status: initialStatus,
    fetchStatus: initialFetchStatus,
    responseStatus: null,
    data: initialData ?? null,
    pagination: null,
    isPending: initialStatus === 'pending',
    isLoading: initialStatus === 'pending' && initialFetchStatus === 'fetching',
    isFetching: initialFetchStatus === 'fetching',
    isError: false,
    error: null,
    isPlaceholderData: !!initialData,
    fetch: fetchData,
  });
  let activeFetch: Promise<void> | null = null;
  let fetchId = 0;

  /**
   * Callback used to keep the query state in sync when the underlying cache
   * entry is updated by another consumer (via onData).
   */
  function updateData(d: T): void {
    query.data = d;
    query.status = 'success';
    query.isPending = false;
    query.isLoading = false;
    query.isError = false;
    query.error = null;
    query.isPlaceholderData = false;
  }

  function setFetchStatus(fetchStatus: QueryFetchStatus): void {
    query.fetchStatus = fetchStatus;
    query.isFetching = fetchStatus === 'fetching';
    query.isLoading = query.status === 'pending' && fetchStatus === 'fetching';
  }

  /** Internal fetch executor. Updates all reactive flags and wires `onData` for cache-driven updates. */
  async function fetchData() {
    if (activeFetch) return activeFetch;

    const currentFetchId = ++fetchId;
    activeFetch = runFetch(currentFetchId);
    await activeFetch;
    activeFetch = null;
  }

  async function runFetch(currentFetchId: number) {
    setFetchStatus('fetching');
    query.isError = false;
    query.error = null;

    try {
      const response = await runWithRetry(fn, retry, retryDelay);
      if (currentFetchId !== fetchId) return;

      query.isError = false;
      query.error = null;
      query.status = 'success';
      query.responseStatus = response.status ?? null;
      query.isPending = false;
      
      if (query.data !== response.data) {
        query.data = response.data;
        query.isPlaceholderData = false;
        query.pagination = response.pagination ?? null;
        response.onData?.(updateData);
      }
    } catch (err) {
      if (currentFetchId !== fetchId) return;

      query.status = 'error';
      query.responseStatus = getErrorResponseStatus(err);
      query.isPending = false;
      query.isError = true;
      query.error = err;
    } finally {
      if (currentFetchId !== fetchId) return;

      setFetchStatus('idle');
    }
  }

  // Effect to run fetch when dependencies change
  const dependencies = Array.isArray(source) ? [...source, _immediate] : source ? [source, _immediate] : _immediate;
  
  effect(
    () => {
      if (_immediate.value) {
        fetchData();
      }
    },
    dependencies, // Track computed dependencies
    true
  );

  return query;
}
