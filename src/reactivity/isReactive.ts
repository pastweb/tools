import { isObject } from '../isObject';
import { REACTIVE } from './constants';

/**
 * Checks whether the given target is a reactive object created by `reactive()`.
 *
 * It looks for the non-enumerable `REACTIVE` symbol that is attached using `setSymbolKey`.
 *
 * @param target - The value to check.
 * @returns `true` if the target has the REACTIVE symbol and is an object, otherwise `false`.
 */
export function isReactive(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, REACTIVE);
}
