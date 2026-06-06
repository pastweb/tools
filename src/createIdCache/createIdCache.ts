import { hashID } from '../hashID';
import { cacheIds } from './constants';
import type { IdCache } from './types';

/**
 * Creates a cache for managing unique IDs within different scopes.
 *
 * @returns {IdCache} An object containing methods to interact with the ID cache.
 *
 * @example
 * const idCache = createIdCache();
 * const id1 = idCache.getId('scope1', 'prefix');
 * console.log(idCache.has('scope1', id1)); // true
 * idCache.removeId('scope1', id1);
 * console.log(idCache.has('scope1', id1)); // false
 */
export function createIdCache(): IdCache {
  /**
   * Generates and retrieves a unique ID for a given scope.
   *
   * @param {symbol} scopeName - The symbol representing the scope for which to generate the ID.
   * @param {string} [prefix=''] - An optional prefix for the generated ID.
   * @returns {string} The generated unique ID.
   */
  function getId(scopeName: symbol, prefix: string = ''): string {
    if (!cacheIds.has(scopeName)) {
      cacheIds.set(scopeName, new Set());
    }

    const ids = cacheIds.get(scopeName) as Set<string>;
    const id = hashID([...ids], { prefix });
    ids.add(id);

    return id;
  }

  /**
   * Removes an ID from a given scope.
   *
   * @param {symbol} scopeName - The symbol representing the scope from which to remove the ID.
   * @param {string} id - The ID to remove.
   * @returns {void}
   */
  function removeId(scopeName: symbol, id: string): void {
    if (cacheIds.has(scopeName)) {
      const ids = cacheIds.get(scopeName) as Set<string>;
      ids.delete(id);

      if (ids.size === 0) {
        cacheIds.delete(scopeName);
      }
    }
  }

  /**
   * Checks if an ID exists within a given scope.
   *
   * @param {symbol} scopeName - The symbol representing the scope to check.
   * @param {string} id - The ID to check for existence.
   * @returns {boolean} `true` if the ID exists in the scope, `false` otherwise.
   */
  function has(scopeName: symbol, id: string): boolean {
    let result = false;

    if (cacheIds.has(scopeName)) {
      const ids = cacheIds.get(scopeName) as Set<string>;
      result = ids.has(id);
    }

    return result;
  }

  return Object.freeze({
    getId,
    removeId,
    has,
  });
}
