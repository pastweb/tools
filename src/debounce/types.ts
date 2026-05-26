export type DebouceCallback = (...args: any[]) => any & {
  cancel: () => void;
  flush: () => void;
};
