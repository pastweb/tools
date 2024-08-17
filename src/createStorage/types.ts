export type GetCallBack = (storage: Storage, value: any) => void | any | Promise<void | any>;
export type SetCallBack = (storage: Storage, value: any, store: boolean) => void | any | Promise<void | any>;
export type RemoveCallBack = (storage: Storage, path: string, justLocalStorage?: boolean) => void | Promise<void>;

export type GetAction = { [path: string]: GetCallBack };
export type SetAction = { [path: string]: SetCallBack };
export type RemoveAction = { [path: string]: RemoveCallBack };

export type StorageConfig = {
  dbName?: string;
  storeName?: string;
  type?: 'localStorage' | 'indexedDB';
  defaultSettings?: Record<string, any>;
  onGet?: GetAction;
  onSet?: SetAction;
  onRemove?: RemoveAction;
};

export interface Storage {
  get: (path: string) => Promise<any>;
  set: (path: string, value: any, store?: boolean) => Promise<void>;
  remove: (path: string, justLocalStorage?: boolean) => Promise<void>;
  isStored: (path: string) => boolean;
  isStoreReady: Promise<true>;
};
