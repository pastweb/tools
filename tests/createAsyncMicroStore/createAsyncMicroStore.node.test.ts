import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAsyncMicroStore } from '../../src/createAsyncMicroStore';
import { createMicroStore } from '../../src/createMicroStore';

describe('createAsyncMicroStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an async micro store with correct structure', () => {
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

  it('should collect and attach stores correctly', () => {
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

  it('should set correct storeName', () => {
    const asyncStore = createAsyncMicroStore({
      name: 'dashboard',
      stores: [vi.fn()],
      onInit: vi.fn(),
    });

    expect(asyncStore.options.name).toBe('MicroStore:dashboard');
  });
});
