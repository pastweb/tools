import { isObject } from '../isObject';
import { GLOBAL_CONTEXT_TYPE } from './constants';

/**
 * Checks if the given target is a valid global context object.
 *
 * A global context is identified by the presence of the `GLOBAL_CONTEXT_TYPE` symbol
 * as a non-enumerable property.
 *
 * @param target - The value to check.
 * @returns `true` if the target is a global context object, otherwise `false`.
 *
 * @example
 * ```ts
 * if (isGlobalContext(someObject)) {
 *   // safe to use as global context
 * }
 * ```
 */
export function isGlobalContext(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, GLOBAL_CONTEXT_TYPE);
}
