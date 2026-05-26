import { isSSR } from '../isSSR';
import { effect, isRef, reactive, ref, type Ref } from '../reactivity';
import type { QueryConfig, QueryInfo } from './types';

/**
 * Creates a reactive query that fetches data using the provided function and updates based on dependencies.
 * @param config - Configuration object with fetch function, immediate flag, and optional initial data.
 * @returns A reactive object with query state and fetch method.
 */
export function useQuery<T>(config: QueryConfig<T>): QueryInfo<T> {
  const { fn, initialData, source, immediate = true, SSRWait = true } = config;
  const _immediate = isRef(immediate) ? immediate as Ref<boolean> : typeof immediate === 'boolean' ? ref(immediate as boolean) : ref(true);

  // Create a shared buffer for signaling (only once)
  let sharedBuffer: SharedArrayBuffer | null = null;
  let syncArray: Int32Array | null = null;

  function initSharedBuffer() {
    if (sharedBuffer) return;
    try {
      sharedBuffer = new SharedArrayBuffer(4); // 4 bytes = 1 Int32
      syncArray = new Int32Array(sharedBuffer);
    } catch (e) {
      console.warn('[useQuery] SharedArrayBuffer not available:', e);
    }
  }

  const query = reactive<QueryInfo<T>>({
    data: initialData ?? null,
    pagination: null,
    isPending: _immediate.value,
    isLoading: _immediate.value, // alias of isPending
    isFetching: _immediate.value,
    isError: false,
    error: null,
    isPlaceholderData: !!initialData,
    fetch: fetchData,
  });

  // update data if the cache is updated from someone else
  function updateData(d: T): void { query.data = d; }

  // Blocking wait using Atomics.wait (SSR only)
  function waitForFetch(signalArray: Int32Array) {
    // Wait until the value at index 0 is no longer 0
    Atomics.wait(signalArray, 0, 0); // timeout = infinite
  }

  // Fetch logic
  async function fetchData() {
    query.isFetching = true;
    query.isError = false;
    query.error = null;

    try {
      const response = await fn();
      
      if (query.data !== response.data) {
        query.data = response.data;
        query.isPlaceholderData = false;
        query.pagination = response.pagination ?? null;
        response.onData(updateData);
      }
    } catch (err) {
      query.isError = true;
      query.error = err;
    } finally {
      query.isFetching = false;
      query.isPending = false;
      query.isLoading = false;
    }

    // === SSR Blocking using Atomics.wait ===
    if (isSSR && syncArray) {
      Atomics.store(syncArray, 0, 1);        // Signal that we're done
      Atomics.notify(syncArray, 0);          // Wake up any waiting threads
    }
  }

  // Effect to run fetch when dependencies change
  const dependencies = Array.isArray(source) ? [...source, _immediate] : source ? [source, _immediate] : _immediate;
  
  effect(
    () => {
      if (_immediate.value || query.isPending) {
        if (isSSR && SSRWait) initSharedBuffer();
        fetchData();
      }
    },
    dependencies, // Track computed dependencies
    true
  );

  // SSR: Expose a method to wait for this query during rendering
  if (isSSR && syncArray) waitForFetch(syncArray);

  return query;
}
