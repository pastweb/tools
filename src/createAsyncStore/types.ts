export interface AsyncStoreOptions {
  name: string;
  timeout?: number;
  onInit?: (...args: any[]) => any;
};

export interface AsyncStore<Options extends AsyncStoreOptions> {
  readonly options: Options;
  readonly isStoreReady: boolean;
  readonly isReady: Promise<boolean>;
  readonly setStoreReady: () => void;
  init: () => void; 
};

export type Wait = Promise<any> | (() => Promise<any>) | AsyncStore<any>;
