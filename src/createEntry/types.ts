import { EventCallback, RemoveListener } from '../createEventEmitter';

export type EntryOptions = {
  EntryComponent?: any;
  entryElement?: HTMLElement;
  querySelector?: string;
  initData?: Record<string, any>;
};

export interface Entry<O extends EntryOptions> {
  readonly $$entry: true;
  EntryComponent: any;
  ssrId?: string;
  querySelector?: string;
  entryElement?: HTMLElement;
  options: O;
  on: (eventName: string, eventCallback: EventCallback) => RemoveListener;
  emit: (eventName: string, ...args: any[]) => void;
  removeListener: (eventCallbackKey: symbol) => void;
  memoSSR: (htmlPromiseFunction: () => Promise<string>) => void;
  getComposedSSR: () => Promise<string>;
  setEntryElement: (entryElement: HTMLElement) => void;
  setQuerySelector: (querySelector: string) => void;
  setOptions: (options: O) => void;
  mergeOptions: (options: O) => void;
  setEntryComponent: (Component: any) => void;
  mount?: (...args: any[]) => void;
  update?: (...args: any[]) => void;
  unmount?: (...args: any[]) => void;
};
