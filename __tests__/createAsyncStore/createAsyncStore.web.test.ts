import { createAsyncStore } from '../../src/createAsyncStore';
import { AsyncStore, AsyncStoreOptions } from '../../src/createAsyncStore/types';

describe('createAsyncStore', () => {
  const storeName = 'testStore';

  it('should throw an error if storeName is not provided', () => {
    expect(() => createAsyncStore<{ $$asyncStore: true }>({} as AsyncStoreOptions)).toThrowError('The "name" option must be set for a better error debugging.');
  });

  it('should create an asynchronous store with default timeout', () => {
    const store = createAsyncStore<{ $$asyncStore: true }>({ storeName }) as AsyncStore<any>;

    expect(store.$$asyncStore).toBe(true);
    expect(store.isStoreReady).toBe(false);
    expect(store.isReady).toBeInstanceOf(Promise);
    expect(typeof store.setStoreReady).toBe('function');
    expect(typeof store.init).toBe('function');
  });

  it('should resolve isReady promise when store is ready', async () => {
    const store = createAsyncStore<{ $$asyncStore: true }>({ storeName }) as AsyncStore<any>;

    // Set store ready to true
    store.setStoreReady();

    // Wait for the isReady promise to resolve
    await expect(store.isReady).resolves.toBe(true);
  });

  it('should create an asynchronous store with custom timeout', () => {
    const timeout = 10000;
    const store = createAsyncStore<{ $$asyncStore: true }>({ storeName, timeout }) as AsyncStore<any>;

    expect(store.$$asyncStore).toBe(true);
    expect(store.isStoreReady).toBe(false);
    expect(store.isReady).toBeInstanceOf(Promise);
    expect(typeof store.setStoreReady).toBe('function');
    expect(typeof store.init).toBe('function');
  });
});
