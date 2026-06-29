import { isObject } from '../isObject';
import { REF } from './constants';

/**
 * Checks whether the given target is a ref created by `ref()` or a computed value
 * (which are also treated as refs for dependency tracking purposes).
 *
 * It looks for the non-enumerable `REF` symbol that is attached using `setSymbolKey`.
 *
 * **Important:** `computed()` results intentionally carry the `REF` marker (in addition to `COMPUTED`)
 * so they are accepted by `effect()` sources and by `isRef()`. This preserves a unified "ref-like" contract.
 *
 * To be certain you have a *pure* ref (one created by `ref()`, not a computed), test with:
 *
 * ```ts
 * if (isRef(result) && !isComputed(result)) {
 *   // result is a plain ref() value, not a computed
 * }
 * ```
 *
 * @param target - The value to check.
 * @returns `true` if the target has the REF symbol and is an object, otherwise `false`.
 */
export function isRef(target: any): boolean {
  if (!isObject(target)) return false;
  return Object.hasOwn(target, REF);
}
