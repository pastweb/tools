import { isObject } from '../isObject';
import { Wait, AsyncStore } from './types';

/**
 * Normalizes an array of asynchronous operations into an array of promises.
 * 
 * @param {Wait | Wait[]} wait - A single or an array of asynchronous operations.
 *                                Each operation can be a promise, a function returning a promise,
 *                                or an object representing an asynchronous store.
 * @returns {Promise<any>[]} An array of promises.
 *
 * @throws {Error} Throws an error if an invalid type is encountered in the wait array.
 *
 * @example
 * // Single promise
 * const singlePromise = Promise.resolve('done');
 * normalizeAsyncQueue(singlePromise); // [singlePromise]
 * 
 * @example
 * // Array of promises and functions
 * const promise1 = Promise.resolve('done');
 * const promise2 = () => Promise.resolve('done');
 * normalizeAsyncQueue([promise1, promise2]); // [promise1, promise2()]
 * 
 * @example
 * // Async store
 * const asyncStore = {
 *   $$asyncStore: true,
 *   isStoreReady: false,
 *   isReady: new Promise(resolve => resolve(true)),
 *   init: () => { asyncStore.isStoreReady = true; }
 * };
 * normalizeAsyncQueue(asyncStore); // [asyncStore.isReady]
 */
export function normalizeAsyncQueue(wait: Wait | Wait[] ): Promise<any>[] {
  return (Array.isArray(wait) ? wait : [ wait ] as Wait[]).map((wait: Wait) => {
    if (isObject(wait) && (wait as AsyncStore<any>).$$asyncStore) {
      if (!(wait as AsyncStore<any>).isStoreReady) {
        (wait as AsyncStore<any>).init();
      }

      return (wait as unknown as AsyncStore<any>).isReady;
    } else if (typeof wait === 'function') {
      return wait();
    }

    return wait as Promise<any>;
  }) as Promise<any>[];
}
