export type EffectCallback<T> = (next: Partial<T>, prev: Partial<T>) => void | Promise<void>;
