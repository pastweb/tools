import { noop } from '../noop';
import { createAsyncStore } from '../createAsyncStore';
import { createMatchScheme } from './createMatchScheme';
import type { SchemeOptionsAsyncStore, ColorSchemeAsyncStore } from './types';

/**
 * Creates an asynchronous store for managing color schemes.
 *
 * This function initializes an asynchronous store specifically for handling
 * color scheme preferences and system theme detection. It integrates with
 * `createMatchScheme` to track and manage color mode changes.
 *
 * @param options - Configuration options for the asynchronous store.
 *                  - `storeName` (optional): The name of the store, defaulting to `'ColorSchemeStore'`.
 *                  - `datasetName` (optional): The dataset attribute name for storing the color scheme.
 *                  - `defaultMode` (optional): The default mode ('auto', 'light', or 'dark').
 *                  - `initStore` (optional): An asynchronous function that runs during store initialization.
 *
 * @returns A `ColorSchemeAsyncStore` instance that provides:
 *          - `matchScheme`: An object managing color scheme detection.
 *          - `init`: A no-op function for initialization.
 *          - `setStoreReady`: A function that marks the store as ready.
 *
 * @example
 * // Example usage:
 * const colorSchemeStore = createMatchSchemeAsyncStore({
 *   defaultMode: 'auto',
 *   datasetName: 'theme',
 *   initStore: async (matchScheme) => {
 *     console.log('Initializing with:', matchScheme.getInfo());
 *   }
 * });
 */
export function createMatchSchemeAsyncStore(options: SchemeOptionsAsyncStore = {}): ColorSchemeAsyncStore {
  // Create an async store for managing color scheme preferences
  const store = createAsyncStore<ColorSchemeAsyncStore>({
    ...options,
    storeName: 'ColorSchemeStore'
  }) as ColorSchemeAsyncStore;

  // Attach the match scheme instance to handle color scheme detection
  store.matchScheme = createMatchScheme(options);

  // No-op initialization function
  store.init = noop;

  // Extract the optional async initialization function
  const { initStore = noop } = options;

  // Execute the async initialization function and mark the store as ready
  (async () => {
    await initStore(store.matchScheme);
    store.setStoreReady();
  })();

  return store;
}
