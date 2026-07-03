import { isType } from '../isType';

/**
 * Returns a stable source-code signature for a function value.
 *
 * The signature is generated with `Function.prototype.toString`, which makes it
 * useful for development tooling that needs to detect whether a function body
 * changed while preserving normal runtime state. Non-function values return an
 * empty string so callers can use the helper defensively.
 *
 * @typeParam T - Value type to inspect.
 * @param fn - Value that may be a function.
 * @returns The function source signature, or an empty string for non-functions.
 *
 * @example
 * ```ts
 * const first = getFunctionSignature(() => 'first');
 * const second = getFunctionSignature(() => 'second');
 *
 * console.log(first === second); // false
 * ```
 */
export function getFunctionSignature<T = unknown>(fn: T): string {
  return isType('Function', fn) ? Function.prototype.toString.call(fn) : '';
}
