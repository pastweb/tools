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
  return new Proxy(target as object, {
    get(obj, prop) {
      const value = Reflect.get(obj, prop);
      if (isObject(value)) {
        return createReadonlyState(name, value);
      }
      return value;
    },
    set() {
      throw new Error(`[createMicroStore] Cannot mutate state "${name}" directly. Use actions instead.`);
    },
    deleteProperty() {
      throw new Error(`[createMicroStore] Cannot delete properties from state "${name}". Use actions instead.`);
    },
  }) as Readonly<T>;
}
