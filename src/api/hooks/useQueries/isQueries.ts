import { isObject } from '../../../isObject';
import { QUERIES_KEY } from './constants';

/**
 * Checks whether a value has the own symbol marker for `useQueries` results.
 *
 * The marker is installed by {@link useQueries} or {@link setAsQueries}.
 * This checks the marker only; it does not validate the object's properties or methods.
 * Inherited markers do not match.
 *
 * @param target - The value to inspect.
 * @returns `true` when the value is an object with its own useQueries marker.
 *
 * @example
 * ```ts
 * import { isQueries, setAsQueries } from '@pastweb/tools';
 *
 * const result = {};
 * setAsQueries(result);
 * console.log(isQueries(result)); // true
 * console.log(isQueries({})); // false
 * ```
 */
export function isQueries(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, QUERIES_KEY);
}
