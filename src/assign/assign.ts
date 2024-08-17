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
  if (!isObject(target) || !path.length) return target;

  const components = path.split('.');
  
  if (immutable) {
    const [ prop, ...rest ] = components;
    
    if (!target[prop]) {
      target = { ...target };
      
      Object.defineProperty(target, prop, {
        value: rest.length ? {} : value,
        configurable: false,
        enumerable: true,
        writable: false,
      });
    }

    return Object.entries(target).reduce((acc, [propName, propValue]) => ({
      ...acc,
      [propName]: isObject(propValue) && rest.length ? assign(propValue, rest.join('.'), value, true) : propValue,
    }), {});
  } else {
    let curr = target;

    for (let i=0; i<components.length; i++) {
      const prop = components[i];
      
      if (i === components.length - 1) {
        curr[prop] = value;
        return;
      }

      if (!curr[prop]) {
        curr[prop] = {};
        curr = curr[prop];
        continue;
      }

      if (!isObject(curr[prop])) return;

      curr = curr[prop];
    }
  }
}
