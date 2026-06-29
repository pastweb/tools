import { isObject } from '../isObject';
import { COMPUTED } from './constants';

/**
 * Checks whether the given target is a computed value created by `computed()`.
 *
 * It looks for the non-enumerable `COMPUTED` symbol that is attached using `setSymbolKey`
 * on the internal proxy/wrapper returned by `computed`.
 *
 * @param target - The value to check.
 * @returns `true` if the target has the COMPUTED symbol and is an object, otherwise `false`.
 */
export function isComputed(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, COMPUTED);
}
