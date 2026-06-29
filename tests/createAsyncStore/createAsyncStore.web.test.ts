import { describe, it, expect } from 'vitest';
import { createAsyncStore, isAsyncStore } from '../../src/createAsyncStore';
import { AsyncStore } from '../../src/createAsyncStore/types';

describe('given the createAsyncStore factory', () => {
  const name = 'testStore';

  it('given a name, when createAsyncStore is called without timeout, then it creates an async store with default timeout, isAsyncStore true, isStoreReady false, isReady as promise and set/init functions', () => {
    const store = createAsyncStore<AsyncStore<any>>({ name });

    expect(isAsyncStore(store)).toBe(true);
    expect(store.isStoreReady).toBe(false);
    expect(store.isReady).toBeInstanceOf(Promise);
    expect(typeof store.setStoreReady).toBe('function');
    expect(typeof store.init).toBe('function');
  });

  it('given a store, when setStoreReady is called, then the isReady promise resolves to true', async () => {
    const store = createAsyncStore<AsyncStore<any>>({ name });

    // Set store ready to true
    store.setStoreReady();

    // Wait for the isReady promise to resolve
    await expect(store.isReady).resolves.toBe(true);
  });

  it('given a name and custom timeout, when createAsyncStore is called, then it creates the store with isAsyncStore true and the expected api regardless of timeout', () => {
    const timeout = 10000;
    const store = createAsyncStore<AsyncStore<any>>({ name, timeout });

    expect(isAsyncStore(store)).toBe(true);
    expect(store.isStoreReady).toBe(false);
    expect(store.isReady).toBeInstanceOf(Promise);
    expect(typeof store.setStoreReady).toBe('function');
    expect(typeof store.init).toBe('function');
  });
});
