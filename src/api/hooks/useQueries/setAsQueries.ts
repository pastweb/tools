import { setSymbolKey } from '../../../setSymbolKey';
import { QUERIES_KEY } from './constants';

/**
 * Marks an object so {@link isQueries} recognizes it as a `useQueries` result.
 *
 * Mutates the target by adding a non-enumerable, non-writable, non-configurable
 * symbol property. It does not add query state, methods, or reactive behavior.
 * `useQueries` already marks its own return value automatically.
 *
 * @param target - An object that can receive the marker property.
 * @returns Nothing; the target is modified in place.
 * @throws TypeError if the target cannot receive the marker property.
 *
 * @example
 * ```ts
 * import { isQueries, setAsQueries } from '@pastweb/tools';
 *
 * const result = {};
 * setAsQueries(result);
 * console.log(isQueries(result)); // true
 * console.log(Object.keys(result)); // []
 * ```
 */
export function setAsQueries(target: any): void {
  setSymbolKey(target, QUERIES_KEY);
}
