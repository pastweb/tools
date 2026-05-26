import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMicroStore, createMicroStoreCollector } from '../../src/createMicroStore';
import { STORE_REGISTRY } from '../../src/createMicroStore/constants';

// Mock the registry to keep tests isolated
vi.mock('./constants', () => ({
  STORE_REGISTRY: new Map(),
}));

describe('createMicroStoreCollector', () => {
  beforeEach(() => {
    STORE_REGISTRY.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    STORE_REGISTRY.clear();
  });

  it('should collect all registered stores', () => {
    const counterStore = createMicroStore('counter', () => ({
      state: { count: 0 },
      actions: { increment: () => {} },
    }));

    const userStore = createMicroStore('user', () => ({
      state: { name: 'John' },
      actions: { setName: () => {} },
    }));

    expect(STORE_REGISTRY.size).toBe(2);
    expect(STORE_REGISTRY.has('counter')).toBe(true);
    expect(STORE_REGISTRY.has('user')).toBe(true);

    const collector = createMicroStoreCollector({ stores: [counterStore, userStore] });

    expect(Object.keys(collector)).toEqual(['counter', 'user']);
    expect(typeof collector.counter).toBe('function');
    expect(typeof collector.user).toBe('function');
  });

  it('should clear the registry after collecting stores', () => {
    const tempStore = createMicroStore('temp', () => ({
      state: { value: 123 },
      actions: {},
    }));

    expect(STORE_REGISTRY.size).toBe(1);

    createMicroStoreCollector({ stores: tempStore });

    expect(STORE_REGISTRY.size).toBe(0);
  });

  it('should return functional store hooks', () => {
    const todosStore = createMicroStore('todos', () => ({
      state: { items: [] },
      actions: { addTodo: (text: string) => {} },
    }));

    const collector = createMicroStoreCollector({ stores: todosStore });
    const todos = collector.todos();

    expect(todos).toHaveProperty('state');
    expect(todos).toHaveProperty('addTodo');
    expect(Array.isArray(todos.state.items)).toBe(true);
  });

  it('should handle options.stores gracefully', () => {
    const authStore = createMicroStore('auth', () => ({
      state: { isLoggedIn: false },
      actions: {},
    }));

    const collector = createMicroStoreCollector({ stores: [authStore] });
    expect(collector).toHaveProperty('auth');
  });
});
