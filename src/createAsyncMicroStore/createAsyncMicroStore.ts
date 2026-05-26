import { noop } from '../noop';
import { createAsyncStore } from '../createAsyncStore';
import { createMicroStoreCollector } from '../createMicroStore';
import type { MicroAsyncStore, MicroCollectorStoreOptions } from './types';

/**
 * Creates an asynchronous micro store that combines store collection with lazy initialization.
 * 
 * This utility wraps `createMicroStoreCollector` inside an async-ready store pattern,
 * allowing you to delay store usage until initialization is complete (useful for app bootstrapping,
 * code-splitting, or when stores depend on async setup like authentication, config loading, etc.).
 * 
 * @param options - Configuration options for the async micro store
 * @param options.name - The name of the store (used for identification and debugging)
 * @param options.onInit - Async function called during initialization. Receives the collected stores as argument.
 * @param options.stores - (Optional) Array of store hooks to force-include in the collector
 * @param options.timeout - (Optional) Timeout in milliseconds for the store to become ready (inherited from `createAsyncStore`)
 * 
 * @returns A `MicroAsyncStore` instance with:
 *   - `isReady`: Promise that resolves when the store is initialized
 *   - `init()`: Async function to trigger initialization
 *   - `store`: Record of all collected `useMicroStore` hooks
 *   - `setStoreReady()`: Method to manually mark the store as ready
 * 
 * @example
 * ```typescript
 * const useAsyncStores = createAsyncMicroStore({
 *   name: 'appStores',
 *   stores: [useCounterStore, useUserStore, useThemeStore],
 *   onInit: async (collectedStores) => {
 *     console.log('Initializing stores...', Object.keys(collectedStores));
 *     
 *     // Example: load user data after stores are collected
 *     await fetchInitialData(collectedStores.user);
 *   },
 *   timeout: 15000
 * });
 *
 * // Usage in app bootstrap
 * await useAsyncStores.init();
 * 
 * // Now safe to use stores
 * const counter = useAsyncStores.store.counter();
 * const user = useAsyncStores.store.user();
 * 
 * // Or wait for readiness
 * await useAsyncStores.isReady;
 * ```
 * 
 * @remarks
 * - The store is **not ready** until `init()` is called and `onInit` completes.
 * - `onInit` receives the collected stores record as its argument.
 * - If `onInit` is not provided, a noop function is used.
 * - The internal store name will be prefixed with `MicroStore:` for better debugging.
 */
export function createAsyncMicroStore(options: MicroCollectorStoreOptions): MicroAsyncStore {
  const { onInit, ...restOptions } = options;
  const store = createMicroStoreCollector(restOptions);
  const asyncStore = createAsyncStore<MicroAsyncStore>({ 
    ...options, 
    name: `MicroStore:${restOptions.name}`,
    store,
    onInit: init,
  });

  async function init() {
    const { onInit = noop } = asyncStore.options as MicroCollectorStoreOptions;
    await onInit(store);
    asyncStore.setStoreReady();
  };

  return asyncStore;
}
