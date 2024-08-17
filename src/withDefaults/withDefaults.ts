/**
 * Merges a target object with default values, ensuring that any missing properties in the target
 * are filled in with the defaults. If a property exists in both the target and the defaults, 
 * the target's value is retained.
 *
 * @template WithDefaults - The type that extends an empty object, representing the resulting merged object type.
 *
 * @param {object} target - The target object to which the defaults will be applied.
 * @param {object} defaults - The object containing default values for properties.
 * 
 * @returns {WithDefaults} A new object that merges the target object with the default values.
 *                         The resulting object includes all properties from the target object, with any 
 *                         missing properties filled in from the defaults object.
 *
 * @example
 * ```typescript
 * const target = { a: 1, b: 2 };
 * const defaults = { b: 10, c: 3 };
 * 
 * const result = withDefaults(target, defaults);
 * // result is { a: 1, b: 2, c: 3 }
 * ```
 */
export function withDefaults<WithDefaults extends {} = {}>(target : any & object, defaults: any & object): WithDefaults {
  const withDefaults = Object.entries(defaults).reduce((acc, [prop, value]) => ({
    ...acc,
    [prop]: (target as any)[prop] !== undefined ? (target as any)[prop] : value,
  }), {} as WithDefaults);

  return { ...target, ...withDefaults } as WithDefaults;
}
