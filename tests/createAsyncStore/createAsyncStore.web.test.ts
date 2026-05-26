import { describe, it, expect } from 'vitest';
import { createAsyncStore, isAsyncStore } from '../../src/createAsyncStore';
import { AsyncStore } from '../../src/createAsyncStore/types';

describe('createAsyncStore', () => {
  const name = 'testStore';

  it('should create an asynchronous store with default timeout', () => {
    const store = createAsyncStore<AsyncStore<any>>({ name });

    expect(isAsyncStore(store)).toBe(true);
    expect(store.isStoreReady).toBe(false);
    expect(store.isReady).toBeInstanceOf(Promise);
    expect(typeof store.setStoreReady).toBe('function');
    expect(typeof store.init).toBe('function');
  });

  it('should resolve isReady promise when store is ready', async () => {
    const store = createAsyncStore<AsyncStore<any>>({ name });

    // Set store ready to true
    store.setStoreReady();

    // Wait for the isReady promise to resolve
    await expect(store.isReady).resolves.toBe(true);
  });

  it('should create an asynchronous store with custom timeout', () => {
    const timeout = 10000;
    const store = createAsyncStore<AsyncStore<any>>({ name, timeout });

    expect(isAsyncStore(store)).toBe(true);
    expect(store.isStoreReady).toBe(false);
    expect(store.isReady).toBeInstanceOf(Promise);
    expect(typeof store.setStoreReady).toBe('function');
    expect(typeof store.init).toBe('function');
  });
});
