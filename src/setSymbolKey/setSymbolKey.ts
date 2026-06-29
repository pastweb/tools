import { DEFAULT_SYMBOL_DESCRIPTOR } from './constants';
import type { Descriptor } from './types';

/**
 * Attaches a symbol key to the target object using `Object.defineProperty`,
 * with a default descriptor that makes the property non-enumerable, non-writable,
 * and non-configurable.
 *
 * This is the recommended way to install internal "marker" symbols (e.g. `REF`,
 * `COMPUTED`, `REACTIVE`, `PORTAL`, `GLOBAL_CONTEXT_TYPE`) so that they are
 * invisible to normal enumeration (`for...in`, `Object.keys`, JSON.stringify, etc.)
 * but still detectable via `Object.hasOwn` or `Object.getOwnPropertySymbols`.
 *
 * @param target - The object to receive the symbol property.
 * @param symbol - The `Symbol` to use as the property key.
 * @param value - The value to store under the symbol (defaults to `true` for simple boolean markers).
 * @param descriptor - Optional descriptor overrides. Defaults to
 *   `{ configurable: false, enumerable: false, writable: false }` (the recommended
 *   non-enumerable marker shape).
 *
 * @example
 * ```ts
 * import { setSymbolKey, DEFAULT_SYMBOL_DESCRIPTOR } from '@pastweb/tools';
 *
 * const MY_MARKER = Symbol('myMarker');
 * const obj = {};
 *
 * setSymbolKey(obj, MY_MARKER);           // uses defaults
 * setSymbolKey(obj, MY_MARKER, 'hello');  // custom value
 *
 * console.log(obj[MY_MARKER]);                    // 'hello' (or true)
 * console.log(Object.keys(obj));                  // []  -- hidden
 * console.log(Object.getOwnPropertySymbols(obj)); // [ MY_MARKER ]
 * ```
 *
 * @see DEFAULT_SYMBOL_DESCRIPTOR
 * @see Descriptor
 */
export function setSymbolKey(
  target: Record<PropertyKey, any>,
  symbol: symbol, value: any = true,
  descriptor: Descriptor = DEFAULT_SYMBOL_DESCRIPTOR,
): void {
  Object.defineProperty(target, symbol, {
    ...descriptor,
    value,
  });
}
