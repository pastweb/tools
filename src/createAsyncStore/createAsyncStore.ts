import { immutableProperty } from '../immutableProperty';
import { ASYNC_STORE } from './constants';
import type { AsyncStoreOptions } from './types';

/**
 * Creates an asynchronous store with the given options.
 *
 * @template T The type of the store to be created.
 * @param {AsyncStoreOptions} options The options for creating the asynchronous store.
 * @param {string} options.storeName The name of the store. This is required for better error debugging.
 * @param {number} [options.timeout=20000] The timeout limit in milliseconds for initializing the store.
 * @returns {T} The created asynchronous store.
 * @throws Will throw an error if the `storeName` option is not set.
 *
 * @example
 * const storeOptions = {
 *   storeName: 'myStore',
 *   timeout: 30000,
 * };
 * const myStore = createAsyncStore(storeOptions);
 */
export function createAsyncStore<T>(options: AsyncStoreOptions): T {
  const { name, timeout = 20000, store, onInit } = options;
  
  if (!name) {
    throw Error('The "name" option must be set for a better error debugging.');
  }
  
  let storeReadyInt: any = null;
  
  const asyncStore = {
    options,
    isStoreReady: false,
    isReady: new Promise(checkReady),
    setStoreReady,
    init : onInit || init,
    store: store || {},
  };


  /**
   * Checks if the store is ready at intervals and resolves the promise when it is ready.
   *
   * @param {(value: boolean) => void} resolve The resolve function of the promise.
   */
  function checkReady(resolve: (value: boolean) => void) {
    storeReadyInt = setInterval(() => {
      if (asyncStore.isStoreReady) {
        clearInterval(storeReadyInt);
        resolve(true);
        return;    
      }
    }, 16);
  }

  /**
   * Sets the store as ready.
   */
  function setStoreReady(): void {
    asyncStore.isStoreReady = true;
  }

  /**
   * Initializes the store and sets a timeout to throw an error if the init function is not implemented or if the initialization time is longer that the timeout value.
   */
  function init() {
    setTimeout(() => {
      throw Error(`The "init" function must be set to call the "setStoreReady" in "${name}", or the the store it is not initialized under ${timeout / 1000} seconds.`);
    }, timeout);
  }

  Object.defineProperty(asyncStore, ASYNC_STORE, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  immutableProperty(asyncStore, ['setStoreReady', 'isReady']);

  return asyncStore as T;
}
