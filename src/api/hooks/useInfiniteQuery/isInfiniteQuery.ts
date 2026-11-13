import { isObject } from '../../../isObject';
import { INFINITE_QUERY_KEY } from './constants';

/**
 * Checks whether a value has the own symbol marker for `useInfiniteQuery` results.
 *
 * The marker is installed by {@link useInfiniteQuery} or {@link setAsInfiniteQuery}.
 * This checks the marker only; it does not validate the object's properties or methods.
 * Inherited markers do not match.
 *
 * @param target - The value to inspect.
 * @returns `true` when the value is an object with its own useInfiniteQuery marker.
 *
 * @example
 * ```ts
 * import { isInfiniteQuery, setAsInfiniteQuery } from '@pastweb/tools';
 *
 * const result = {};
 * setAsInfiniteQuery(result);
 * console.log(isInfiniteQuery(result)); // true
 * console.log(isInfiniteQuery({})); // false
 * ```
 */
export function isInfiniteQuery(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, INFINITE_QUERY_KEY);
}
