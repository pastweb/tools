import { reactive, type Reactive } from '../reactivity';
import { createReadonlyState } from './createReadonlyState';
import { STORE_REGISTRY } from './constants';
import type { MicroStoreConfig, UseMicroStore, Selector, MicroStore } from './types';

/**
 * Creates a lightweight reactive micro-store with selector support and readonly state.
 * 
 * Built on top of your custom reactivity system (`reactive` + `computed`).
 * 
 * @param name - Unique name of the store (used in error messages)
 * @param setup - Function that receives a temporary `select` helper and returns store config
 * @returns A hook function that can be called with or without a selector
 * 
 * @example
 * ```typescript
 * const useCounterStore = createMicroStore('counter', select => ({
 *   state: {
 *     count: 0,
 *     name: 'My Counter'
 *   },
 *   actions: {
 *     increment: (by = 1) => {
 *       const state = select(s => s);          // Get full state
 *       state.count += by;        // Internal mutation (allowed)
 *     },
 *     decrement: (by = 1) => {
 *       const state = select(s => s);
 *       state.count -= by;
 *     },
 *     setName: (newName: string) => {
 *       const state = select(s => s);
 *       state.name = newName;
 *     },
 *   },
 * }));
 *
 * // === Usage ===
 *
 * // 1. Full state
 * const store = useCounterStore();
 * console.log(store.state.count);
 * store.increment(5);                    // Works via action
 *
 * // 2. With selector (any nested value)
 * const countStore = useCounterStore(s => s.count);
 * console.log(countStore.state);         // Readonly<number>
 *
 * const nameStore = useCounterStore(s => s.name);
 * console.log(nameStore.state);          // Readonly<string>
 *
 * // Works with your effect system
 * effect(() => {
 *   const count = useCounterStore(s => s.count).state;
 *   console.log('Count changed:', count);
 * });
 * ```
 * 
 * @remarks
 * - The exposed `.state` is **readonly** both at TypeScript level and runtime.
 * - All mutations must go through `actions`.
 * - Selectors can return any value (primitives, objects, arrays, nested properties).
 * - Changes in state via actions are automatically reflected in all selector views.
 */
export function createMicroStore<
  S extends Record<string, any>,
  A extends Record<string, (...args: any[]) => any>
>(
  name: string,
  setup: (select: <T>(fn: Selector<T, S>) => T) => MicroStoreConfig<S, A>
): UseMicroStore<S, A> {
  let reactiveState: Reactive<S>;
  let actions: A;

  // Temporary select used only during setup
  const setupSelect = <T>(selector: Selector<T, S>): T => {
    return selector(reactiveState as any);
  };

  // Run setup
  const result = setup(setupSelect);
  const initialState = (result.state || {}) as S;
  const initialActions = (result.actions || {}) as A;

  // Safety check: prevent "state" key in actions
  if ('state' in initialActions) {
    throw new Error(`[createMicroStore] Action name "state" is reserved and cannot be used in store "${name}"`);
  }

  // Initialize deeply reactive state (mutable internally)
  reactiveState = reactive({ ...initialState }, true);
  actions = initialActions;

  // Main store function
  function useMicroStore<T>(selector?: Selector<T, S>): any {
    const readonlyFullState = createReadonlyState(name, reactiveState);

    if (selector) {
      return {
        state: selector(readonlyFullState as S),
        ...actions,
      };
    }

    return {
      state: readonlyFullState,
      ...actions,
    } as MicroStore<S, A>;
  }

  // Register store in global registry for devtools/collector
  if (STORE_REGISTRY.has(name)) {
    console.warn(`[createMicroStore] Store with name "${name}" is already registered. Overwriting.`);
  }
  STORE_REGISTRY.set(name, useMicroStore as UseMicroStore<any, any>);

  return useMicroStore as UseMicroStore<S, A>;
}
