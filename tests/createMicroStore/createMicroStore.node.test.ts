import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, computed, effect } from '../../src/reactivity';
import { createMicroStore, type MicroStore, type MicroStoreActionsContext } from '../../src/createMicroStore';

describe('given the createMicroStore factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('given a name and selector setup with state+actions, when useStore(), then the store instance has state values and action fns', () => {
    const useStore = createMicroStore('test', select => ({
      state: { count: 0, name: 'test' },
      actions: {
        increment: (by = 1) => {
          const state = select(s => s);
          state.count += by;
        },
        setName: (name: string) => {
          const state = select(s => s);
          state.name = name;
        },
      }
    }));

    const store = useStore();

    expect(store.state.count).toBe(0);
    expect(store.state.name).toBe('test');
    expect(typeof store.increment).toBe('function');
    expect(typeof store.setName).toBe('function');
  });

  it('given store with nested state, when useStore with selector for name and for count, then state holds the selected primitive and actions still present', () => {
    const useStore = createMicroStore('test', select => ({
      state: {
        user: {
          name: 'John',
          age: 30,
        },
        count: 42,
      },
      actions: {
        increment: () => {
          const state = select(s => s);
          state.count++;
        },
      },
    }));

    const nameStore = useStore(s => s.user.name);
    const countStore = useStore(s => s.count);

    expect(nameStore.state).toBe('John');
    expect(countStore.state).toBe(42);
    expect(typeof nameStore.increment).toBe('function');
  });

  it('given a store, when attempting direct mutation or delete on state, then it throws the cannot mutate/delete error', () => {
    const useStore = createMicroStore('test', select => ({
      state: {
        count: 0,
      },
      actions: {
        increment: () => {
          const state = select(s => s);
          state.count++;
        },
      },
    }));

    const store = useStore();

    expect(() => {
      // @ts-expect-error - testing runtime protection
      store.state.count = 999;
    }).toThrow(/Cannot mutate state "test" directly/);

    expect(() => {
      // @ts-expect-error
      delete store.state.count;
    }).toThrow(/Cannot delete properties/);
  });

  it('given counter store with nested, when calling actions increment/reset, then both full store state and selected inner state reflect the changes', () => {
    const useStore = createMicroStore('counter', select => ({
      state: {
        count: 0,
        innerCount: {
          value: 0,
        },
      },
      actions: {
        increment: (by = 1) => {
          const state = select(s => s);
          state.count += by;
          state.innerCount.value += by;
        },
        reset: () => {
          const state = select(s => s);
          state.count = 0;
          state.innerCount.value = 0;
        },
      },
    }));

    const store = useStore();
    const countStore = useStore(s => s.innerCount);

    store.increment(5);
    expect(store.state.count).toBe(5);
    expect(countStore.state.value).toBe(5);

    store.reset();
    expect(store.state.count).toBe(0);
    expect(countStore.state.value).toBe(0);
  });

  it('given store with increment action, when effect tracks state.count and action called, then effectValue updates after tick', async () => {
    const useStore = createMicroStore('test', select => ({
      state: {
        count: 0,
      },
      actions: {
        increment: () => {
          const state = select(s => s);
          state.count++;
        },
      },
    }));

    const { state, increment } = useStore();

    let effectValue = 0;

    effect(() => {
      effectValue = state.count;
    });

    increment();
    // Give reactivity a tick (your debounce might be 16ms)
    await new Promise(r => setTimeout(r, 20));

    expect(effectValue).toBe(1);
  });

  it('given attempt to create store with reserved "state" action name, when createMicroStore, then it throws "Action name \\"state\\" is reserved"', () => {
    expect(() => {
      createMicroStore('bad', () => ({
        state: { count: 0 },
        actions: {
          state: () => {}, // forbidden
          increment: () => {},
        }
      }));
    }).toThrow(/Action name "state" is reserved/);
  });

  it('given user store with deep nested and list, when use selectors and call actions, then deep state and list update correctly and selected reflect', () => {
    const useStore = createMicroStore('user', select => ({
      state: {
        user: {
          profile: {
            name: 'Alice',
            settings: {
              dark: true,
            },
          },
        },
        list: [1, 2, 3],
      },
      actions: {
        toggleDark: () => {
          const state = select(s => s);
          state.user.profile.settings.dark = false;
        },
        addToList: (n: number) => {
          const state = select(s => s);
          state.list.push(n);
        },
      },
    }));

    const settingsStore = useStore(s => s.user.profile.settings);
    const listStore = useStore(s => s.list);

    expect(settingsStore.state.dark).toBe(true);
    settingsStore.toggleDark();
    expect(settingsStore.state.dark).toBe(false);

    expect(listStore.state).toEqual([1, 2, 3]);
    listStore.addToList(4);
    expect(listStore.state).toEqual([1, 2, 3, 4]);
  });

  it('given actions using this.state, when called, then they mutate the reactive state correctly', () => {
    const useStore = createMicroStore('this-state', select => ({
      state: {
        count: 0,
        name: 'test',
      },
      actions: {
        increment(this: MicroStoreActionsContext<{ count: number; name: string }>, by = 1) {
          this.state.count += by;
        },
        setName(this: MicroStoreActionsContext<{ count: number; name: string }>, name: string) {
          this.state.name = name;
        },
        reset() {
          const state = select(s => s);
          state.count = 0;
        },
      },
    }));

    const store = useStore();

    store.increment(3);
    expect(store.state.count).toBe(3);

    store.setName('updated');
    expect(store.state.name).toBe('updated');

    store.reset();
    expect(store.state.count).toBe(0);
    expect(store.state.name).toBe('updated');
  });

  it('given store selecting full, when access state.text and attempt mutation, then throws cannot mutate', () => {
    const useStore = createMicroStore('test', select => ({
      state: {
        text: 'hello',
      },
      actions: {
        update: (v: string) => {
          const state = select(s => s);
          state.text = v;
        },
      },
    }));

    const textStore = useStore(s => s);

    expect(textStore.state.text).toBe('hello');

    expect(() => {
      // @ts-expect-error
      textStore.state.text = 'world';
    }).toThrow(/Cannot mutate state/);
  });
});
