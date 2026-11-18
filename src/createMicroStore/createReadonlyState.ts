import { isObject } from '../isObject';

/**
 * Creates a deeply readonly proxy of the target object.
 * Used internally to protect the exposed state from direct mutations.
 * 
 * @param name - Store name (used in error messages)
 * @param target - The object to make readonly
 * @returns A readonly proxy that throws on mutation attempts
 */
export function createReadonlyState<T>(name: string, target: T): Readonly<T> {
  const cache = new WeakMap<object, object>();

  function create(value: unknown): unknown {
    if (!isObject(value)) return value;
    if (cache.has(value as object)) return cache.get(value as object);

    const proxy = new Proxy(value as object, {
      get(obj, prop) {
        return create(Reflect.get(obj, prop));
      },
      set() {
        throw new Error(`[createMicroStore] Cannot mutate state "${name}" directly. Use actions instead.`);
      },
      deleteProperty() {
        throw new Error(`[createMicroStore] Cannot delete properties from state "${name}". Use actions instead.`);
      },
    });

    cache.set(value as object, proxy);
    return proxy;
  }

  return create(target) as Readonly<T>;
}
