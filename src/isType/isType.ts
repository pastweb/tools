import { getType } from '../getType';

/**
 * Checks whether a given value matches a specified type.
 *
 * This utility relies on `getType` (which uses `Object.prototype.toString`)
 * for accurate type detection—more reliable than the native `typeof` operator
 * (e.g. it correctly distinguishes `null`, arrays, and other objects).
 *
 * **Important:** The function explicitly returns `false` for `null` and `undefined`
 * (regardless of the `type` argument) to prevent common pitfalls with loose type checks.
 *
 * @param type - The expected type name as returned by `getType` (e.g. `"String"`, `"Number"`, `"Array"`, `"Object"`, `"Null"`, `"Undefined"`, `"Date"`, etc.).
 * @param target - The value to test.
 * @returns `true` if the value is not `null`/`undefined` **and** `getType(target) === type`; otherwise `false`.
 *
 * @example
 * isType('String', 'Hello');      // true
 * isType('Number', 42);           // true
 * isType('Array', [1, 2, 3]);     // true
 * isType('Object', { a: 1 });     // true
 * isType('Null', null);           // false  (explicit guard)
 * isType('Undefined', undefined); // false  (explicit guard)
 * isType('Date', new Date());     // true
 * isType('RegExp', /foo/);        // true
 *
 * @see getType
 */
export function isType(type: string, target: any): boolean {
  return target !== undefined && target !== null && getType(target) === type;
}
