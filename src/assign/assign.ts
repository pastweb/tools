import { isObject } from '../isObject';

/**
 * Assigns a value to a target object at a given path. Supports immutable updates.
 *
 * @param {Record<string, any>} target - The target object to assign the value to.
 * @param {string} path - The path at which to assign the value, specified as a dot-separated string.
 * @param {any} value - The value to assign.
 * @param {boolean} [immutable=false] - If true, performs an immutable update, returning a new object.
 * @returns {void | Record<string, any>} - If `immutable` is true, returns the new object with the assigned value.
 *                                          Otherwise, returns void.
 */
export function assign(target: Record<string, any>, path: string, value: any, immutable = false): void | Record<string, any> {
  if (!isObject(target) || !path) return immutable ? { ...target } : undefined;

  const keys = path.split('.');

  // ========================
  // Mutable version (fast)
  // ========================
  if (!immutable) {
    let current: any = target;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return;
  }

  // ========================
  // Immutable version (clean recursive)
  // ========================
  function setImmutable(obj: Record<string, any>, remainingKeys: string[], newValue: any): Record<string, any> {
    const [key, ...rest] = remainingKeys;

    // Final key → just assign the value (works whether it's primitive or object!)
    if (rest.length === 0) {
      return {
        ...obj,
        [key]: newValue,
      };
    }

    // Intermediate key → create new object along the path
    const nextObj = isObject(obj[key]) ? obj[key] : {};

    return {
      ...obj,
      [key]: setImmutable(nextObj, rest, newValue),
    };
  }

  return setImmutable(target, keys, value);
}
