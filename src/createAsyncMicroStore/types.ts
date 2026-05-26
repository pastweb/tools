import type { AsyncStore, AsyncStoreOptions } from '../createAsyncStore';
import type { MicroStoreCollectorOptions, CollectedStore } from '../createMicroStore';

export type MicroCollectorStoreOptions = Omit<AsyncStoreOptions, 'name' | 'store' | 'onInit'> & MicroStoreCollectorOptions & {
  onInit?: () => Promise<void> | void;
};

export type  MicroAsyncStore = AsyncStore<AsyncStoreOptions & MicroCollectorStoreOptions> & {
  store: CollectedStore;
};
