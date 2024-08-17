import { isObject } from '../isObject';

/**
 * Removes a property from an object based on a dot-separated path. The operation can be performed
 * either mutably (modifying the original object) or immutably (returning a new object).
 *
 * @param target - The object from which the property should be removed.
 * @param path - A dot-separated string that represents the path of the property to remove.
 * @param immutable - Optional. If `true`, the function returns a new object with the property removed,
 * otherwise, it modifies the original object in place. Defaults to `false`.
 * @returns The modified object if `immutable` is `true`, otherwise `void`.
 * 
 * @throws Will return the target object unmodified if it is not an object or if the path is empty.
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 42 } } };
 * remove(obj, 'a.b.c'); // obj becomes { a: { b: {} } }
 * 
 * const newObj = remove(obj, 'a.b.c', true); // returns a new object with the 'c' property removed
 * ```
 */
export function remove(target: Record<string, any>, path: string, immutable = false): void | Record<string, any> {
  if (!isObject(target) || !path.length) return target;

  const [ prop, ...rest ] = path.split('.');

  if (rest.length && isObject(target[prop])) {
    if (immutable) {
      return Object.freeze(Object.entries(target).reduce((acc, [propName, value]) => ({
        ...acc,
        ...prop !== propName ? { [propName]: value } : { [propName]: remove(value, rest.join('.'), true) },
      }), {}));
    } else {
      remove(target[prop], rest.join('.'));
    }
  } else {
    if (immutable) {
      return Object.freeze(Object.entries(target).reduce((acc, [propName, value]) => ({
        ...acc,
        ...prop !== propName ? { [propName]: value } : {},
      }), {}));
    } else {
      delete target[prop];
    }
  }
}
