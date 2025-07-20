import type { MemoCallback } from './types';

/**
 * Retrieves the matching key from a map based on the provided arguments.
 * If no matching key is found, the function returns the provided arguments.
 *
 * @param map - The map storing cached results, where each key is an array of arguments.
 * @param args - The current function arguments to be checked against the map's keys.
 * @returns The matching key from the map if found, otherwise the provided arguments.
 */
export function getKey(map:Map<any[], any>, args: any[]) {
  if (!map.size) return args;

  const keys = [...map.keys()];
  let same = true;

  for (let j=0; j<keys.length; j++) {
    const key = keys[j];
    if (same && j === keys.length -1) return key;

    for (let i=0; i<key.length; i++) {
      if (key[i] === args[i]) same = true;
      else same = false;

      if (!same) return args;
      if (i === key.length - 1) return key;
    }
  }
}

/**
 * A memoization function that caches the result of a function based on its arguments.
 * If the function is called again with the same arguments, the cached result is returned instead of recomputing.
 *
 * @param func - The function to be memoized.
 * @returns A memoized version of the provided function.
 */
export function memo(func: MemoCallback) {
  function memorized(...args: any[]) {
    const cache: Map<any[], any> = (memorized as any).cache || new Map<any[], any>();
    const key = getKey(cache, args) as any[];
    (memorized as any).cache = cache;
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    cache.set(key, func.apply(this, args));
    return cache.get(key);
  };
  
  return memorized;
}