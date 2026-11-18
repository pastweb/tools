import { createAsyncStore, type AsyncStore, type AsyncStoreOptions } from '../createAsyncStore';
import { ASYNC_STORE } from '../createAsyncStore/constants';
import { STORE_REGISTRY } from './constants';
import type {
  CollectedStore,
  MicroStoreCollector,
  MicroStoreCollectorInfo,
  MicroStoreInfo,
  MicroStoreListener,
  MicroStoreCollectorOptions,
} from './types';

/**
 * Collects registered micro-stores and provides their shared lifecycle.
 *
 * The returned object keeps the collected hooks available directly by name and
 * also exposes an asynchronous readiness contract. This makes the collector a
 * single integration point for application bootstrapping, inspection, and
 * future development-tool bridges.
 *
 * @param options - Collector name, explicit stores, timeout, and initializer.
 * @returns A collected store record with async lifecycle and inspection APIs.
 *
 * @example
 * ```ts
 * import { createMicroStoreCollector } from '@pastweb/tools';
 * import { useAuthStore, useSettingsStore } from './stores';
 *
 * export const appStores = createMicroStoreCollector({
 *   name: 'app',
 *   stores: [useAuthStore, useSettingsStore],
 *   onInit: async stores => {
 *     stores.auth.init();
 *   },
 * });
 *
 * await appStores.init();
 * const snapshot = appStores.inspect();
 * ```
 */
export function createMicroStoreCollector(options: MicroStoreCollectorOptions): MicroStoreCollector {
  const {
    name = 'microStores',
    stores = [],
    timeout,
    onInit,
  } = options;

  const collectedStores: CollectedStore = {};
  const explicitStores = Array.isArray(stores) ? stores : [stores];

  for (const [storeName, useStore] of STORE_REGISTRY.entries()) {
    collectedStores[storeName] = useStore;
  }

  for (const useStore of explicitStores) {
    const storeName = useStore?.storeName;

    if (!storeName) {
      throw new Error('[createMicroStoreCollector] Every supplied store must be created with createMicroStore.');
    }

    collectedStores[storeName] = useStore;
  }

  const collectorListeners = new Set<MicroStoreListener>();
  const unsubscribeStores = Object.values(collectedStores).map(useStore =>
    useStore.subscribe(event => {
      for (const listener of collectorListeners) {
        try {
          listener(event);
        } catch (listenerError) {
          console.error('[createMicroStoreCollector] Listener failed', listenerError);
        }
      }
    })
  );

  let asyncStore: AsyncStore<AsyncStoreOptions>;
  let initPromise: Promise<void> | undefined;

  const init = (): Promise<void> => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        await onInit?.(collectedStores);
        asyncStore.setStoreReady();
      } catch (error) {
        initPromise = undefined;
        throw error;
      }
    })();

    return initPromise;
  };

  asyncStore = createAsyncStore<AsyncStore<AsyncStoreOptions>>({
    name: `MicroStore:${name}`,
    ...(timeout === undefined ? {} : { timeout }),
    onInit: init,
  });

  const collector = { ...collectedStores } as MicroStoreCollector;

  Object.defineProperties(collector, {
    store: { value: collectedStores, enumerable: false },
    options: { get: () => asyncStore.options, enumerable: false },
    isStoreReady: { get: () => asyncStore.isStoreReady, enumerable: false },
    isReady: { get: () => asyncStore.isReady, enumerable: false },
    init: { value: init, enumerable: false },
    setStoreReady: { value: asyncStore.setStoreReady, enumerable: false },
    getSnapshot: {
      value: () => Object.fromEntries(
        Object.entries(collectedStores).map(([storeName, useStore]) => [storeName, useStore.getSnapshot()])
      ),
      enumerable: false,
    },
    inspect: {
      value: (): MicroStoreCollectorInfo => ({
        name,
        isReady: asyncStore.isStoreReady,
        stores: Object.fromEntries(
          Object.entries(collectedStores).map(([storeName, useStore]) => [storeName, useStore.inspect() as MicroStoreInfo])
        ),
        state: Object.fromEntries(
          Object.entries(collectedStores).map(([storeName, useStore]) => [storeName, useStore.getSnapshot()])
        ),
      }),
      enumerable: false,
    },
    subscribe: {
      value: (listener: MicroStoreListener): (() => void) => {
        collectorListeners.add(listener);
        return () => collectorListeners.delete(listener);
      },
      enumerable: false,
    },
    dispose: {
      value: () => unsubscribeStores.forEach(unsubscribe => unsubscribe()),
      enumerable: false,
    },
  });

  Object.defineProperty(collector, ASYNC_STORE, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return collector;
}
