export interface AsyncStoreOptions {
  name: string;
  timeout?: number;
  store?: any;
  onInit?: (store: AsyncStore<any>) => void;
  [propName: string]: any;
};

export interface AsyncStore<Options extends AsyncStoreOptions> {
  readonly options: Options;
  readonly isStoreReady: boolean;
  readonly isReady: Promise<boolean>;
  readonly setStoreReady: () => void;
  init: () => void;
  store?: any;
};

export type Wait = Promise<any> | (() => Promise<any>) | AsyncStore<any>;
