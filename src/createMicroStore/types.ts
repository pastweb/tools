import type { Reactive } from '../reactivity';

export type Selector<T, S> = (state: S) => T;

/**
 * Configuration returned by the setup function passed to `createMicroStore`.
 * Defines the initial state and available actions.
 */
export type MicroStoreConfig<
  S extends Record<string, any>,
  A extends Record<string, (...args: any[]) => any>
> = {
  /** Initial state of the store */
  state: S;
  /** Actions that can mutate the internal reactive state */
  actions: A;
};

/**
 * The shape of the store returned by `useMicroStore()` when **no selector** is provided.
 * The `state` property is deeply readonly and protected against direct mutations.
 */
export type MicroStore<
  S extends Record<string, any> = any,
  A extends Record<string, (...args: any[]) => any> = any
> = {
  /** Readonly reactive state. Direct mutations will throw an error. */
  state: Readonly<Reactive<S>>;
} & A;

/**
 * Overloaded type for the store hook returned by `createMicroStore`.
 * Supports two usage patterns:
 * - No selector: returns full store with readonly state
 * - With selector: returns store with selected value wrapped in readonly
 */
export type UseMicroStore<
  S extends Record<string, any>,
  A extends Record<string, (...args: any[]) => any>
> = {
  /** Get full store with readonly state */
  (): MicroStore<S, A>;
  /** Get store with selected portion of state (any nested value) */
  <T>(selector: Selector<T, S>): { state: Readonly<T> } & A;
};

/**
 * Options for `createMicroStoreCollector`
 */
export interface MicroStoreCollectorOptions {
  /** 
   * If provided, returns only the store with this name.
   * The return value will be a record with a single entry.
   */
  name?: string;

  /** 
   * Array of store hooks to force-load/register.
   * Useful when stores are defined in separate modules and need to be pre-registered.
   */
  stores: UseMicroStore<any, any> | UseMicroStore<any, any>[];
}

/**
 * Record of collected micro stores.
 * 
 * Key = store name  
 * Value = `useMicroStore` hook function
 */
export type CollectedStore = {
  [key: string]: UseMicroStore<any, any>;
};
