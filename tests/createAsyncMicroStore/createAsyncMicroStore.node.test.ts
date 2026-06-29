import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAsyncMicroStore } from '../../src/createAsyncMicroStore';
import { createMicroStore } from '../../src/createMicroStore';

describe('given the createAsyncMicroStore factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('given config with name, stores and onInit, when createAsyncMicroStore is called, then the returned async store has isReady, isStoreReady, store and init properties', () => {
    const asyncStore = createAsyncMicroStore({
      name: 'test',
      stores: [vi.fn()],
      onInit: vi.fn(),
    });

    expect(asyncStore).toHaveProperty('isReady');
    expect(asyncStore).toHaveProperty('isStoreReady');
    expect(asyncStore.isStoreReady).toBe(false);
    expect(asyncStore).toHaveProperty('store');
    expect(asyncStore).toHaveProperty('init');
  });

  it('given a micro store hook, when createAsyncMicroStore is called with it in the stores array, then the store property exposes the hook under its name', () => {
    const useTestStore = createMicroStore('testStore', () => ({
      state: { value: 42 },
      actions: {},
    }));

    const asyncStore = createAsyncMicroStore({
      name: 'app',
      stores: [useTestStore],
      onInit: vi.fn(),
    });

    expect(asyncStore.store).toHaveProperty('testStore');
    expect(asyncStore.store.testStore).toBe(useTestStore);
  });

  it('given a name in config, when createAsyncMicroStore is called, then options.name is prefixed as "MicroStore:<name>"', () => {
    const asyncStore = createAsyncMicroStore({
      name: 'dashboard',
      stores: [vi.fn()],
      onInit: vi.fn(),
    });

    expect(asyncStore.options.name).toBe('MicroStore:dashboard');
  });
});
