import { isObject } from '../isObject';

/**
 * Safely retrieves the value from a nested property within an object using a dot-separated path.
 * If the path does not exist, a default value can be returned.
 *
 * @param target - The object from which to retrieve the value.
 * @param path - A dot-separated string that represents the path of the property to retrieve.
 * @param defaultValue - Optional. The value to return if the property is not found. Defaults to `undefined`.
 * @returns The value at the specified path if it exists, otherwise the `defaultValue`.
 * 
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 42 } } };
 * const value = select(obj, 'a.b.c'); // returns 42
 * const missingValue = select(obj, 'a.b.x', 'default'); // returns 'default'
 * ```
 */
export function select(target: Record<string, any>, path: string, defaultValue?: any): any {
  if (!isObject(target)) return defaultValue;

  const components = path.split('.');
  const [prop, ...rest] = components;
  
  if (!isObject(target[prop]) && rest.length) defaultValue;

  if (!rest.length) return target[prop] || defaultValue;

  return select(target[prop], rest.join('.'), defaultValue);
}
