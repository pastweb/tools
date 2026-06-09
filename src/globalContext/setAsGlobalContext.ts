import { setSymbolKey } from '../setSymbolKey';
import { GLOBAL_CONTEXT_TYPE } from './constants';
import type { GlobalContext } from './types';

/**
 * Marks the given target object as a Global Context by attaching the `GLOBAL_CONTEXT_TYPE` symbol.
 *
 * This function uses `setSymbolKey` to add a non-enumerable, non-writable, and non-configurable
 * symbol property, which is later used by `isGlobalContext()` to identify global context objects.
 *
 * @param target - The object to be marked as a global context.
 *
 * @example
 * ```ts
 * const myContext = reactive({});
 * setAsGlobalContext(myContext);
 *
 * isGlobalContext(myContext); // true
 * ```
 */
export function setAsGlobalContext(target: GlobalContext): void {
  setSymbolKey(target, GLOBAL_CONTEXT_TYPE);
}
