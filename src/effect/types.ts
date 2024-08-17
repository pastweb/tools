export type EffectInfo<T> = {
  newValues: Partial<T>;
  oldValues: Partial<T>;
};

export type EffectCallback<T> = (info: EffectInfo<T>) => void | Promise<void>;
