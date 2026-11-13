import { effect, isRef, reactive, ref } from '../../../reactivity';
import { setAsQuery } from './setAsQuery';
import { disposeQuery, fetchData, updateData } from './utils';
import type { Ref } from '../../../reactivity';
import type { QueryConfig, QueryFetchStatus, QueryInfo, QuerySettings, QueryStatus } from './types';

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
  const { initialData, source, immediate = true } = config;
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
    extensions: null,
    isPlaceholderData: !!initialData,
    fetch: () => fetchData(settings),
    dispose: () => disposeQuery(settings),
  });
  const settings: QuerySettings<T> = {
    config: { ...config },
    query,
    activeFetch: null,
    fetchId: 0,
    disposed: false,
    onData: data => updateData(settings, data),
  };

  // Effect to run fetch when dependencies change
  const dependencies = Array.isArray(source) ? [...source, _immediate] : source ? [source, _immediate] : _immediate;
  
  effect(
    () => {
      if (_immediate.value && !settings.disposed) {
        fetchData(settings);
      }
    },
    dependencies, // Track computed dependencies
    true
  );

  setAsQuery(query);

  return query;
}
