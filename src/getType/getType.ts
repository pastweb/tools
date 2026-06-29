/**
 * Determines the precise internal type of any JavaScript value.
 *
 * This is more reliable than the native `typeof` operator, which returns `"object"`
 * for `null`, arrays, and most other objects. It uses `Object.prototype.toString`
 * to extract the [[Class]] internal property (e.g. `"[object Array]"` → `"Array"`).
 *
 * @param target - Any JavaScript value (primitive, object, function, etc.).
 * @returns A string representing the type, such as `"String"`, `"Number"`, `"Boolean"`,
 *          `"Undefined"`, `"Null"`, `"Symbol"`, `"BigInt"`, `"Object"`, `"Array"`,
 *          `"Function"`, `"Date"`, `"RegExp"`, `"Map"`, `"Set"`, etc.
 *
 * @example
 * getType(42);              // "Number"
 * getType("hello");         // "String"
 * getType(true);            // "Boolean"
 * getType(undefined);       // "Undefined"
 * getType(null);            // "Null"
 * getType(Symbol("x"));     // "Symbol"
 * getType(123n);            // "BigInt"
 * getType([]);              // "Array"
 * getType({});              // "Object"
 * getType(() => {});        // "Function"
 * getType(new Date());      // "Date"
 * getType(/regex/);         // "RegExp"
 */
export function getType(target: any): string {
  return Object.prototype.toString.call(target).slice(8, -1);
}
