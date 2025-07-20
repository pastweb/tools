import { isObject } from '../isObject';
import { defaultOptions } from './constants';
import type { UpdateOptions } from './types';

/**
 * Updates the properties of a target object with values from a source object. 
 * The update can be shallow or deep, and specific properties can be excluded from the update.
 *
 * @template T - The type of the target object.
 * 
 * @param target - The target object that will be updated.
 * @param toUpdate - An object containing the properties and values to update in the target.
 * @param options - Optional settings for the update operation.
 * @param options.shallow - A boolean indicating whether to perform a shallow update (default is `false`).
 *                          If `true`, nested objects will not be deeply updated.
 * @param options.exclude - A property or array of properties to exclude from the update. 
 *                          These properties in the target will not be modified.
 * 
 * @returns void - The target object is updated in place.
 * 
 * @example
 * ```typescript
 * const target = { a: 1, b: { c: 2 } };
 * const toUpdate = { a: 10, b: { c: 20 } };
 * update(target, toUpdate);
 * // target is now { a: 10, b: { c: 20 } }
 * 
 * const toUpdate2 = { a: 100, b: { d: 30 } };
 * update(target, toUpdate2, { shallow: true });
 * // target is now { a: 100, b: { c: 20 } }, shallow update prevents deep merge
 * 
 * const toUpdate3 = { a: 200 };
 * update(target, toUpdate3, { exclude: 'a' });
 * // target is still { a: 100, b: { c: 20 } }, as 'a' was excluded from the update
 * ```
 */
export function update<T>(target: T, toUpdate: Partial<T>, options: UpdateOptions<T> = {}): void {
  if (!isObject(target) || !isObject(toUpdate)) return;

  let { shallow, exclude } = { ...defaultOptions, ...options };
  exclude = Array.isArray(exclude) ? exclude : [ exclude as Extract<keyof T, string> ];

  Object.entries(toUpdate).forEach(([prop, value]) => {
    if (!exclude.includes(prop as Extract<keyof T, string>)) {
      if ((target as Record<string, any>)[prop] !== value) {
        (target as Record<string, any>)[prop] = value;
      } else if (!shallow && isObject(value)) {
        update<T>((target as Record<string, any>)[prop], value as Partial<T>, options);
      }
    }
  });
}
