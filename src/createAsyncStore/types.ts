export interface AsyncStoreOptions {
  storeName: string;
  timeout?: number;
  [propName: string]: any;
};

export interface AsyncStore<Options extends AsyncStoreOptions> {
  readonly $$asyncStore: true;
  readonly options: Options;
  readonly isStoreReady: boolean;
  readonly isReady: Promise<boolean>;
  readonly setStoreReady: () => void;
  init: () => void;
};

export type Wait = Promise<any> | (() => Promise<any>) | AsyncStore<any>;
