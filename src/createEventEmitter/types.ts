export type RemoveListener = {
  readonly eventCallbackKey: symbol;
  readonly removeListener: () => void;
};

export type EventCallback = (...args: any[]) => void;

export interface EventEmitter {
  readonly emit: (eventName: string, ...args: any[]) => void;
  readonly on: (eventName: string, eventCallback: EventCallback) => RemoveListener;
  readonly removeListener: (eventCallbackKey: symbol) => void;
};
