import { isObject } from '../../../isObject';
import { QUERY_KEY } from './constants';

/**
 * Checks whether a value has the own symbol marker for `useQuery` results.
 *
 * The marker is installed by {@link useQuery} or {@link setAsQuery}.
 * This checks the marker only; it does not validate the object's properties or methods.
 * Inherited markers do not match.
 *
 * @param target - The value to inspect.
 * @returns `true` when the value is an object with its own useQuery marker.
 *
 * @example
 * ```ts
 * import { isQuery, setAsQuery } from '@pastweb/tools';
 *
 * const result = {};
 * setAsQuery(result);
 * console.log(isQuery(result)); // true
 * console.log(isQuery({})); // false
 * ```
 */
export function isQuery(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, QUERY_KEY);
}
