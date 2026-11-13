import { setSymbolKey } from '../../../setSymbolKey';
import { QUERY_KEY } from './constants';

/**
 * Marks an object so {@link isQuery} recognizes it as a `useQuery` result.
 *
 * Mutates the target by adding a non-enumerable, non-writable, non-configurable
 * symbol property. It does not add query state, methods, or reactive behavior.
 * `useQuery` already marks its own return value automatically.
 *
 * @param target - An object that can receive the marker property.
 * @returns Nothing; the target is modified in place.
 * @throws TypeError if the target cannot receive the marker property.
 *
 * @example
 * ```ts
 * import { isQuery, setAsQuery } from '@pastweb/tools';
 *
 * const result = {};
 * setAsQuery(result);
 * console.log(isQuery(result)); // true
 * console.log(Object.keys(result)); // []
 * ```
 */
export function setAsQuery(target: any): void {
  setSymbolKey(target, QUERY_KEY);
}
