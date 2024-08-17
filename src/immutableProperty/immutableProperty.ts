/**
 * Makes specified properties of an object immutable by setting their writable and configurable attributes to false.
 *
 * @param target - The object whose properties are to be made immutable.
 * @param prop - The property or array of properties to be made immutable. The properties must exist in the target object.
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2 };
 * immutableProperty(obj, 'a');
 * obj.a = 3; // This will throw an error because property 'a' is now immutable.
 * 
 * const obj2 = { x: 10, y: 20 };
 * immutableProperty(obj2, ['x', 'y']);
 * obj2.x = 15; // This will throw an error because property 'x' is now immutable.
 * obj2.y = 25; // This will throw an error because property 'y' is now immutable.
 * ```
 */
export function immutableProperty<T extends object>(target: T, prop: Extract<keyof T, string> | Extract<keyof T, string>[]): void {
  const props = Array.isArray(prop) ? prop : [ prop ];

  Object.keys(target).forEach(p => {
    if (props.includes(p as Extract<keyof T, string>)) {
      Object.defineProperty(target, p, {
        writable: false,
        configurable: false,
      });
    }
  });
}
