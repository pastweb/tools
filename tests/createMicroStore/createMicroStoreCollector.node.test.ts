import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMicroStore, createMicroStoreCollector } from '../../src/createMicroStore';
import { isAsyncStore } from '../../src/createAsyncStore';
import { STORE_REGISTRY } from '../../src/createMicroStore/constants';

vi.mock('../../src/createMicroStore/constants', () => ({
  STORE_REGISTRY: new Map(),
}));

describe('given the createMicroStoreCollector', () => {
  beforeEach(() => {
    STORE_REGISTRY.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    STORE_REGISTRY.clear();
  });

  it('given registered and explicit stores, when creating a collector, then hooks are available directly and through store', () => {
    const counterStore = createMicroStore('counter', () => ({
      state: { count: 0 },
      actions: { increment: () => {} },
    }));

    const userStore = createMicroStore('user', () => ({
      state: { name: 'John' },
      actions: { setName: () => {} },
    }));

    const collector = createMicroStoreCollector({ stores: [counterStore, userStore] });

    expect(Object.keys(collector)).toEqual(['counter', 'user']);
    expect(collector.counter).toBe(counterStore);
    expect(collector.store.user).toBe(userStore);
    expect(isAsyncStore(collector)).toBe(true);
  });

  it('given an initializer, when init is called repeatedly, then it runs once and resolves readiness', async () => {
    const onInit = vi.fn(async () => undefined);
    const collector = createMicroStoreCollector({
      name: 'app',
      stores: [],
      onInit,
    });

    await Promise.all([collector.init(), collector.init(), collector.init()]);

    expect(onInit).toHaveBeenCalledTimes(1);
    expect(collector.isStoreReady).toBe(true);
    await expect(collector.isReady).resolves.toBe(true);
  });

  it('given a store action, when the action runs, then the collector emits an inspectable event', () => {
    const useCounter = createMicroStore('counter', select => ({
      state: { count: 0 },
      actions: {
        increment() {
          select(state => state).count++;
        },
      },
    }));
    const collector = createMicroStoreCollector({ stores: useCounter });
    const listener = vi.fn();

    const unsubscribe = collector.subscribe(listener);
    collector.counter().increment();

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      type: 'action',
      store: 'counter',
      action: 'increment',
      state: { count: 1 },
    }));

    unsubscribe();
    collector.counter().increment();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('given circular state, when inspecting the collector, then snapshot serialization remains safe', () => {
    const circular: { name: string; self?: unknown } = { name: 'circular' };
    circular.self = circular;

    const useStore = createMicroStore('circular', () => ({
      state: circular,
      actions: {},
    }));
    const collector = createMicroStoreCollector({ stores: useStore });

    expect(collector.getSnapshot()).toEqual({
      circular: { name: 'circular', self: '[Circular]' },
    });
  });

  it('given an invalid explicit store, when creating a collector, then it throws a useful error', () => {
    expect(() => createMicroStoreCollector({ stores: vi.fn() as never })).toThrow(
      'Every supplied store must be created with createMicroStore'
    );
  });
});
