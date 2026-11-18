import type { Reactive } from '../reactivity';
import type { AsyncStoreOptions } from '../createAsyncStore';

export type Selector<T, S> = (state: S) => T;

/**
 * Context available as `this` inside micro-store actions.
 * Provides direct access to the mutable internal reactive state.
 */
export type MicroStoreActionsContext<S extends Record<string, any>> = {
  state: Reactive<S>;
};

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
} & MicroStoreHandle;

/** A serialisable state snapshot exposed by a micro-store. */
export type MicroStoreSnapshot = unknown;

/** A state/action event emitted by a micro-store. */
export interface MicroStoreEvent {
  type: 'action';
  store: string;
  action: string;
  args: unknown[];
  state: MicroStoreSnapshot;
  timestamp: number;
  duration: number;
  error?: unknown;
}

/** Listener invoked after a micro-store action completes or fails. */
export type MicroStoreListener = (event: MicroStoreEvent) => void;

/** Read-only inspection and subscription API attached to a store hook. */
export interface MicroStoreHandle {
  readonly storeName: string;
  getSnapshot: () => MicroStoreSnapshot;
  inspect: () => MicroStoreInfo;
  subscribe: (listener: MicroStoreListener) => () => void;
}

/** Serializable metadata and state returned by store inspection. */
export interface MicroStoreInfo {
  name: string;
  actions: string[];
  state: MicroStoreSnapshot;
}

/**
 * Options for `createMicroStoreCollector`
 */
export interface MicroStoreCollectorOptions {
  /** Name used to identify the collector and its async lifecycle. */
  name?: string;

  /** 
   * Array of store hooks to force-load/register.
   * Useful when stores are defined in separate modules and need to be pre-registered.
   */
  stores?: UseMicroStore<any, any> | UseMicroStore<any, any>[];

  /** Optional timeout used by the collector readiness promise. */
  timeout?: AsyncStoreOptions['timeout'];

  /** Optional asynchronous initialization callback. */
  onInit?: (stores: CollectedStore) => void | Promise<void>;
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

/**
 * Collector returned by `createMicroStoreCollector`.
 *
 * Store hooks remain available directly by name for compatibility, while the
 * non-enumerable async and inspection members provide a single integration
 * point for application bootstrapping and future devtools bridges.
 */
export type MicroStoreCollector = CollectedStore & {
  readonly store: CollectedStore;
  readonly options: AsyncStoreOptions;
  readonly isStoreReady: boolean;
  readonly isReady: Promise<boolean>;
  readonly init: () => void | Promise<void>;
  readonly setStoreReady: () => void;
  readonly getSnapshot: () => Record<string, MicroStoreSnapshot>;
  readonly inspect: () => MicroStoreCollectorInfo;
  readonly subscribe: (listener: MicroStoreListener) => () => void;
  readonly dispose: () => void;
};

/** Serializable collector metadata used by editor/debug integrations. */
export interface MicroStoreCollectorInfo {
  name: string;
  isReady: boolean;
  stores: Record<string, MicroStoreInfo>;
  state: Record<string, MicroStoreSnapshot>;
}
