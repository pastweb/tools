import { debounce, type DebouceCallback } from '../debounce';
import { EffectCallback } from './types';

/**
 * Creates a reactive effect on the specified properties of the target object. Whenever one of these properties changes, the provided callback function is executed with details about the change. Changes are batched and debounced to improve performance.
 *
 * @param target - The target object to observe.
 * @param callback - The callback function to execute when a specified property changes. The callback receives an object containing the `newValues`, `oldValues`, and the properties (`prop`) that changed.
 * @param filter - Optional list of property names, symbols, or numbers to observe. If not provided, all properties are observed.
 *
 * @typeParam T - The type of the target object.
 *
 * @example
 * ```typescript
 * import { effect } from './effect';
 *
 * const obj = { a: 1, b: 2 };
 *
 * effect(obj, ({ newValues, oldValues }) => {
 *   console.log(`Changes detected:`, newValues, oldValues);
 * }, 'a');
 *
 * obj.a = 3; // Logs: Changes detected: { a: 3 } { a: 1 }
 * obj.b = 4; // No log since 'b' is not observed
 * ```
 */
export function effect<T extends object = {}>(
  target: T,
  callback: EffectCallback<T>,
  ...filter: (Extract<keyof T, string> | number | symbol)[]): void {
  const _filter: (string | symbol)[] = filter.map((prop: string | number | symbol) => typeof prop === 'symbol' ? prop :  `${prop}`);

  const weakCb = new WeakRef<EffectCallback<T>>(callback);
  const cbMap = new Map<string | symbol, { curr: any, old: any }>();
  
  const effectCallback = (cb: EffectCallback<T>, newValues: Partial<T>, oldValues: Partial<T>) => (async () => {
    await cb(newValues, oldValues);
    cbMap.clear();
  })();

  const applyEffect = (cb: EffectCallback<T>, curr: any, old: any, prop: string | symbol) => {
    cbMap.set(prop, { curr, old });
    const newValues: Partial<T> = {};
    const oldValues: Partial<T> = {};

    cbMap.forEach(({ curr, old }, prop) => {
      (newValues as Record<string | symbol, any>)[prop] = curr;
      (oldValues as Record<string | symbol, any>)[prop] = old;
    });

    debounce(effectCallback(cb, newValues, oldValues) as unknown as DebouceCallback, 16);
  };

  Object.entries(Object.getOwnPropertyDescriptors(target as Record<string | symbol, any>)).forEach(([property, descriptor]) => {
    if (_filter.length && !_filter.includes(property)) return;

    const originalSet = descriptor.set;
    const originalGet = descriptor.get;
    
    Object.defineProperty(target as Record<string | symbol, any>, property, {
      get: () => originalGet ? originalGet() : descriptor.value,
      set: (value: any) => {
        const cb = weakCb.deref();
        
        if (!cb) {
          if (originalSet) {
            originalSet(value);
            descriptor.set = originalSet;
          } else {
            delete descriptor.set;
            descriptor.value = value;
          }

          if (originalGet) descriptor.get = originalGet;
          else delete descriptor.get;
          return;
        }

        if (value === (target as Record<string | symbol, any>)[property]) return;
        
        const oldValue = descriptor.value;

        if (originalSet) {
          originalSet(value);
        } else descriptor.value = value;

        applyEffect(cb, descriptor.value, oldValue, property);
      },
    });
  });
}
