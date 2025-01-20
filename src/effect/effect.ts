import { debounce } from '../debounce';
import { EffectCallback } from './types';

/**
 * Creates a reactive effect on the specified properties of the target object. Whenever one of these properties changes, the provided callback function is executed with details about the change. Changes are batched and debounced to improve performance.
 *
 * @param target - The target object to observe.
 * @param callback - The callback function to execute when a specified property changes. The callback receives two object parameters containing the `newValues` (next), and `oldValues` prev, and the properties (`prop`) that changed.
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
 * effect(obj, (next, prev) => {
 *   console.log(`Changes detected:`, next, prev);
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
  const weakCb = new WeakRef<EffectCallback<T>>(callback);
  const _filter: (string | symbol)[] = filter.map((prop: string | number | symbol) => typeof prop === 'symbol' ? prop :  `${prop}`);

  let next: Record<string, any> = {};
  let prev: Record<string, any> = {};


  const dcb = debounce((nextValue, prevValue) => {
    next = { ...target, ...nextValue };
    prev = { ...target, ...prevValue };
    callback(next as Partial<T>, prev as Partial<T>);
    next = {};
    prev = {};
  }, 16);

  Object.entries(Object.getOwnPropertyDescriptors(target as Record<string | symbol, any>)).forEach(([property, descriptor]) => {
    if (_filter.length && !_filter.includes(property)) return;

    const originalGet = descriptor.get;
    const originalSet = descriptor.set;

    Object.defineProperty(target, property, {
      get: () => originalGet ? originalGet() : descriptor.value,
      set(value: any) {
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

        if (descriptor.value === value) return;

        dcb({ [property]: value }, { [property]: descriptor.value });

        if (originalSet) originalSet(value);
        else descriptor.value = value;
      }
    });
  });
}
