import { setSymbolKey } from '../../../setSymbolKey';
import { INFINITE_QUERY_KEY } from './constants';

/**
 * Marks an object so {@link isInfiniteQuery} recognizes it as a `useInfiniteQuery` result.
 *
 * Mutates the target by adding a non-enumerable, non-writable, non-configurable
 * symbol property. It does not add query state, methods, or reactive behavior.
 * `useInfiniteQuery` already marks its own return value automatically.
 *
 * @param target - An object that can receive the marker property.
 * @returns Nothing; the target is modified in place.
 * @throws TypeError if the target cannot receive the marker property.
 *
 * @example
 * ```ts
 * import { isInfiniteQuery, setAsInfiniteQuery } from '@pastweb/tools';
 *
 * const result = {};
 * setAsInfiniteQuery(result);
 * console.log(isInfiniteQuery(result)); // true
 * console.log(Object.keys(result)); // []
 * ```
 */
export function setAsInfiniteQuery(target: any): void {
  setSymbolKey(target, INFINITE_QUERY_KEY);
}
