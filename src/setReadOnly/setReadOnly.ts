/**
 * Makes one or more properties of an object read-only (immutable) by setting `writable: false` and `configurable: false` using `Object.defineProperty`.
 *
 * Once a property is made read-only:
 * - Its value cannot be reassigned.
 * - It cannot be deleted or reconfigured (e.g. you cannot change it back to writable).
 *
 * Only properties that already exist on the target object are affected. Non-existing property names passed in the `prop` list are silently ignored.
 *
 * **Note:** In non-strict mode, assignments to non-writable properties fail silently. In strict mode they throw a `TypeError`.
 *
 * @param target - The target object whose properties will be made read-only. Must be an object.
 * @param prop - A single property key (string) or an array of property keys to make read-only.
 *               Only keys that exist on `target` will be processed.
 *
 * @returns `void`
 *
 * @example
 * ```ts
 * const obj = { a: 1, b: 2, c: 3 };
 *
 * // Make a single property read-only
 * setReadOnly(obj, 'a');
 * obj.a = 99; // throws TypeError (in strict mode) or silently ignored
 * console.log(obj.a); // 1
 *
 * // Make multiple properties read-only
 * setReadOnly(obj, ['b', 'c']);
 * obj.b = 100; // read-only
 * obj.c = 200; // read-only
 *
 * // Non-existing properties are ignored
 * setReadOnly(obj, ['a', 'doesNotExist']);
 * // only 'a' (and previously 'b','c') are affected
 * ```
 */
export function setReadOnly<T extends object>(target: T, prop: Extract<keyof T, string> | Extract<keyof T, string>[]): void {
  const props = Array.isArray(prop) ? prop : [prop];

  Object.keys(target).forEach(p => {
    if (props.includes(p as Extract<keyof T, string>)) {
      Object.defineProperty(target, p, {
        writable: false,
        configurable: false,
      });
    }
  });
}
