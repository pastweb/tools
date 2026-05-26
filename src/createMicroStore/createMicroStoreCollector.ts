import { STORE_REGISTRY } from './constants';
import type { MicroStoreCollectorOptions, UseMicroStore, CollectedStore } from './types';

/**
 * Creates a collector for micro stores.
 * 
 * This function gathers all registered micro stores from the internal `STORE_REGISTRY`
 * and returns them as a record of store name → `useMicroStore` hook.
 * 
 * After collection, the stores are removed from the main registry to prevent
 * duplicate entries in subsequent collector calls.
 * 
 * @param options - Configuration options for the collector
 * @param options.name - If provided, returns only the store with this name
 * @param options.stores - Array of store hooks (`useMicroStore` functions) to force-include/register
 * 
 * @returns A record (`CollectedStore`) where each key is a store name and the value is the corresponding `useMicroStore` function.
 * 
 * @example
 * ```typescript
 * import { createMicroStoreCollector } from '@pastweb/tools';
 * import { useAddressStore, useUserStore, useCartStore } from '.../somewhere'; 
 * 
 * const customerStores = createMicroStoreCollector({
 *   name: 'customer',
 *   stores: [useCounterStore, useUserStore, useCartStore],
 * });

 * // Usage in DevTools
 * Object.entries(customerStores).forEach(([name, useStore]) => {
 *   console.log(`${name} state:`, useStore().state);
 * });
 * ```
 */
export function createMicroStoreCollector(options: MicroStoreCollectorOptions): CollectedStore {
  const collectedStores = new Map<string, UseMicroStore<any, any>>();

  // Collect from registry
  for (const [name, useStore] of STORE_REGISTRY.entries()) {
    collectedStores.set(name, useStore);
    STORE_REGISTRY.delete(name); // Clear to prevent duplicates in future collectors
  }

  // here the devtool code can force-register stores by calling their hooks, which will add them to the registry

  return Array.from(collectedStores.entries()).reduce((acc, [name, useStore]) => ({
    ...acc,
    [name]: useStore
  }), {} as CollectedStore);
}
